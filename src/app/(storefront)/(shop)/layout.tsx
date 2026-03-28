import { ShopProviders } from '@/components/ShopProviders';

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return <ShopProviders>{children}</ShopProviders>;
}
