"""
Render a single STL at all 4 Z rotations with a specified rot_y.
Usage: blender --background --python render-previews-ry.py -- STL OUT_DIR ROT_X ROT_Y SUFFIX
"""
import sys, math, os, bpy

argv = sys.argv
after = argv[argv.index("--") + 1:] if "--" in argv else []
stl_path = after[0]
out_dir   = after[1]
rot_x     = float(after[2])
rot_y     = float(after[3])
suffix    = after[4] if len(after) > 4 else ""
hex_color = "#2563EB"

def hex_to_linear(h):
    h = h.lstrip('#')
    r, g, b = [int(h[i:i+2], 16)/255 for i in (0, 2, 4)]
    def srgb(c):
        return c/12.92 if c <= 0.04045 else ((c+0.025)/1.025)**2.4
    return (srgb(r), srgb(g), srgb(b), 1.0)

scene = bpy.context.scene
scene.render.engine           = 'CYCLES'
scene.cycles.samples          = 32
scene.render.resolution_x     = 256
scene.render.resolution_y     = 256
scene.render.resolution_percentage = 100
scene.render.image_settings.file_format = 'JPEG'
scene.render.image_settings.quality     = 85
bpy.data.worlds['World'].node_tree.nodes['Background'].inputs[0].default_value = (0.95, 0.95, 0.95, 1)
bpy.data.worlds['World'].node_tree.nodes['Background'].inputs[1].default_value = 3.0

slug = os.path.splitext(os.path.basename(stl_path))[0]

for rot_z in [0, 90, 180, 270]:
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete(use_global=False)

    bpy.ops.import_mesh.stl(filepath=stl_path)
    obj = bpy.context.selected_objects[0]
    bpy.context.view_layer.objects.active = obj

    obj.rotation_euler = (math.radians(rot_x), math.radians(rot_y), math.radians(rot_z))
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
    bpy.ops.object.origin_set(type='ORIGIN_GEOMETRY', center='BOUNDS')
    obj.location = (0, 0, 0)
    dim = max(obj.dimensions)
    if dim > 0:
        obj.scale = (1/dim, 1/dim, 1/dim)
    bpy.ops.object.transform_apply(scale=True)

    mat = bpy.data.materials.new(name="P")
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes.get("Principled BSDF")
    bsdf.inputs['Base Color'].default_value = hex_to_linear(hex_color)
    bsdf.inputs['Roughness'].default_value  = 0.4
    obj.data.materials.clear()
    obj.data.materials.append(mat)

    cam_data = bpy.data.cameras.new("Cam")
    cam_data.lens = 100
    cam_obj = bpy.data.objects.new("Cam", cam_data)
    scene.collection.objects.link(cam_obj)
    cam_obj.location = (1.8, -1.8, 1.3)
    scene.camera = cam_obj
    con = cam_obj.constraints.new(type='TRACK_TO')
    con.target = obj
    con.track_axis = 'TRACK_NEGATIVE_Z'
    con.up_axis    = 'UP_Y'
    bpy.context.view_layer.update()

    bpy.ops.object.light_add(type='SUN', location=(3, -3, 5))
    bpy.context.active_object.data.energy = 4.0

    label = f"{suffix}-z{rot_z}" if suffix else f"z{rot_z}"
    out = os.path.join(out_dir, f"{slug}-{label}.jpg")
    scene.render.filepath = out
    bpy.ops.render.render(write_still=True)
    print(f"[preview] {out}")
