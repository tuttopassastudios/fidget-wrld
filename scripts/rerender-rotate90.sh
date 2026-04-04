#!/usr/bin/env bash
# Re-render cute-snakey, rocktopus, cute-octopus with +90 Z rotation fix.

BLENDER="/c/Program Files/Blender Foundation/Blender 3.2/blender.exe"
SCRIPT="C:/Users/espom/fidgetopia/scripts/render-product.py"
MODELS="C:/Users/espom/fidgetopia/public/models"
OUT="C:/Users/espom/fidgetopia/public/images/products"

# Format: "slug|stl|rot_x|rot_y|rot_z"
PRODUCTS=(
  "rocktopus|rocktopus.stl|-90|0|90"
  "cute-octopus|cute-octopus.stl|-90|0|90"
  "cute-snakey|cute-snakey.stl|-90|180|90"
)

COLORS=(
  "blue|#2563EB|standard"
  "dark-purple|#3B0764|standard"
  "white|#F8F8F8|standard"
  "silver|#C8C8CC|silk"
  "transparent-blue|#D4ECFA|translucent"
  "pink-blue-gradient|#00C4B4|silk-gradient"
)

total=$(( ${#PRODUCTS[@]} * ${#COLORS[@]} ))
done=0

for product_entry in "${PRODUCTS[@]}"; do
  IFS='|' read -r slug stl rot_x rot_y rot_z <<< "$product_entry"
  stl_path="$MODELS/$stl"

  for color_entry in "${COLORS[@]}"; do
    IFS='|' read -r color_id hex mat_type <<< "$color_entry"
    output="$OUT/${slug}-${color_id}.jpg"
    done=$(( done + 1 ))

    rm -f "$output"

    echo "[$done/$total] $slug — $color_id (rot $rot_x,$rot_y,$rot_z)..."
    "$BLENDER" --background --python "$SCRIPT" -- \
      "$stl_path" "$output" "$hex" "$mat_type" "$rot_x" "$rot_y" "$rot_z" \
      2>&1 | grep -E "^(Rendering|Done\.|Error)" || true
  done
done

echo "Done."
