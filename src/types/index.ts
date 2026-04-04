// Fidgetopia Product Types

export type FulfillmentType = 'dropship' | '3d-printed';

export interface FilamentColor {
  id: string;
  name: string;
  hex: string;
  inStock: boolean;
  type?: 'standard' | 'translucent' | 'gradient';
}

export interface PrintCustomization {
  filamentColorId?: string;
  engravingText?: string;
  keychainHole?: boolean;
  partColors?: Record<string, string>; // { armor: 'white', frame: 'black' } for multi-part products
}

export type ProductCategory =
  | 'Magnetic'
  | 'Squishy'
  | 'Clicky'
  | 'Stretchy'
  | 'Desk Toy'
  | 'Collectible'
  | 'Gift Set';

export type Mood = 'calm' | 'focus' | 'play' | 'collect';
export type Audience = 'kids' | 'adults' | 'office' | 'all';
export type Texture = 'smooth' | 'bumpy' | 'soft' | 'firm' | 'mixed';

export interface ProductVariant {
  sku: string;
  name: string;
  variant: string;
  color?: string;
  colorHex?: string;
  size?: string;
  price: number;
  compareAtPrice?: number;
  image: string;
  inventory?: number;
  cjPid?: string;      // CJ Dropshipping Product ID
  cjVid?: string;      // CJ Dropshipping Variant ID
  cjWarehouse?: 'US' | 'CN';  // Fulfillment warehouse — defaults to CN
  filamentColorId?: string;  // Which filament color this variant represents
}

export interface ProductPage {
  slug: string;
  name: string;
  tagline?: string;
  category: ProductCategory;
  subcategory?: string;
  variants: ProductVariant[];
  defaultVariantIndex: number;
  description: string;
  features: string[];
  specifications: Record<string, string>;

  // Fidgetopia-specific
  moods: Mood[];
  audiences: Audience[];
  textures: Texture[];
  ageRecommendation?: string;
  materials?: string[];
  dimensions?: string;
  weight?: string;

  // 3D printing
  fulfillmentType?: FulfillmentType;       // defaults to 'dropship' if absent
  stlFile?: string;                        // path like '/models/yafic_v2.stl'
  gcodePreviewPath?: string;               // Supabase Storage URL to pre-processed toolpath JSON
  assembledPhotoUrl?: string;             // real product photo shown alongside 3D viewer (toggleable)
  availableFilamentColorIds?: string[];    // references FilamentColor.id
  multiColorParts?: Array<{ id: string; label: string }>; // e.g. [{ id: 'armor', label: 'Armor' }, { id: 'frame', label: 'Frame' }]
  customizationOptions?: {
    engravingText?: boolean;
    keychainHole?: boolean;
  };
  printLeadTime?: string;                  // e.g. '3–5 business days'

  // Badges
  isNew?: boolean;
  isBestseller?: boolean;
  isLimited?: boolean;
  isOutOfStock?: boolean;

  // Related products
  relatedSlugs?: string[];

  // Optional fields for extended product info
  about?: string;
  careInstructions?: string;

  // SEO
  metaTitle: string;
  metaDescription: string;
}

export interface Collection {
  slug: string;
  name: string;
  description: string;
  image: string;
  productSlugs: string[];
  featured?: boolean;
  color?: string;
}

export interface BulkTier {
  qty: number;
  discount: number;
  label: string;
}

export interface CartItem {
  sku: string;
  name: string;
  variant: string;
  color?: string;
  size?: string;
  price: number;
  image: string;
  quantity: number;
  giftWrap?: boolean;
  fulfillmentType?: FulfillmentType;
  customization?: PrintCustomization;
}

export interface WishlistItem {
  sku: string;
  name: string;
  variant: string;
  price: number;
  image: string;
  url: string;
  addedAt: number;
}

export interface PromoCode {
  type: 'percent' | 'fixed' | 'freeship' | 'percent_freeship';
  value: number;
  min: number;
  label: string;
}

export interface ActivePromo extends PromoCode {
  code: string;
}

export interface PromoResult {
  discount: number;
  freeShipping: boolean;
  label: string;
}

export interface ToastItem {
  id: number;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
  duration: number;
}

// COARecord type preserved for backwards compatibility with admin dashboard
// Not used for fidget toy products
export interface COARecord {
  id: string;
  productSlug: string;
  productName: string;
  batchLot: string;
  testDate: string;
  expirationDate: string;
  storagePath: string;
  createdAt: string;
  uploadedAt: string;
  uploadedBy: string;
  fileName: string;
  downloadURL: string;
  fileSize: number;
}
