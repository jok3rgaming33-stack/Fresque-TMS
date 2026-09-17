import type { Metadata, Viewport } from "next";
import { Fraunces, Outfit } from "next/font/google";
import "./globals.css";
import RegisterSw from "@/components/RegisterSw";

const sans = Outfit({ subsets: ["latin"], variable: "--font-sans" });
const serif = Fraunces({ subsets: ["latin"], variable: "--font-serif" });

export const metadata: Metadata = {
  title: "Fresque TMS — Formation Troubles Musculo-Squelettiques",
  description: "Atelier coopératif : associer causes, symptômes et moyens de prévention des TMS.",
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#0b0c0e",
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className={`${sans.variable} ${serif.variable} font-sans antialiased`}>
        <div className="grain" />
        <RegisterSw />
        {children}
      </body>
    </html>
  );
}
