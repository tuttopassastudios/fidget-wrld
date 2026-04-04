#!/usr/bin/env bash
# Batch render all 3D-printed products × 6 filament colors.
# Run from repo root: bash scripts/batch-render.sh
# Requires Blender 3.2 at the path below.

BLENDER="/c/Program Files/Blender Foundation/Blender 3.2/blender.exe"
SCRIPT="C:/Users/espom/fidgetopia/scripts/render-product.py"
MODELS="C:/Users/espom/fidgetopia/public/models"
OUT="C:/Users/espom/fidgetopia/public/images/products"

# Format: "slug|stl_filename"
PRODUCTS=(
  "dummy-13|dummy13-runners.stl"
  "click-clack-swoosh|click-clack-swoosh.stl"
  "infinity-cube|yafic_v2.stl"
  "flexi-mecha-dragon|flexi-mecha-dragon.stl"
  "cute-snakey|cute-snakey.stl"
  "spiral-cone-fidget|spiral-cone-fidget.stl"
  "rocktopus|rocktopus.stl"
  "cute-octopus|cute-octopus.stl"
  "flex-slug|flex-slug.stl"
  "octopus-long-tentacles|octopus-long-tentacles.stl"
  "f35-lightning|f35-lightning.stl"
  "gyro-spinner-7|gyro-spinner-7.stl"
  "keyboard-clicker-fidget|keyboard-clicker.stl"
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
  IFS='|' read -r slug stl <<< "$product_entry"
  stl_path="$MODELS/$stl"

  for color_entry in "${COLORS[@]}"; do
    IFS='|' read -r color_id hex mat_type <<< "$color_entry"
    output="$OUT/${slug}-${color_id}.jpg"
    done=$(( done + 1 ))

    if [ -f "$output" ]; then
      echo "[$done/$total] SKIP (exists): $output"
      continue
    fi

    echo "[$done/$total] Rendering $slug — $color_id ($mat_type)..."
    "$BLENDER" --background --python "$SCRIPT" -- \
      "$stl_path" "$output" "$hex" "$mat_type" \
      2>&1 | grep -E "^(Rendering|Done\.|Error|Fra:)" || true
  done
done

echo ""
echo "Batch render complete: $total images"
