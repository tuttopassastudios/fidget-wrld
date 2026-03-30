#!/usr/bin/env python3
"""
Remove backgrounds from product images stored in Supabase Storage.
Downloads images, removes backgrounds with rembg, and re-uploads.

Usage:
  # Process all images in the Supabase 'products' bucket
  .venv/bin/python scripts/remove-bg-supabase.py

  # Process specific files by name
  .venv/bin/python scripts/remove-bg-supabase.py mag-balls-blue.png fidget-cube-grey-black.png

  # Dry run (list what would be processed)
  .venv/bin/python scripts/remove-bg-supabase.py --dry-run

Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local
"""

import sys
import os
import json
from pathlib import Path
from urllib.request import urlopen, Request
from urllib.error import URLError

REPO_ROOT = Path(__file__).resolve().parent.parent
SUPPORTED_EXTENSIONS = {".png", ".jpg", ".jpeg", ".webp"}
BUCKET = "products"


def load_env():
    """Load vars from .env.local"""
    env_file = REPO_ROOT / ".env.local"
    if not env_file.exists():
        print("Error: .env.local not found")
        sys.exit(1)

    env = {}
    for line in env_file.read_text().splitlines():
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        if "=" in line:
            key, val = line.split("=", 1)
            env[key.strip()] = val.strip()
    return env


def supabase_request(url, method="GET", data=None, headers=None):
    """Make an HTTP request to Supabase."""
    req = Request(url, data=data, method=method)
    if headers:
        for k, v in headers.items():
            req.add_header(k, v)
    try:
        with urlopen(req) as resp:
            return resp.read(), resp.status
    except URLError as e:
        if hasattr(e, "read"):
            return e.read(), getattr(e, "code", 500)
        raise


def list_files(supabase_url, service_key):
    """List all files in the products bucket."""
    url = f"{supabase_url}/storage/v1/object/list/{BUCKET}"
    headers = {
        "Authorization": f"Bearer {service_key}",
        "apikey": service_key,
        "Content-Type": "application/json",
    }
    body = json.dumps({"prefix": "", "limit": 1000}).encode()
    data, status = supabase_request(url, method="POST", data=body, headers=headers)

    if status != 200:
        print(f"Error listing files: {status} — {data.decode()}")
        sys.exit(1)

    files = json.loads(data)
    return [
        f["name"]
        for f in files
        if any(f["name"].lower().endswith(ext) for ext in SUPPORTED_EXTENSIONS)
    ]


def download_file(supabase_url, filename):
    """Download a file from the public bucket."""
    url = f"{supabase_url}/storage/v1/object/public/{BUCKET}/{filename}"
    data, status = supabase_request(url)
    if status != 200:
        raise Exception(f"Download failed: {status}")
    return data


def upload_file(supabase_url, service_key, filename, data):
    """Upload (upsert) a file back to the bucket."""
    url = f"{supabase_url}/storage/v1/object/{BUCKET}/{filename}"

    ext = Path(filename).suffix.lower()
    content_types = {".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp"}
    content_type = content_types.get(ext, "image/png")

    headers = {
        "Authorization": f"Bearer {service_key}",
        "apikey": service_key,
        "Content-Type": content_type,
        "x-upsert": "true",
    }
    resp_data, status = supabase_request(url, method="PUT", data=data, headers=headers)
    if status not in (200, 201):
        raise Exception(f"Upload failed: {status} — {resp_data.decode()}")


def process_image(supabase_url, service_key, filename):
    """Download, remove background, and re-upload a single image."""
    # Lazy import so --dry-run doesn't need rembg
    from rembg import remove

    print(f"  Downloading: {filename} ...", end=" ", flush=True)
    image_data = download_file(supabase_url, filename)
    original_size = len(image_data) / 1024
    print(f"({original_size:.0f}KB)")

    print(f"  Removing background ...", end=" ", flush=True)
    output_data = remove(image_data)
    new_size = len(output_data) / 1024
    print(f"done ({new_size:.0f}KB)")

    # Re-upload as PNG for transparency
    png_filename = Path(filename).with_suffix(".png").name
    print(f"  Uploading: {png_filename} ...", end=" ", flush=True)
    upload_file(supabase_url, service_key, png_filename, output_data)
    print("done")

    return True


def main():
    args = sys.argv[1:]
    dry_run = "--dry-run" in args
    args = [a for a in args if a != "--dry-run"]

    env = load_env()
    supabase_url = env.get("NEXT_PUBLIC_SUPABASE_URL")
    service_key = env.get("SUPABASE_SERVICE_ROLE_KEY")

    if not supabase_url or not service_key:
        print("Error: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY required in .env.local")
        sys.exit(1)

    # Determine files to process
    if args:
        files = args
    else:
        print(f"Listing files in Supabase '{BUCKET}' bucket...\n")
        files = list_files(supabase_url, service_key)

    if not files:
        print("No images found.")
        return

    print(f"Found {len(files)} image(s):\n")
    for f in files:
        print(f"  - {f}")

    if dry_run:
        print("\n(Dry run — no files modified)")
        return

    print()
    success = 0
    failed = 0

    for f in files:
        try:
            if process_image(supabase_url, service_key, f):
                success += 1
        except Exception as e:
            print(f"  FAILED: {e}")
            failed += 1
        print()

    print(f"Done: {success} processed, {failed} failed")


if __name__ == "__main__":
    main()
