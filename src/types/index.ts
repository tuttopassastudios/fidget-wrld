// Fidgetopia Product Types

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
  type: 'percent' | 'fixed' | 'freeship';
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
