// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import ModalAppElement from './ModalAppElement';

export const metadata: Metadata = {
  title: "Promotic_RH",
  description: "Une application de gestion des ressources humaines",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className="antialiased">
        <div id="__next">
          <ModalAppElement /> {/* AJOUTÉ ICI */}
          {children}
        </div>
      </body>
    </html>
  );
}