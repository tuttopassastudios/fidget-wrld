#!/usr/bin/env python3
"""
Remove backgrounds from product images using rembg.
Processes all PNG/JPG images in public/images/products/,
saves output with transparent backgrounds (PNG).

Usage:
  # Process all product images
  .venv/bin/python scripts/remove-bg.py

  # Process specific files
  .venv/bin/python scripts/remove-bg.py public/images/products/mag-balls-blue.png

  # Dry run (preview what would be processed)
  .venv/bin/python scripts/remove-bg.py --dry-run
"""

import sys
import os
from pathlib import Path
from rembg import remove
from PIL import Image

PRODUCTS_DIR = Path(__file__).resolve().parent.parent / "public" / "images" / "products"
SUPPORTED_EXTENSIONS = {".png", ".jpg", ".jpeg", ".webp"}
# Skip placeholder SVGs and already-processed files
SKIP_FILES = {"placeholder.svg"}


def process_image(input_path: Path) -> bool:
    """Remove background from a single image. Returns True on success."""
    print(f"  Processing: {input_path.name} ...", end=" ", flush=True)

    try:
        with open(input_path, "rb") as f:
            input_data = f.read()

        output_data = remove(input_data)

        # Save as PNG (to preserve transparency)
        output_path = input_path.with_suffix(".png")
        with open(output_path, "wb") as f:
            f.write(output_data)

        # Show size reduction info
        original_size = len(input_data) / 1024
        new_size = len(output_data) / 1024
        print(f"done ({original_size:.0f}KB → {new_size:.0f}KB)")
        return True

    except Exception as e:
        print(f"FAILED: {e}")
        return False


def main():
    args = sys.argv[1:]
    dry_run = "--dry-run" in args
    args = [a for a in args if a != "--dry-run"]

    # Determine which files to process
    if args:
        files = [Path(a).resolve() for a in args]
    else:
        files = sorted(
            f for f in PRODUCTS_DIR.iterdir()
            if f.suffix.lower() in SUPPORTED_EXTENSIONS and f.name not in SKIP_FILES
        )

    if not files:
        print("No images found to process.")
        return

    print(f"\nFound {len(files)} image(s) to process:\n")
    for f in files:
        print(f"  - {f.name}")

    if dry_run:
        print("\n(Dry run — no files modified)")
        return

    print()
    success = 0
    failed = 0

    for f in files:
        if process_image(f):
            success += 1
        else:
            failed += 1

    print(f"\nDone: {success} processed, {failed} failed")


if __name__ == "__main__":
    main()
