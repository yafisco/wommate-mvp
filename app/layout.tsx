import type { Metadata } from "next";
import { Bricolage_Grotesque, Inter, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import BottomNav from "@/components/layout/BottomNav";
import Footer from "@/components/layout/Footer";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Notifications } from "@/components/layout/Notifications";

/* Chargement optimisé des polices via next/font/google (subset latin, swap) */

// Display — titres de section, hero (poids 600-700)
const bricolageGrotesque = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-bricolage-grotesque",
  display: "swap",
});

// Corps de texte (poids 400-500)
const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-inter",
  display: "swap",
});

// Utilitaire — badges, filières, stats, dates
const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-ibm-plex-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Wommate — Entraide Étudiante",
  description:
    "Plateforme communautaire d'entraide étudiante : partage de ressources, mise en relation, mentorat.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${bricolageGrotesque.variable} ${inter.variable} ${ibmPlexMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-bone text-encre font-sans pb-16 md:pb-0">
        <ErrorBoundary>
          {/* Navigation Desktop (Haut de page) */}
          <Header />

          {/* Notifications en temps réel */}
          <Notifications />

          {/* Contenu principal */}
          <div className="flex-1 flex flex-col">
            {children}
          </div>

          {/* Navigation Mobile (Bas de page) */}
          <BottomNav />

          {/* Pied de page Desktop */}
          <Footer />
        </ErrorBoundary>
      </body>
    </html>
  );
}
