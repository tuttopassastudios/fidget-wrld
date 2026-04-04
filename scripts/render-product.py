"""
Blender render script — PLA 3D-print simulation with procedural layer lines.
Usage:
  blender --background --python render-product.py -- <stl_path> <output_path> [color_hex] [material_type]
  material_type: standard (default) | translucent | gradient
"""
import bpy
import sys
import math


def hex_to_rgb(hex_color):
    h = hex_color.lstrip('#')
    return tuple(int(h[i:i+2], 16) / 255.0 for i in (0, 2, 4))


def hex_to_rgba(hex_color):
    return hex_to_rgb(hex_color) + (1.0,)


def clear_scene():
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete(use_global=False)
    for block in list(bpy.data.meshes) + list(bpy.data.cameras) + list(bpy.data.lights):
        try:
            bpy.data.batch_remove([block])
        except Exception:
            pass


def build_standard_material(mat, color_hex):
    """PLA matte material with procedural layer lines on Z axis."""
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    links = mat.node_tree.links
    nodes.clear()

    output = nodes.new('ShaderNodeOutputMaterial')
    bsdf   = nodes.new('ShaderNodeBsdfPrincipled')
    bsdf.inputs['Roughness'].default_value = 0.72
    bsdf.inputs['Specular'].default_value  = 0.2
    bsdf.inputs['Metallic'].default_value  = 0.0
    bsdf.location  = (-200, 0)
    output.location = (200, 0)

    # Object-space coordinates so layer lines are consistent regardless of object size
    tex_coord = nodes.new('ShaderNodeTexCoord')
    tex_coord.location = (-800, 0)

    # Wave texture — horizontal bands along Z = layer lines
    wave = nodes.new('ShaderNodeTexWave')
    wave.wave_type       = 'BANDS'
    wave.bands_direction = 'Z'
    wave.inputs['Scale'].default_value            = 90.0
    wave.inputs['Distortion'].default_value       = 0.4
    wave.inputs['Detail'].default_value           = 3.0
    wave.inputs['Detail Scale'].default_value     = 1.5
    wave.inputs['Detail Roughness'].default_value = 0.65
    wave.location = (-600, 0)
    links.new(tex_coord.outputs['Object'], wave.inputs['Vector'])

    # Ramp: dark at layer seam, bright in layer body
    ramp = nodes.new('ShaderNodeValToRGB')
    ramp.color_ramp.elements[0].position = 0.0
    ramp.color_ramp.elements[0].color    = (0.76, 0.76, 0.76, 1.0)
    ramp.color_ramp.elements[1].position = 0.35
    ramp.color_ramp.elements[1].color    = (1.0, 1.0, 1.0, 1.0)
    ramp.location = (-400, 100)
    links.new(wave.outputs['Fac'], ramp.inputs['Fac'])

    # Base color node
    rgb_node = nodes.new('ShaderNodeRGB')
    rgb_node.outputs[0].default_value = hex_to_rgba(color_hex)
    rgb_node.location = (-400, -150)

    # Multiply base color by layer pattern
    mix_color = nodes.new('ShaderNodeMixRGB')
    mix_color.blend_type = 'MULTIPLY'
    mix_color.inputs['Fac'].default_value = 1.0
    mix_color.location = (-100, 100)
    links.new(rgb_node.outputs['Color'],  mix_color.inputs[1])
    links.new(ramp.outputs['Color'],      mix_color.inputs[2])
    links.new(mix_color.outputs['Color'], bsdf.inputs['Base Color'])

    # Subtle bump at layer seam for depth
    bump = nodes.new('ShaderNodeBump')
    bump.inputs['Strength'].default_value = 0.28
    bump.inputs['Distance'].default_value = 0.015
    bump.location = (-100, -150)
    links.new(ramp.outputs['Color'],  bump.inputs['Height'])
    links.new(bump.outputs['Normal'], bsdf.inputs['Normal'])

    links.new(bsdf.outputs['BSDF'], output.inputs['Surface'])


def build_translucent_material(mat):
    """Clear/transparent PLA — blue-tinted with soft internal glow."""
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    links = mat.node_tree.links
    nodes.clear()

    output = nodes.new('ShaderNodeOutputMaterial')
    bsdf   = nodes.new('ShaderNodeBsdfPrincipled')
    bsdf.inputs['Base Color'].default_value   = (0.38, 0.68, 1.00, 1.0)
    bsdf.inputs['Roughness'].default_value    = 0.04
    bsdf.inputs['Transmission'].default_value = 0.88
    bsdf.inputs['IOR'].default_value          = 1.47   # PLA refractive index
    bsdf.inputs['Specular'].default_value     = 0.6
    links.new(bsdf.outputs['BSDF'], output.inputs['Surface'])


