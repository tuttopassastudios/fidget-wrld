/**
 * Supabase Database Types
 * Generated types for the Fidget WRLD database schema
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

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

export interface Database {
  public: {
    Tables: {
      products: {
        Row: {
          id: string;
          slug: string;
          name: string;
          tagline: string | null;
          category: ProductCategory;
          subcategory: string | null;
          variants: Json;
          default_variant_index: number;
          description: string;
          features: string[];
          specifications: Json;
          moods: Mood[];
          audiences: Audience[];
          textures: Texture[];
          age_recommendation: string | null;
          materials: string[] | null;
          dimensions: string | null;
          weight: string | null;
          is_new: boolean;
          is_bestseller: boolean;
          is_limited: boolean;
          is_out_of_stock: boolean;
          related_slugs: string[] | null;
          about: string | null;
          care_instructions: string | null;
          meta_title: string;
          meta_description: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          name: string;
          tagline?: string | null;
          category: ProductCategory;
          subcategory?: string | null;
          variants: Json;
          default_variant_index?: number;
          description: string;
          features: string[];
          specifications: Json;
          moods: Mood[];
          audiences: Audience[];
          textures: Texture[];
          age_recommendation?: string | null;
          materials?: string[] | null;
          dimensions?: string | null;
          weight?: string | null;
          is_new?: boolean;
          is_bestseller?: boolean;
          is_limited?: boolean;
          is_out_of_stock?: boolean;
          related_slugs?: string[] | null;
          about?: string | null;
          care_instructions?: string | null;
          meta_title: string;
          meta_description: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          name?: string;
          tagline?: string | null;
          category?: ProductCategory;
          subcategory?: string | null;
          variants?: Json;
          default_variant_index?: number;
          description?: string;
          features?: string[];
          specifications?: Json;
          moods?: Mood[];
          audiences?: Audience[];
          textures?: Texture[];
          age_recommendation?: string | null;
          materials?: string[] | null;
          dimensions?: string | null;
          weight?: string | null;
          is_new?: boolean;
          is_bestseller?: boolean;
          is_limited?: boolean;
          is_out_of_stock?: boolean;
          related_slugs?: string[] | null;
          about?: string | null;
          care_instructions?: string | null;
          meta_title?: string;
          meta_description?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      collections: {
        Row: {
          id: string;
          slug: string;
          name: string;
          description: string;
          image: string;
          product_slugs: string[];
          featured: boolean;
          color: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          name: string;
          description: string;
          image: string;
          product_slugs: string[];
          featured?: boolean;
          color?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          name?: string;
          description?: string;
          image?: string;
          product_slugs?: string[];
          featured?: boolean;
          color?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      orders: {
        Row: {
          id: string;
          user_id: string | null;
          email: string;
          phone: string | null;
          status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';
          items: Json;
          subtotal: number;
          shipping: number;
          tax: number;
          total: number;
          shipping_address: Json;
          billing_address: Json | null;
          stripe_payment_intent_id: string | null;
          promo_code: string | null;
          discount: number;
          notes: string | null;
          cj_order_id: string | null;
          cj_order_status: string | null;
          cj_tracking_number: string | null;
          fulfillment_error: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          email: string;
          phone?: string | null;
          status?: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';
          items: Json;
          subtotal: number;
          shipping: number;
          tax: number;
          total: number;
          shipping_address: Json;
          billing_address?: Json | null;
          stripe_payment_intent_id?: string | null;
          promo_code?: string | null;
          discount?: number;
          notes?: string | null;
          cj_order_id?: string | null;
          cj_order_status?: string | null;
          cj_tracking_number?: string | null;
          fulfillment_error?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          email?: string;
          phone?: string | null;
          status?: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';
          items?: Json;
          subtotal?: number;
          shipping?: number;
          tax?: number;
          total?: number;
          shipping_address?: Json;
          billing_address?: Json | null;
          stripe_payment_intent_id?: string | null;
          promo_code?: string | null;
          discount?: number;
          notes?: string | null;
          cj_order_id?: string | null;
          cj_order_status?: string | null;
          cj_tracking_number?: string | null;
          fulfillment_error?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      newsletter_subscribers: {
        Row: {
          id: string;
          email: string;
          subscribed_at: string;
          source: string;
          status: string;
          ip: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          subscribed_at?: string;
          source?: string;
          status?: string;
          ip?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          subscribed_at?: string;
          source?: string;
          status?: string;
          ip?: string | null;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      product_category: ProductCategory;
      mood: Mood;
      audience: Audience;
      texture: Texture;
      order_status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';
    };
    CompositeTypes: Record<string, never>;
  };
}

// Helper type to convert database row to ProductPage type
export type DbProduct = Database['public']['Tables']['products']['Row'];
export type DbProductInsert = Database['public']['Tables']['products']['Insert'];
export type DbProductUpdate = Database['public']['Tables']['products']['Update'];
