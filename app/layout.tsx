import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "Hôtel Le Clos Familial – Amboise, Vallée de la Loire",
    template: "%s | Hôtel Le Clos Familial",
  },
  description:
    "Hôtel familial au cœur d'Amboise, Vallée de la Loire. Chambres confortables, accueil chaleureux et emplacement idéal pour visiter les châteaux de la Loire.",
  metadataBase: new URL("https://www.leclosfamilial.fr"),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className={`${inter.variable} h-full`}>
      <body className="min-h-full flex flex-col font-sans antialiased text-stone-800 bg-white">
        {children}
      </body>
    </html>
  );
}
