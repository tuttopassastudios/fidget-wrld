"""
Blender script: imports Dummy 13 individual part STLs, roughly assembles them
into a standing T-pose, and renders PLA product photos in 6 colors.

Usage:
  blender --background --python scripts/assemble-dummy13.py -- <color_hex> <output_path> [material_type]
"""
import bpy, sys, math, os

# ── helpers ────────────────────────────────────────────────────────────────
def hex_to_rgb(h):
    h = h.lstrip('#')
    return tuple(int(h[i:i+2], 16) / 255.0 for i in (0, 2, 4))

def hex_to_rgba(h): return hex_to_rgb(h) + (1.0,)

def clear_scene():
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete()
    for block in list(bpy.data.meshes) + list(bpy.data.cameras) + list(bpy.data.lights):
        try: bpy.data.batch_remove([block])
        except: pass

def import_stl(path):
    bpy.ops.import_mesh.stl(filepath=path)
    return bpy.context.selected_objects[0]

# ── part directories ───────────────────────────────────────────────────────
BASE  = r'C:\Users\espom\Downloads\Dummy+13+-+version+1.0!'
ARMOR = os.path.join(BASE, 'Individual parts - armor')
FRAME = os.path.join(BASE, 'Individual parts - frame')

# Part → (filename, directory, (x, z)) — T-pose placement
# X = left/right offset (mm scale), Z = height from ground (mm scale)
# Bilateral parts share X=0; camera/join handles the result.
PARTS = [
    # ── Frame (inner skeleton) ─────────────────────────────────
    ('frame, head.stl',          FRAME, ( 0, 265)),
    ('frame, neck.stl',          FRAME, ( 0, 245)),
    ('frame, chest.stl',         FRAME, ( 0, 215)),
    ('frame, waist.stl',         FRAME, ( 0, 185)),
    ('frame, abdomen.stl',       FRAME, ( 0, 165)),
    ('frame, hips.stl',          FRAME, ( 0, 140)),
    ('frame, clavicle, 2x.stl',  FRAME, ( 0, 225)),
    ('frame, upper arm, 2x.stl', FRAME, ( 0, 215)),
    ('frame, forearm, 2x.stl',   FRAME, ( 0, 175)),
    ('frame, knee and elbow, 4x.stl', FRAME, ( 0, 125)),
    ('frame, shin, 2x.stl',      FRAME, ( 0,  80)),
    ('frame, ankle, 2x.stl',     FRAME, ( 0,  30)),
    ('frame, thigh, 2x.stl',     FRAME, ( 0, 110)),
    # hands
    ('hand, fist, right.stl',    FRAME, ( 0, 145)),
    ('hand, fist, left.stl',     FRAME, ( 0, 145)),
    # ── Armor (outer shell) ────────────────────────────────────
    ('armor, head.stl',          ARMOR, ( 0, 270)),
    ('armor, neck.stl',          ARMOR, ( 0, 250)),
    ('armor, inner chest.stl',   ARMOR, ( 0, 215)),
    ('armor, outer chest.stl',   ARMOR, ( 0, 218)),
    ('armor, waist.stl',         ARMOR, ( 0, 185)),
    ('armor, abdomen.stl',       ARMOR, ( 0, 162)),
    ('armor, crotch.stl',        ARMOR, ( 0, 138)),
    ('armor, hip, 2x.stl',       ARMOR, ( 0, 138)),
    ('armor, shoulder, 2x.stl',  ARMOR, ( 0, 225)),
    ('armor, upper arm, 2x.stl', ARMOR, ( 0, 205)),
    ('armor, forearm, 2x.stl',   ARMOR, ( 0, 172)),
    ('armor, thigh, 2x.stl',     ARMOR, ( 0, 108)),
    ('armor, knee, 2x.stl',      ARMOR, ( 0,  80)),
    ('armor, shin, 2x.stl',      ARMOR, ( 0,  58)),
    ('armor, foot, 2x.stl',      ARMOR, ( 0,  12)),
    ('armor, toe, 2x.stl',       ARMOR, ( 0,   3)),
]

# ── material builders ──────────────────────────────────────────────────────