def build_gradient_material(mat):
    """Pink (bottom Z) → blue (top Z) gradient with PLA layer lines."""
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    links = mat.node_tree.links
    nodes.clear()

    output = nodes.new('ShaderNodeOutputMaterial')
    bsdf   = nodes.new('ShaderNodeBsdfPrincipled')
    bsdf.inputs['Roughness'].default_value = 0.72
    bsdf.inputs['Specular'].default_value  = 0.2
    bsdf.location  = (-200, 0)
    output.location = (200, 0)

    # Object-space Z for both gradient and layer lines
    tex_coord    = nodes.new('ShaderNodeTexCoord')
    separate_xyz = nodes.new('ShaderNodeSeparateXYZ')
    links.new(tex_coord.outputs['Object'], separate_xyz.inputs[0])
    separate_xyz.location = (-900, 200)

    # Map object-space Z (-0.5 → 0.5) to 0 → 1
    map_range = nodes.new('ShaderNodeMapRange')
    map_range.inputs['From Min'].default_value = -0.5
    map_range.inputs['From Max'].default_value  =  0.5
    map_range.inputs['To Min'].default_value   =  0.0
    map_range.inputs['To Max'].default_value   =  1.0
    map_range.location = (-700, 200)
    links.new(separate_xyz.outputs[2], map_range.inputs['Value'])

    # Colour gradient: hot pink → ocean blue
    grad_ramp = nodes.new('ShaderNodeValToRGB')
    grad_ramp.color_ramp.elements[0].position = 0.0
    grad_ramp.color_ramp.elements[0].color    = (0.925, 0.282, 0.600, 1.0)  # #EC4899
    grad_ramp.color_ramp.elements[1].position = 1.0
    grad_ramp.color_ramp.elements[1].color    = (0.231, 0.510, 0.965, 1.0)  # #3B82F6
    grad_ramp.location = (-500, 200)
    links.new(map_range.outputs['Result'], grad_ramp.inputs['Fac'])

    # Layer lines (same wave as standard)
    wave = nodes.new('ShaderNodeTexWave')
    wave.wave_type       = 'BANDS'
    wave.bands_direction = 'Z'
    wave.inputs['Scale'].default_value            = 90.0
    wave.inputs['Distortion'].default_value       = 0.4
    wave.inputs['Detail'].default_value           = 3.0
    wave.inputs['Detail Scale'].default_value     = 1.5
    wave.inputs['Detail Roughness'].default_value = 0.65
    wave.location = (-700, -100)
    links.new(tex_coord.outputs['Object'], wave.inputs['Vector'])

    layer_ramp = nodes.new('ShaderNodeValToRGB')
    layer_ramp.color_ramp.elements[0].position = 0.0
    layer_ramp.color_ramp.elements[0].color    = (0.76, 0.76, 0.76, 1.0)
    layer_ramp.color_ramp.elements[1].position = 0.35
    layer_ramp.color_ramp.elements[1].color    = (1.0, 1.0, 1.0, 1.0)
    layer_ramp.location = (-500, -100)
    links.new(wave.outputs['Fac'], layer_ramp.inputs['Fac'])

    # Combine: gradient × layer pattern
    mix_color = nodes.new('ShaderNodeMixRGB')
    mix_color.blend_type = 'MULTIPLY'
    mix_color.inputs['Fac'].default_value = 1.0
    mix_color.location = (-200, 100)
    links.new(grad_ramp.outputs['Color'],  mix_color.inputs[1])
    links.new(layer_ramp.outputs['Color'], mix_color.inputs[2])
    links.new(mix_color.outputs['Color'],  bsdf.inputs['Base Color'])

    bump = nodes.new('ShaderNodeBump')
    bump.inputs['Strength'].default_value = 0.28
    bump.inputs['Distance'].default_value = 0.015
    bump.location = (-200, -200)
    links.new(layer_ramp.outputs['Color'], bump.inputs['Height'])
    links.new(bump.outputs['Normal'],      bsdf.inputs['Normal'])

    links.new(bsdf.outputs['BSDF'], output.inputs['Surface'])


