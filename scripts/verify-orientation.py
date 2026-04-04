"""
Blender orientation verifier.
Usage: blender --background --python verify-orientation.py -- STL ROT_X ROT_Y ROT_Z

Applies the given rotations, then reports bounding-box dimensions so we can
confirm the model is standing upright (Z should be the tallest axis).
"""
import sys
import math
import bpy

# ── parse CLI args ─────────────────────────────────────────────────────────────
argv = sys.argv
after_sep = argv[argv.index("--") + 1:] if "--" in argv else []
if len(after_sep) < 4:
    print("Usage: blender --background --python verify-orientation.py -- STL ROT_X ROT_Y ROT_Z")
    sys.exit(1)

stl_path = after_sep[0]
rot_x    = float(after_sep[1])
rot_y    = float(after_sep[2])
rot_z    = float(after_sep[3])

# ── clean scene ───────────────────────────────────────────────────────────────
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)

# ── import STL ────────────────────────────────────────────────────────────────
bpy.ops.import_mesh.stl(filepath=stl_path)
obj = bpy.context.selected_objects[0]
bpy.context.view_layer.objects.active = obj

# ── apply rotations ───────────────────────────────────────────────────────────
obj.rotation_euler = (
    math.radians(rot_x),
    math.radians(rot_y),
    math.radians(rot_z),
)
bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)

# ── bounding box after rotation ───────────────────────────────────────────────
xs = [v.co.x for v in obj.data.vertices]
ys = [v.co.y for v in obj.data.vertices]
zs = [v.co.z for v in obj.data.vertices]

dx = max(xs) - min(xs)
dy = max(ys) - min(ys)
dz = max(zs) - min(zs)

print(f"\n[ORIENTATION CHECK] {stl_path}")
print(f"  Rotations applied: X={rot_x}, Y={rot_y}, Z={rot_z}")
print(f"  Bounding box after rotation:")
print(f"    Width  (X): {dx:.3f}")
print(f"    Depth  (Y): {dy:.3f}")
print(f"    Height (Z): {dz:.3f}")
print(f"  Tallest axis: {'Z (GOOD — model standing upright)' if dz >= dx and dz >= dy else 'NOT Z — model may be lying flat'}")
print(f"  Z/X ratio: {dz/dx:.2f}  Z/Y ratio: {dz/dy:.2f}")