def apply_standard_material(obj, color_hex):
    mat = bpy.data.materials.new(name='PLA')
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    links = mat.node_tree.links
    nodes.clear()
    output = nodes.new('ShaderNodeOutputMaterial')
    bsdf   = nodes.new('ShaderNodeBsdfPrincipled')
    bsdf.inputs['Roughness'].default_value = 0.72
    bsdf.inputs['Specular'].default_value  = 0.2
    tex_coord = nodes.new('ShaderNodeTexCoord')
    wave = nodes.new('ShaderNodeTexWave')
    wave.wave_type = 'BANDS'; wave.bands_direction = 'Z'
    wave.inputs['Scale'].default_value            = 90.0
    wave.inputs['Distortion'].default_value       = 0.4
    wave.inputs['Detail'].default_value           = 3.0
    wave.inputs['Detail Scale'].default_value     = 1.5
    wave.inputs['Detail Roughness'].default_value = 0.65
    links.new(tex_coord.outputs['Object'], wave.inputs['Vector'])
    ramp = nodes.new('ShaderNodeValToRGB')
    ramp.color_ramp.elements[0].position = 0.0;  ramp.color_ramp.elements[0].color = (0.76,0.76,0.76,1)
    ramp.color_ramp.elements[1].position = 0.35; ramp.color_ramp.elements[1].color = (1,1,1,1)
    links.new(wave.outputs['Fac'], ramp.inputs['Fac'])
    rgb = nodes.new('ShaderNodeRGB'); rgb.outputs[0].default_value = hex_to_rgba(color_hex)
    mix = nodes.new('ShaderNodeMixRGB'); mix.blend_type = 'MULTIPLY'; mix.inputs['Fac'].default_value = 1.0
    links.new(rgb.outputs['Color'], mix.inputs[1]); links.new(ramp.outputs['Color'], mix.inputs[2])
    links.new(mix.outputs['Color'], bsdf.inputs['Base Color'])
    bump = nodes.new('ShaderNodeBump'); bump.inputs['Strength'].default_value = 0.28; bump.inputs['Distance'].default_value = 0.015
    links.new(ramp.outputs['Color'], bump.inputs['Height']); links.new(bump.outputs['Normal'], bsdf.inputs['Normal'])
    links.new(bsdf.outputs['BSDF'], output.inputs['Surface'])
    if obj.data.materials: obj.data.materials[0] = mat
    else: obj.data.materials.append(mat)

def apply_translucent_material(obj):
    mat = bpy.data.materials.new(name='PLA_Trans')
    mat.use_nodes = True
    nodes = mat.node_tree.nodes; links = mat.node_tree.links; nodes.clear()
    output = nodes.new('ShaderNodeOutputMaterial')
    bsdf   = nodes.new('ShaderNodeBsdfPrincipled')
    bsdf.inputs['Base Color'].default_value   = (0.38, 0.68, 1.00, 1.0)
    bsdf.inputs['Roughness'].default_value    = 0.04
    bsdf.inputs['Transmission'].default_value = 0.88
    bsdf.inputs['IOR'].default_value          = 1.47
    links.new(bsdf.outputs['BSDF'], output.inputs['Surface'])
    if obj.data.materials: obj.data.materials[0] = mat
    else: obj.data.materials.append(mat)

def apply_silk_material(obj, color_hex):
    mat = bpy.data.materials.new(name='PLA_Silk')
    mat.use_nodes = True
    nodes = mat.node_tree.nodes; links = mat.node_tree.links; nodes.clear()
    output = nodes.new('ShaderNodeOutputMaterial')
    bsdf   = nodes.new('ShaderNodeBsdfPrincipled')
    bsdf.inputs['Base Color'].default_value = hex_to_rgba(color_hex)
    bsdf.inputs['Metallic'].default_value   = 0.92
    bsdf.inputs['Roughness'].default_value  = 0.07
    bsdf.inputs['Specular'].default_value   = 1.0
    links.new(bsdf.outputs['BSDF'], output.inputs['Surface'])
    if obj.data.materials: obj.data.materials[0] = mat
    else: obj.data.materials.append(mat)