def render_stl(stl_path, output_path, color_hex='#3B82F6', material_type='standard',
               rot_x=0.0, rot_y=0.0, rot_z=0.0):
    clear_scene()

    # --- Import ---
    bpy.ops.import_mesh.stl(filepath=stl_path)
    obj = bpy.context.selected_objects[0]
    bpy.context.view_layer.objects.active = obj

    # Apply rotation correction BEFORE centering (degrees → radians)
    if rot_x or rot_y or rot_z:
        obj.rotation_euler = (
            math.radians(rot_x),
            math.radians(rot_y),
            math.radians(rot_z),
        )
        bpy.ops.object.transform_apply(rotation=True)

    # Center geometry at origin
    bpy.ops.object.origin_set(type='ORIGIN_GEOMETRY', center='BOUNDS')
    obj.location = (0, 0, 0)

    # Smooth shading
    bpy.ops.object.shade_smooth()
    obj.data.use_auto_smooth = True
    obj.data.auto_smooth_angle = math.radians(60)

    # Scale so longest axis = 1 unit (camera stays fixed)
    max_dim = max(obj.dimensions)
    scale   = 1.0 / max_dim if max_dim > 0 else 1.0
    obj.scale = (scale, scale, scale)
    bpy.ops.object.transform_apply(scale=True)

    # --- Material ---
    mat = bpy.data.materials.new(name='ProductMat')
    if material_type == 'translucent':
        build_translucent_material(mat)
    elif material_type == 'gradient':
        build_gradient_material(mat)
    else:
        build_standard_material(mat, color_hex)

    if obj.data.materials:
        obj.data.materials[0] = mat
    else:
        obj.data.materials.append(mat)

    # --- Camera ---
    cam_data = bpy.data.cameras.new('Camera')
    cam_data.lens = 120          # tight telephoto — fills frame, emphasises PLA detail
    cam_obj = bpy.data.objects.new('Camera', cam_data)
    bpy.context.collection.objects.link(cam_obj)
    bpy.context.scene.camera = cam_obj
    cam_obj.location        = (1.8, -1.8, 1.3)
    cam_obj.rotation_euler  = (math.radians(58), 0, math.radians(45))

    con = cam_obj.constraints.new('TRACK_TO')
    con.target     = obj
    con.track_axis = 'TRACK_NEGATIVE_Z'
    con.up_axis    = 'UP_Y'

    # --- Lighting (studio four-point) ---
    def add_area_light(location, rotation_euler, energy, size):
        d = bpy.data.lights.new(name='Light', type='AREA')
        d.energy = energy
        d.size   = size
        o = bpy.data.objects.new(name='Light', object_data=d)
        bpy.context.collection.objects.link(o)
        o.location       = location
        o.rotation_euler = rotation_euler
        return o

    # Key — bright, front-right-above
    add_area_light((3,  -2,  4),   (math.radians(-45), 0, math.radians(45)),   700, 3)
    # Fill — soft, left side
    add_area_light((-3,  1,  2),   (math.radians(-20), 0, math.radians(-120)), 260, 5)
    # Rim — behind-top for edge separation
    add_area_light((0,   4, -0.5), (math.radians(80),  0, 0),                  180, 2)
    # Top fill — brightens top surfaces
    add_area_light((0,   0,  5),   (0, 0, 0),                                  130, 4)

    # --- World background: light gray studio feel ---
    world = bpy.context.scene.world
    world.use_nodes = True
    bg_node = world.node_tree.nodes.get('Background')
    if bg_node:
        bg_node.inputs[0].default_value = (0.90, 0.90, 0.90, 1.0)
        bg_node.inputs[1].default_value = 1.0

    # --- Render settings ---
    scene = bpy.context.scene
    scene.render.engine            = 'CYCLES'
    scene.cycles.samples           = 128
    scene.cycles.use_denoising     = True
    scene.render.resolution_x      = 1024
    scene.render.resolution_y      = 1024
    scene.render.film_transparent  = False
    scene.render.filepath          = output_path
    scene.render.image_settings.file_format = 'JPEG'
    scene.render.image_settings.quality     = 92

    print(f'Rendering {stl_path} -> {output_path} [{material_type}]')
    bpy.ops.render.render(write_still=True)
    print('Done.')


# --- Entry point ---
argv = sys.argv
try:
    idx  = argv.index('--')
    args = argv[idx + 1:]
except ValueError:
    args = []

if len(args) < 2:
    print('Usage: blender --background --python render-product.py -- '
          '<stl_path> <output_path> [color_hex] [material_type] [rot_x] [rot_y] [rot_z]')
    sys.exit(1)

stl_path      = args[0]
output_path   = args[1]
color_hex     = args[2] if len(args) > 2 else '#3B82F6'
material_type = args[3] if len(args) > 3 else 'standard'
rot_x         = float(args[4]) if len(args) > 4 else 0.0
rot_y         = float(args[5]) if len(args) > 5 else 0.0
rot_z         = float(args[6]) if len(args) > 6 else 0.0

render_stl(stl_path, output_path, color_hex, material_type, rot_x, rot_y, rot_z)
