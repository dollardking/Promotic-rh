import type { Metadata } from "next";
import "./globals.css";

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
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}