def apply_silk_gradient_material(obj):
    mat = bpy.data.materials.new(name='PLA_SilkGrad')
    mat.use_nodes = True
    nodes = mat.node_tree.nodes; links = mat.node_tree.links; nodes.clear()
    output = nodes.new('ShaderNodeOutputMaterial')
    bsdf   = nodes.new('ShaderNodeBsdfPrincipled')
    bsdf.inputs['Metallic'].default_value  = 0.85
    bsdf.inputs['Roughness'].default_value = 0.07
    bsdf.inputs['Specular'].default_value  = 1.0
    tex_coord = nodes.new('ShaderNodeTexCoord')
    sep = nodes.new('ShaderNodeSeparateXYZ'); links.new(tex_coord.outputs['Object'], sep.inputs[0])
    mr  = nodes.new('ShaderNodeMapRange'); mr.inputs['From Min'].default_value = -0.5; mr.inputs['From Max'].default_value = 0.5
    links.new(sep.outputs[2], mr.inputs['Value'])
    gr = nodes.new('ShaderNodeValToRGB')
    gr.color_ramp.elements[0].color = (0.913,0.118,0.549,1)  # hot pink
    gr.color_ramp.elements[1].color = (0.0,0.769,0.706,1)    # teal
    links.new(mr.outputs['Result'], gr.inputs['Fac'])
    links.new(gr.outputs['Color'], bsdf.inputs['Base Color'])
    links.new(bsdf.outputs['BSDF'], output.inputs['Surface'])
    if obj.data.materials: obj.data.materials[0] = mat
    else: obj.data.materials.append(mat)

def apply_gradient_material(obj):
    mat = bpy.data.materials.new(name='PLA_Grad')
    mat.use_nodes = True
    nodes = mat.node_tree.nodes; links = mat.node_tree.links; nodes.clear()
    output = nodes.new('ShaderNodeOutputMaterial')
    bsdf   = nodes.new('ShaderNodeBsdfPrincipled')
    bsdf.inputs['Roughness'].default_value = 0.72; bsdf.inputs['Specular'].default_value = 0.2
    tex_coord = nodes.new('ShaderNodeTexCoord')
    sep = nodes.new('ShaderNodeSeparateXYZ'); links.new(tex_coord.outputs['Object'], sep.inputs[0])
    mr  = nodes.new('ShaderNodeMapRange'); mr.inputs['From Min'].default_value = -0.5; mr.inputs['From Max'].default_value = 0.5
    links.new(sep.outputs[2], mr.inputs['Value'])
    gr = nodes.new('ShaderNodeValToRGB')
    gr.color_ramp.elements[0].color = (0.913,0.118,0.549,1)  # hot pink
    gr.color_ramp.elements[1].color = (0.0,0.769,0.706,1)    # teal
    links.new(mr.outputs['Result'], gr.inputs['Fac'])
    wave = nodes.new('ShaderNodeTexWave'); wave.wave_type='BANDS'; wave.bands_direction='Z'
    wave.inputs['Scale'].default_value=90; wave.inputs['Distortion'].default_value=0.4
    wave.inputs['Detail'].default_value=3; wave.inputs['Detail Scale'].default_value=1.5
    links.new(tex_coord.outputs['Object'], wave.inputs['Vector'])
    lr = nodes.new('ShaderNodeValToRGB')
    lr.color_ramp.elements[0].position=0; lr.color_ramp.elements[0].color=(0.76,0.76,0.76,1)
    lr.color_ramp.elements[1].position=0.35; lr.color_ramp.elements[1].color=(1,1,1,1)
    links.new(wave.outputs['Fac'], lr.inputs['Fac'])
    mx = nodes.new('ShaderNodeMixRGB'); mx.blend_type='MULTIPLY'; mx.inputs['Fac'].default_value=1.0
    links.new(gr.outputs['Color'], mx.inputs[1]); links.new(lr.outputs['Color'], mx.inputs[2])
    links.new(mx.outputs['Color'], bsdf.inputs['Base Color'])
    bump = nodes.new('ShaderNodeBump'); bump.inputs['Strength'].default_value=0.28; bump.inputs['Distance'].default_value=0.015
    links.new(lr.outputs['Color'], bump.inputs['Height']); links.new(bump.outputs['Normal'], bsdf.inputs['Normal'])
    links.new(bsdf.outputs['BSDF'], output.inputs['Surface'])
    if obj.data.materials: obj.data.materials[0] = mat
    else: obj.data.materials.append(mat)

# ── main ───────────────────────────────────────────────────────────────────

