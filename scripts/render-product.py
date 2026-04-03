"""
Blender render script — call via:
  blender --background --python scripts/render-product.py -- <stl_path> <output_path>
"""
import bpy
import sys
import math


def hex_to_rgba(hex_color):
    h = hex_color.lstrip('#')
    return tuple(int(h[i:i+2], 16) / 255.0 for i in (0, 2, 4)) + (1.0,)


def clear_scene():
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete(use_global=False)
    for block in list(bpy.data.meshes) + list(bpy.data.cameras) + list(bpy.data.lights):
        try:
            bpy.data.batch_remove([block])
        except Exception:
            pass


def render_stl(stl_path, output_path, color_hex='#F0F0F0'):
    clear_scene()

    # --- Import ---
    bpy.ops.import_mesh.stl(filepath=stl_path)
    obj = bpy.context.selected_objects[0]
    bpy.context.view_layer.objects.active = obj

    # Center geometry at origin
    bpy.ops.object.origin_set(type='ORIGIN_GEOMETRY', center='BOUNDS')
    obj.location = (0, 0, 0)

    # Smooth shading
    bpy.ops.object.shade_smooth()
    obj.data.use_auto_smooth = True
    obj.data.auto_smooth_angle = math.radians(60)

    # Scale object so longest axis = 1 unit (camera stays fixed)
    max_dim = max(obj.dimensions)
    scale = 1.0 / max_dim if max_dim > 0 else 1.0
    obj.scale = (scale, scale, scale)
    bpy.ops.object.transform_apply(scale=True)

    # --- Material ---
    mat = bpy.data.materials.new(name='ProductMat')
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes.get('Principled BSDF')
    bsdf.inputs['Base Color'].default_value = hex_to_rgba(color_hex)
    bsdf.inputs['Roughness'].default_value = 0.35
    if obj.data.materials:
        obj.data.materials[0] = mat
    else:
        obj.data.materials.append(mat)

    # --- Camera ---
    cam_data = bpy.data.cameras.new('Camera')
    cam_data.lens = 70          # slight telephoto = less distortion
    cam_obj = bpy.data.objects.new('Camera', cam_data)
    bpy.context.collection.objects.link(cam_obj)
    bpy.context.scene.camera = cam_obj

    # Isometric-ish angle: slightly above, to the front-right
    cam_obj.location = (1.8, -1.8, 1.4)
    cam_obj.rotation_euler = (math.radians(58), 0, math.radians(45))

    # Track-to constraint so camera always looks at object
    con = cam_obj.constraints.new('TRACK_TO')
    con.target = obj
    con.track_axis = 'TRACK_NEGATIVE_Z'
    con.up_axis = 'UP_Y'

    # --- Lighting (three-point) ---
    def add_area_light(location, rotation_euler, energy, size):
        d = bpy.data.lights.new(name='Light', type='AREA')
        d.energy = energy
        d.size = size
        o = bpy.data.objects.new(name='Light', object_data=d)
        bpy.context.collection.objects.link(o)
        o.location = location
        o.rotation_euler = rotation_euler
        return o

    # Key
    add_area_light((3, -2, 4),   (math.radians(-45), 0, math.radians(45)),  600, 3)
    # Fill
    add_area_light((-3, 1, 2),   (math.radians(-20), 0, math.radians(-120)), 200, 4)
    # Rim
    add_area_light((0, 4, -0.5), (math.radians(80), 0, 0),                  150, 2)

    # --- World background: near-white gradient feel via solid color ---
    world = bpy.context.scene.world
    world.use_nodes = True
    bg_node = world.node_tree.nodes.get('Background')
    if bg_node:
        bg_node.inputs[0].default_value = (0.92, 0.92, 0.92, 1.0)
        bg_node.inputs[1].default_value = 1.0

    # --- Render settings ---
    scene = bpy.context.scene
    scene.render.engine = 'CYCLES'
    scene.cycles.samples = 96
    scene.cycles.use_denoising = True
    scene.render.resolution_x = 1024
    scene.render.resolution_y = 1024
    scene.render.film_transparent = False
    scene.render.filepath = output_path
    scene.render.image_settings.file_format = 'JPEG'
    scene.render.image_settings.quality = 92

    print(f'Rendering {stl_path} → {output_path}')
    bpy.ops.render.render(write_still=True)
    print('Done.')


# Args after '--' are passed through to the script
argv = sys.argv
try:
    idx = argv.index('--')
    args = argv[idx + 1:]
except ValueError:
    args = []

if len(args) < 2:
    print('Usage: blender --background --python render-product.py -- <stl_path> <output_path> [color_hex]')
    sys.exit(1)

stl_path   = args[0]
output_path = args[1]
color_hex  = args[2] if len(args) > 2 else '#F0F0F0'

render_stl(stl_path, output_path, color_hex)
