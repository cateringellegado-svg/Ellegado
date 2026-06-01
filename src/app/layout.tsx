import type { Metadata } from "next";
import { Cormorant_Garamond, Montserrat } from "next/font/google";
import { SiteConfigProvider } from "@/lib/site-config";
import { ToastProvider } from "@/components/Toast";
import DynamicSEO from "@/components/DynamicSEO";
import PublicLayoutWrapper from "@/components/PublicLayoutWrapper";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-cormorant",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600"],
  variable: "--font-montserrat",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://ellegado.vercel.app"),
  alternates: {
    canonical: "/",
  },
  icons: { icon: "/favicon.webp" },
  title: "EL LEGADO - Catering y Eventos | Haz Eterno Cada Momento",
  description: "Servicio de catering premium para eventos inolvidables. Elegancia, cercanía y alta gastronomía en cada detalle. Cotizá tu evento hoy.",
  keywords: ["catering premium", "eventos", "bocados gourmet", "el legado", "servicio de comida", "eventos sociales"],
  authors: [{ name: "El Legado - Catering y Eventos" }],
  openGraph: {
    type: "website",
    url: "https://ellegado.vercel.app/",
    title: "EL LEGADO - Catering y Eventos Premium",
    description: "Servicio de catering premium para eventos inolvidables. Haz eterno cada momento con elegancia y gastronomía de alta gama.",
  },
  twitter: {
    card: "summary_large_image",
    title: "EL LEGADO - Catering y Eventos Premium",
    description: "Servicio de catering premium para eventos inolvidable. Elegancia, cercanía y alta gastronomía.",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="scroll-smooth">
      <body className={`${cormorant.variable} ${montserrat.variable} antialiased bg-cream text-dark-elegant selection:bg-brand-copper/20`}>
        {/* Skip to Content (Accessibility) */}
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:bg-brand-copper focus:text-white focus:px-4 focus:py-2 focus:rounded-lg focus:shadow-xl">
          Saltar al contenido principal
        </a>
        
        <SiteConfigProvider>
          <DynamicSEO />
          <ToastProvider>
            <PublicLayoutWrapper>
              {children}
            </PublicLayoutWrapper>
          </ToastProvider>
        </SiteConfigProvider>

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "LocalBusiness",
              name: "El Legado - Catering y Eventos",
              description: "Servicio de catering premium para eventos inolvidables",
              telephone: "+541176753854",
              email: "catering.ellegado@gmail.com",
              url: "https://ellegado.vercel.app",
              address: {
                "@type": "PostalAddress",
                addressCountry: "AR",
                addressRegion: "Buenos Aires",
                addressLocality: "Buenos Aires",
              },
              priceRange: "$$$",
              openingHoursSpecification: {
                "@type": "OpeningHoursSpecification",
                dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
                opens: "09:00",
                closes: "20:00",
              },
              sameAs: [],
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: [
                {
                  "@type": "Question",
                  name: "¿Cuál es el mínimo de personas para un evento?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Trabajamos con eventos de mediana envergadura, generalmente desde 50 personas. Para eventos más pequeños o más grandes, contactanos y te asesoramos.",
                  },
                },
                {
                  "@type": "Question",
                  name: "¿Con cuánta anticipación debo reservar el catering?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Recomendamos reservar con al menos 2-3 semanas de anticipación para eventos estándar. Para eventos grandes o fechas especiales, sugerimos 1-2 meses.",
                  },
                },
                {
                  "@type": "Question",
                  name: "¿Puedo personalizar el menú?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "¡Por supuesto! Nuestro cotizador online te permite armar tu menú a medida. También podés contactarnos por WhatsApp para opciones personalizadas.",
                  },
                },
                {
                  "@type": "Question",
                  name: "¿Incluyen servicio de garzones y vajilla?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Sí, ofrecemos paquetes completos que incluyen garzones, vajilla, decoración y todo lo necesario para tu evento. Consultanos por los detalles.",
                  },
                },
                {
                  "@type": "Question",
                  name: "¿En qué zona de Argentina operan?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Operamos principalmente en Buenos Aires y alrededores. Para eventos en otras zonas, contactanos y evaluamos la logística.",
                  },
                },
              ],
            }),
          }}
        />
      </body>
    </html>
  );
}
