import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Navigation } from '../components/layout/Navigation';
import { Providers } from './providers';
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "JewishID - Identity Verification System",
  description: "Secure identity verification for the Jewish Network State",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.className} antialiased min-h-screen bg-background`}
      >
        <Providers>
          <Navigation />
          <main className="container mx-auto">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
