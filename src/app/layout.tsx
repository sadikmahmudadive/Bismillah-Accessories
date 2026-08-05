import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";

import { AuthProvider } from "@/components/auth/auth-provider";
import { AnimatedBackground } from "@/components/layout/animated-background";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Bismillah Accessories",
    template: "%s | Bismillah Accessories",
  },
  description:
    "Elevate your everyday tech with curated premium accessories. Fast, reliable delivery across Bangladesh.",
  keywords: ["accessories", "mobile cases", "tech gear", "Bismillah Accessories"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <head>
        {/* Preconnect hints with proper CORS credentials to avoid unused origin warnings */}
        <link rel="preconnect" href="https://apis.google.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://apis.google.com" />
        <link rel="dns-prefetch" href="https://bismillah-accessories.firebaseapp.com" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} flex min-h-full flex-col antialiased`}
      >
        <AuthProvider>
          <AnimatedBackground />
          <Navbar />
          <div className="flex-1">{children}</div>
          <Footer />
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  );
}
