# G-code Viewer — Adding 3D Print Previews to Products

Customers on made-to-order product pages see an interactive 3D toolpath viewer — the print "builds up" layer by layer and they can drag/orbit around it. The filament color they pick updates the toolpath color in real time.

This doc covers everything needed to add or update a G-code preview for a product.

---

## How it works (overview)

1. You slice the product in **Bambu Studio** and export a `.gcode` file.
2. You run a local script that parses the G-code and uploads a compact preview file to Supabase Storage.
3. You paste the returned URL into the product definition in `src/data/products.ts`.
4. Deploy — the product page now shows the interactive viewer instead of the static STL.

The raw G-code file is never served to customers. The script extracts only the print move coordinates and produces a small JSON file (~200–800 KB vs. 10–40 MB for raw G-code).

---

## Prerequisites

- Node.js installed (already required to run the project)
- Access to the project repo
- `.env.local` in the project root with these two values set:
  ```
  NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
  SUPABASE_SERVICE_ROLE_KEY=eyJ...
  ```
  Ask a team member if you don't have these.

---

## Step-by-step: adding a preview to an existing product

### 1. Slice in Bambu Studio

- Open your model in Bambu Studio
- Configure your print settings as normal
- Slice it
- Export the G-code: **File → Export → Export G-code** (saves a `.gcode` file)

> Tip: the slicer settings don't affect the viewer — any valid Bambu Studio `.gcode` file works.

### 2. Run the processor script

From the project root in your terminal:

```bash
node scripts/process-gcode.js <path/to/file.gcode> <product-slug>
```

**Example:**
```bash
node scripts/process-gcode.js ~/Downloads/yafic_v2.gcode yafic-v2
```

The product slug must match exactly what's in `src/data/products.ts` (e.g. `dummy-13`, `click-clack-swoosh`, `infinity-cube`).

**What you'll see:**
```
Processing: /Users/you/Downloads/yafic_v2.gcode
Slug:       yafic-v2

Parsing G-code…
  Parsed 400k lines, 142 layers…
Done. 142 non-empty layers, layerCount=142
Written locally: /path/to/project/yafic-v2-toolpath.json (387.4 KB)
Uploading to Supabase Storage…

Success!
Local:  /path/to/project/yafic-v2-toolpath.json
Remote: https://xxxx.supabase.co/storage/v1/object/public/products/gcode/yafic-v2-toolpath.json
```

Copy the **Remote** URL — you'll need it in the next step.

> The local `.json` file written to the project root is a byproduct — you can delete it after uploading. It is gitignored.

### 3. Paste the URL into the product definition

Open `src/data/products.ts` and find the product by its slug. Look for the `gcodePreviewPath` field and replace the empty string with the URL:

```ts
// Before:
gcodePreviewPath: '', // TODO: run process-gcode.js and paste URL here

// After:
gcodePreviewPath: 'https://xxxx.supabase.co/storage/v1/object/public/products/gcode/yafic-v2-toolpath.json',
```

### 4. Test locally

```bash
npm run dev
```

Navigate to the product page (e.g. `/products/yafic-v2`). You should see the 3D toolpath viewer instead of the STL viewer. Use the layer slider to scrub through the print.

### 5. Commit and deploy

```bash
git add src/data/products.ts
git commit -m "feat: add G-code preview for <product name>"
git pull --rebase && git push
```

Vercel will deploy automatically on push.

---

## Adding a brand new 3D-printed product

If you're adding a product that didn't exist before, there are a few extra steps.

### 1. Add the product to `src/data/products.ts`

Copy an existing 3D-printed product (e.g. `dummy-13`) as a template and fill in:

```ts
{
  slug: 'your-product-slug',
  name: 'Your Product Name',
  fulfillmentType: '3d-printed',
  stlFile: '/models/your-model.stl',         // optional — only if you also want STL fallback
  gcodePreviewPath: '',                       // fill in after running the script
  availableFilamentColorIds: ['white', 'black', 'teal'],
  printLeadTime: '3–5 business days',
  // ... rest of required fields
}
```

See existing 3D-printed products for full examples of all required fields.

### 2. Add the STL model (optional)

If you want to keep an STL fallback (shown while G-code preview is pending), place the `.stl` file in `public/models/` and reference it as `stlFile: '/models/your-model.stl'`.

If `gcodePreviewPath` is set and non-empty, it always takes priority over `stlFile`.

### 3. Add filament colors

Filament colors are defined in `src/data/filament-colors.ts`. If the color you need isn't listed, add it there first. Each color needs an `id`, `name`, `hex`, and `inStock` value.

### 4. Follow steps 1–5 above

Process the G-code, paste the URL, test, and deploy.

---

## Re-slicing an existing product

If the model changes (new version, updated design) just re-run the script with the same slug. The upload uses `upsert: true` so it overwrites the existing file in Supabase Storage. No code changes needed — the URL stays the same.

```bash
node scripts/process-gcode.js ~/Downloads/yafic_v2_updated.gcode yafic-v2
```

---

## Troubleshooting

**"Missing Supabase credentials"**
Your `.env.local` is missing `NEXT_PUBLIC_SUPABASE_URL` or `SUPABASE_SERVICE_ROLE_KEY`. Ask a team member for the values.

**"File not found"**
The path to the `.gcode` file is wrong. Use an absolute path or drag the file into the terminal to get the full path.

**"Upload failed"**
Usually a permissions issue. Make sure `SUPABASE_SERVICE_ROLE_KEY` is the service role key (not the anon key) — it starts with `eyJ` and is much longer than the anon key. Check the Supabase dashboard under **Project Settings → API**.

**Viewer shows but looks empty / no lines visible**
The toolpath JSON may be from a different slicer or a non-standard Bambu export. Make sure you exported a standard `.gcode` file (not `.3mf`) from Bambu Studio. The script is tuned specifically for Bambu Studio G-code flavor.

**Layer count looks wrong**
The layer count shown in the viewer reads from the `; layer_count = N` header that Bambu Studio writes at the top of the file. If it looks off, double-check that the G-code export completed fully (truncated files lose the layer count header and fall back to counting layers manually).

---

## File reference

| File | Purpose |
|---|---|
| `scripts/process-gcode.js` | Parses G-code, uploads JSON to Supabase |
| `src/components/product/GCodeViewer.tsx` | The customer-facing 3D viewer component |
| `src/components/product/STLViewer.tsx` | Legacy STL viewer (fallback when no G-code preview) |
| `src/data/products.ts` | Product definitions — `gcodePreviewPath` lives here |
| `src/data/filament-colors.ts` | Available filament colors for 3D-printed products |
| `src/types/index.ts` | TypeScript types — `ProductPage.gcodePreviewPath` defined here |
| Supabase Storage → `products` bucket → `gcode/` folder | Where toolpath JSONs are stored |