argv = sys.argv
try: idx = argv.index('--'); args = argv[idx+1:]
except: args = []

if len(args) < 2:
    print('Usage: blender --background --python assemble-dummy13.py -- <color_hex> <output_path> [material_type]')
    sys.exit(1)

color_hex     = args[0]
output_path   = args[1]
material_type = args[2] if len(args) > 2 else 'standard'

clear_scene()

all_objects = []
for (filename, directory, pos) in PARTS:
    path = os.path.join(directory, filename)
    if not os.path.exists(path):
        print(f'  SKIP (not found): {path}')
        continue
    obj = import_stl(path)
    bpy.ops.object.select_all(action='DESELECT')
    obj.select_set(True)
    bpy.context.view_layer.objects.active = obj
    bpy.ops.object.origin_set(type='ORIGIN_GEOMETRY', center='BOUNDS')
    obj.location = (0, 0, pos[1])   # all at X=0, stacked on Z
    all_objects.append(obj)

if not all_objects:
    print('ERROR: No STL parts loaded. Check that the Downloads path is correct.')
    sys.exit(1)

print(f'Loaded {len(all_objects)} parts.')

# Apply material and smooth shading to all parts
for obj in all_objects:
    bpy.context.view_layer.objects.active = obj
    bpy.ops.object.shade_smooth()
    obj.data.use_auto_smooth = True
    obj.data.auto_smooth_angle = math.radians(60)
    if material_type == 'translucent':
        apply_translucent_material(obj)
    elif material_type == 'silk':
        apply_silk_material(obj, color_hex)
    elif material_type == 'silk-gradient':
        apply_silk_gradient_material(obj)
    elif material_type == 'gradient':
        apply_gradient_material(obj)
    else:
        apply_standard_material(obj, color_hex)

# Select all, join, recenter, scale
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.join()
combined = bpy.context.active_object
bpy.ops.object.origin_set(type='ORIGIN_GEOMETRY', center='BOUNDS')
combined.location = (0, 0, 0)
max_dim = max(combined.dimensions)
scale   = 1.0 / max_dim if max_dim > 0 else 1.0
combined.scale = (scale, scale, scale)
bpy.ops.object.transform_apply(scale=True)

# Camera — slightly elevated front-quarter view for a standing figure
cam_data = bpy.data.cameras.new('Camera'); cam_data.lens = 120
cam_obj  = bpy.data.objects.new('Camera', cam_data)
bpy.context.collection.objects.link(cam_obj)
bpy.context.scene.camera = cam_obj
cam_obj.location = (1.2, -2.2, 0.8)
cam_obj.rotation_euler = (math.radians(68), 0, math.radians(27))
con = cam_obj.constraints.new('TRACK_TO')
con.target = combined; con.track_axis = 'TRACK_NEGATIVE_Z'; con.up_axis = 'UP_Y'

# Lighting — 4-point studio rig
def add_light(loc, rot, energy, size):
    d = bpy.data.lights.new('L', 'AREA'); d.energy=energy; d.size=size
    o = bpy.data.objects.new('L', d); bpy.context.collection.objects.link(o)
    o.location=loc; o.rotation_euler=rot; return o

add_light(( 3, -2,  4),  (math.radians(-45), 0, math.radians(45)),  800, 3)
add_light((-3,  1,  2),  (math.radians(-20), 0, math.radians(-120)), 300, 5)
add_light(( 0,  4, -0.5),(math.radians(80),  0, 0),                  200, 2)
add_light(( 0,  0,  5),  (0, 0, 0),                                  150, 4)

world = bpy.context.scene.world; world.use_nodes = True
bg = world.node_tree.nodes.get('Background')
if bg: bg.inputs[0].default_value = (0.90, 0.90, 0.90, 1.0); bg.inputs[1].default_value = 1.0

scene = bpy.context.scene
scene.render.engine = 'CYCLES'; scene.cycles.samples = 128
scene.cycles.use_denoising = True
scene.render.resolution_x = 1024; scene.render.resolution_y = 1024
scene.render.film_transparent = False
scene.render.filepath = output_path
scene.render.image_settings.file_format = 'JPEG'
scene.render.image_settings.quality = 92

print(f'Rendering Dummy 13 assembly [{material_type}] -> {output_path}')
bpy.ops.render.render(write_still=True)
print('Done.')
