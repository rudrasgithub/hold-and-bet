import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Toaster } from 'react-hot-toast';
import { Navbar } from "./components/Navbar";
import Footer from "./components/Footer";
import Head from "next/head";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Hold & Bet: Card Clash",
  description: "The Ultimate Card Clash Game",
  icons: {
    icon: [{
      url: '/favicon.ico'
    }]
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="en" className="mx-10">
      <Head>
      <link rel="icon" href="/favicon.ico" sizes="any" />
      </Head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-900`}
      >
        <Providers>
          <div className="mx-28 my-3 backdrop-blur-lg sticky top-0 bg-background/80 z-50">
            <Navbar />
          </div>
          <div className="mx-10">{children}</div>
          <div className="mx-10">
            <Footer />
          </div>
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
