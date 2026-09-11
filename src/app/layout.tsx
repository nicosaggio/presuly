import type { Metadata, Viewport } from "next";
import { Poppins, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { getLocale } from "@/lib/i18n/server";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const APP_URL = process.env.APP_URL ?? "http://localhost:3000";
const SITE_NAME = "Presuly";
const TITLE = "Presuly — Presupuestos que se envían como link";
const DESCRIPTION =
  "Armá presupuestos profesionales, envialos como link y enterate cuando tu cliente los abre y acepta. Gratis para siempre, hasta 3 presupuestos activos.";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: TITLE,
  description: DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    "presupuestos online",
    "presupuestos por link",
    "cotizaciones para freelancers",
    "firma electrónica presupuesto",
    "propuestas para clientes",
    "software de presupuestos",
  ],
  alternates: { canonical: "/" },
  verification: {
    google: "oqrj3Pr_u5PedpvvUBjYT14L9qnvCoqu22yBy8ejgGY",
  },
  icons: {
    icon: [{ url: "/presuly-favicon.svg", type: "image/svg+xml" }],
    apple: "/apple-touch-icon-180.png",
  },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: TITLE,
    description: DESCRIPTION,
    url: "/",
    locale: "es_AR",
    alternateLocale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
};

export const viewport: Viewport = {
  themeColor: "#0C6E63",
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SITE_NAME,
  url: APP_URL,
  logo: `${APP_URL}/brand/presuly-logo-1200.png`,
  email: "hola@presuly.com.ar",
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE_NAME,
  url: APP_URL,
  inLanguage: ["es", "en"],
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const locale = await getLocale();
  return (
    <html
      lang={locale}
      className={`${poppins.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        {children}
        <Toaster />
      </body>
    </html>
  );
}
