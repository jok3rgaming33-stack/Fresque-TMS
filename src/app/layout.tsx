import type { Metadata } from "next";
import "./globals.css";
import RegisterSw from "@/components/RegisterSw";

export const metadata: Metadata = {
  title: "Fresque TMS — Formation Troubles Musculo-Squelettiques",
  description: "Atelier coopératif : associer causes, symptômes et moyens de prévention des TMS.",
  manifest: "/manifest.webmanifest",
};

export const viewport = { themeColor: "#121417" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="antialiased">
        <RegisterSw />
        {children}
      </body>
    </html>
  );
}
