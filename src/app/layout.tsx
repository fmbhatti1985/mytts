import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI Text to Speech",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        {/* GOOGLE ADSENSE SCRIPT PLACEHOLDER */}
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
        
        {/* MONETAG / OTHER ADS SCRIPT PLACEHOLDER */}
        {/* <Script 
          src="https://your-monetag-script-url.js" 
          data-zone="XXXXXX" 
          async 
          data-cfasync="false"
          strategy="afterInteractive"
        /> */}
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
