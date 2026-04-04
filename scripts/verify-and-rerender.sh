#!/usr/bin/env bash
# Verify orientation then re-render 5 products with corrected Z rotations.

BLENDER="/c/Program Files/Blender Foundation/Blender 3.2/blender.exe"
RENDER_SCRIPT="C:/Users/espom/fidgetopia/scripts/render-product.py"
VERIFY_SCRIPT="C:/Users/espom/fidgetopia/scripts/verify-orientation.py"
MODELS="C:/Users/espom/fidgetopia/public/models"
OUT="C:/Users/espom/fidgetopia/public/images/products"

# Format: "slug|stl|rot_x|rot_y|rot_z"
PRODUCTS=(
  "rocktopus|rocktopus.stl|-90|0|180"
  "cute-octopus|cute-octopus.stl|-90|0|180"
  "cute-snakey|cute-snakey.stl|-90|180|180"
  "octopus-long-tentacles|octopus-long-tentacles.stl|-90|0|90"
  "flex-slug|flex-slug.stl|-90|180|90"
)

COLORS=(
  "blue|#2563EB|standard"
  "dark-purple|#3B0764|standard"
  "white|#F8F8F8|standard"
  "silver|#C8C8CC|silk"
  "transparent-blue|#D4ECFA|translucent"
  "pink-blue-gradient|#00C4B4|silk-gradient"
)

echo "============================================================"
echo "STEP 1: Orientation verification"
echo "============================================================"

all_ok=true
for product_entry in "${PRODUCTS[@]}"; do
  IFS='|' read -r slug stl rot_x rot_y rot_z <<< "$product_entry"
  stl_path="$MODELS/$stl"
  echo ""
  "$BLENDER" --background --python "$VERIFY_SCRIPT" -- \
    "$stl_path" "$rot_x" "$rot_y" "$rot_z" \
    2>&1 | grep -E "^\[ORIENTATION|  (Rotations|Bounding|Width|Depth|Height|Tallest|Z/)"
done

echo ""
echo "============================================================"
echo "STEP 2: Rendering"
echo "============================================================"

total=$(( ${#PRODUCTS[@]} * ${#COLORS[@]} ))
done_count=0

for product_entry in "${PRODUCTS[@]}"; do
  IFS='|' read -r slug stl rot_x rot_y rot_z <<< "$product_entry"
  stl_path="$MODELS/$stl"

  for color_entry in "${COLORS[@]}"; do
    IFS='|' read -r color_id hex mat_type <<< "$color_entry"
    output="$OUT/${slug}-${color_id}.jpg"
    done_count=$(( done_count + 1 ))

    rm -f "$output"

    echo "[$done_count/$total] $slug — $color_id (rot $rot_x,$rot_y,$rot_z)..."
    "$BLENDER" --background --python "$RENDER_SCRIPT" -- \
      "$stl_path" "$output" "$hex" "$mat_type" "$rot_x" "$rot_y" "$rot_z" \
      2>&1 | grep -E "^(Rendering|Done\.|Error)" || true
  done
done

echo ""
echo "All done."
