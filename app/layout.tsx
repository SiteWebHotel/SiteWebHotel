import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "Hôtel du Commerce – Bellegarde",
    template: "%s | Hôtel du Commerce",
  },
  description:
    "Hôtel du Commerce à Bellegarde. Chambres confortables, accueil chaleureux et tarifs accessibles.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ||
      "https://hotelducommercebellegarde.vercel.app"
  ),
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
