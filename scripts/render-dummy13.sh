#!/usr/bin/env bash
# Render Dummy 13 assembled figure in all 6 colors.
# Run from repo root: bash scripts/render-dummy13.sh

BLENDER="/c/Program Files/Blender Foundation/Blender 3.2/blender.exe"
SCRIPT="C:/Users/espom/fidgetopia/scripts/assemble-dummy13.py"
OUT="C:/Users/espom/fidgetopia/public/images/products"

COLORS=(
  "blue|#2563EB|standard"
  "dark-purple|#3B0764|standard"
  "white|#F8F8F8|standard"
  "silver|#C8C8CC|silk"
  "transparent-blue|#D4ECFA|translucent"
  "pink-blue-gradient|#00C4B4|silk-gradient"
)

total=${#COLORS[@]}
done=0

for color_entry in "${COLORS[@]}"; do
  IFS='|' read -r color_id hex mat_type <<< "$color_entry"
  output="$OUT/dummy-13-${color_id}.jpg"
  done=$(( done + 1 ))

  # Force re-render
  rm -f "$output"

  echo "[$done/$total] Rendering dummy-13 — $color_id ($mat_type)..."
  "$BLENDER" --background --python "$SCRIPT" -- \
    "$hex" "$output" "$mat_type" \
    2>&1 | grep -E "^(Rendering|Done\.|Error|Loaded|Fra:)" || true
done

echo ""
echo "Dummy 13 render complete."
