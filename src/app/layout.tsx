import type { Metadata, Viewport } from "next";
import { Nunito, Fredoka } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import { Providers } from "@/components/Providers";

const nunito = Nunito({
  variable: "--font-primary",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const fredoka = Fredoka({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#FF6B9D",
};

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://fidgetwrld.com"
  ),
  title: {
    default: "Fidget WRLD | Premium Fidget Toys & Sensory Tools",
    template: "%s | Fidget WRLD",
  },
  description:
    "Premium fidget toys, magnetic desk toys, and sensory tools for kids and adults. Shop stress relief, focus aids, and collectible fidgets.",
  icons: {
    icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='8' fill='%23FF6B9D'/%3E%3Ctext x='16' y='21' text-anchor='middle' font-family='system-ui' font-weight='700' font-size='14' fill='%23FFFFFF'%3EF%3C/text%3E%3C/svg%3E",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Fidget WRLD",
    title: "Fidget WRLD | Premium Fidget Toys & Sensory Tools",
    description:
      "Premium fidget toys, magnetic desk toys, and sensory tools for kids and adults. Shop stress relief, focus aids, and collectible fidgets.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Fidget WRLD | Premium Fidget Toys & Sensory Tools",
    description:
      "Premium fidget toys, magnetic desk toys, and sensory tools for kids and adults.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${nunito.variable} ${fredoka.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'Fidget WRLD',
              url: 'https://fidgetwrld.com',
              logo: 'https://fidgetwrld.com/images/fidget-wrld-logo.png',
              description: 'Premium fidget toys and sensory tools for kids, adults, and collectors.',
              contactPoint: {
                '@type': 'ContactPoint',
                email: 'hello@fidgetwrld.com',
                contactType: 'customer service',
              },
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: 'Fidget WRLD',
              url: 'https://fidgetwrld.com',
              potentialAction: {
                '@type': 'SearchAction',
                target: {
                  '@type': 'EntryPoint',
                  urlTemplate: 'https://fidgetwrld.com/products?search={search_term_string}',
                },
                'query-input': 'required name=search_term_string',
              },
            }),
          }}
        />
      </head>
      <body style={{ background: '#FFF9FB', color: '#1F2937' }}>
        <Providers>
          {children}
        </Providers>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
