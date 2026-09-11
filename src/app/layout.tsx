import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Fresque TMS — Formation Troubles Musculo-Squelettiques",
  description: "Associez causes, symptômes et moyens de prévention des TMS.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="antialiased">{children}</body>
    </html>
  );
}
