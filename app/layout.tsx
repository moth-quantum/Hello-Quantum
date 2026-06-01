import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Hello Quantum",
  description: "A puzzle game about quantum mechanics",
};

export const viewport: Viewport = {
  themeColor: "#4052B5",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased quantum-bg min-h-screen`}>
        {children}
      </body>
    </html>
  );
}
