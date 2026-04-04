#!/usr/bin/env bash
# Force re-render all products × 6 colors (deletes existing outputs).
# Run from repo root: bash scripts/batch-render-force.sh

BLENDER="/c/Program Files/Blender Foundation/Blender 3.2/blender.exe"
SCRIPT="C:/Users/espom/fidgetopia/scripts/render-product.py"
MODELS="C:/Users/espom/fidgetopia/public/models"
OUT="C:/Users/espom/fidgetopia/public/images/products"

PRODUCTS=(
  "dummy-13|dummy13-runners.stl|0|0|0"
  "click-clack-swoosh|click-clack-swoosh.stl|-90|0|0"
  "infinity-cube|yafic_v2.stl|-90|0|0"
  "flexi-mecha-dragon|flexi-mecha-dragon.stl|-30|0|0"
  "cute-snakey|cute-snakey.stl|-90|180|270"
  "spiral-cone-fidget|spiral-cone-fidget.stl|0|0|0"
  "rocktopus|rocktopus.stl|-90|0|270"
  "cute-octopus|cute-octopus.stl|-90|0|270"
  "flex-slug|flex-slug.stl|-90|180|180"
  "octopus-long-tentacles|octopus-long-tentacles.stl|-90|0|180"
  "f35-lightning|f35-lightning.stl|0|0|0"
  "gyro-spinner-7|gyro-spinner-7.stl|0|0|0"
  "keyboard-clicker-fidget|keyboard-clicker.stl|0|0|0"
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

  # Skip dummy-13 runners — it's rendered by assemble-dummy13.py instead
  if [ "$slug" = "dummy-13" ]; then
    done=$(( done + ${#COLORS[@]} ))
    echo "[skip] dummy-13 (use render-dummy13.sh for assembled figure)"
    continue
  fi

  stl_path="$MODELS/$stl"

  for color_entry in "${COLORS[@]}"; do
    IFS='|' read -r color_id hex mat_type <<< "$color_entry"
    output="$OUT/${slug}-${color_id}.jpg"
    done=$(( done + 1 ))

    rm -f "$output"

    echo "[$done/$total] $slug — $color_id ($mat_type, rot $rot_x,$rot_y,$rot_z)..."
    "$BLENDER" --background --python "$SCRIPT" -- \
      "$stl_path" "$output" "$hex" "$mat_type" "$rot_x" "$rot_y" "$rot_z" \
      2>&1 | grep -E "^(Rendering|Done\.|Error|Fra:)" || true
  done
done

echo ""
echo "Batch render complete."
