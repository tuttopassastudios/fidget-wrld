#!/usr/bin/env bash
# Re-render products that need orientation corrections.
# Deletes existing renders and re-renders with rot_x/rot_y/rot_z args.

BLENDER="/c/Program Files/Blender Foundation/Blender 3.2/blender.exe"
SCRIPT="C:/Users/espom/fidgetopia/scripts/render-product.py"
MODELS="C:/Users/espom/fidgetopia/public/models"
OUT="C:/Users/espom/fidgetopia/public/images/products"

# Format: "slug|stl_filename|rot_x|rot_y|rot_z"
PRODUCTS=(
  "rocktopus|rocktopus.stl|-90|0|0"
  "cute-octopus|cute-octopus.stl|-90|0|0"
  "octopus-long-tentacles|octopus-long-tentacles.stl|-90|0|0"
  "cute-snakey|cute-snakey.stl|-90|180|0"
  "flex-slug|flex-slug.stl|-90|180|0"
  "flexi-mecha-dragon|flexi-mecha-dragon.stl|-30|0|0"
  "click-clack-swoosh|click-clack-swoosh.stl|-90|0|0"
  "infinity-cube|yafic_v2.stl|-90|0|0"
)

# Format: "color-id|hex|material_type"
COLORS=(
  "blue|#3B82F6|standard"
  "dark-purple|#5B21B6|standard"
  "white|#F8F8F8|standard"
  "silver|#BCC8D6|standard"
  "transparent-blue|#93C5FD|translucent"
  "pink-blue-gradient|#C084FC|gradient"
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

    # Force delete existing to re-render with correct orientation
    rm -f "$output"

    echo "[$done/$total] Rendering $slug — $color_id (rot $rot_x,$rot_y,$rot_z)..."
    "$BLENDER" --background --python "$SCRIPT" -- \
      "$stl_path" "$output" "$hex" "$mat_type" "$rot_x" "$rot_y" "$rot_z" \
      2>&1 | grep -E "^(Rendering|Done\.|Error|Fra:)" || true
  done
done

echo ""
echo "Re-render complete: $total images"
