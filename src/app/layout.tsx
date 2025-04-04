import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import ClientThirdwebProvider from "@/components/client-thirdweb-provider";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Primape Market",
  description: "Predict the Jungle - Web3 prediction markets",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Primape Markets"
  },
  openGraph: {
    type: "website",
    title: "Primape Market",
    description: "The premier prediction marketplace on ApeChain",
    url: "https://primape.markets",
    siteName: "Primape Markets",
    images: [
      {
        url: "/images/pm.PNG",
        width: 512,
        height: 512,
        alt: "Primape Markets Logo"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Primape Market",
    description: "The premier prediction marketplace on ApeChain",
    images: ["/images/pm.PNG"],
    creator: "@PrimapeMarkets"
  },
  icons: [
    { rel: "icon", url: "/primape/pm-blk.png" },
    { rel: "icon", url: "/primape/pm-blk.png", sizes: "16x16", type: "image/png" },
    { rel: "icon", url: "/primape/pm-blk.png", sizes: "32x32", type: "image/png" },
    { rel: "apple-touch-icon", url: "/primape/pm-blk.png", sizes: "180x180" }
  ]
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <ClientThirdwebProvider>
            {children}
          </ClientThirdwebProvider>
        </ThemeProvider>
        <Toaster />
      </body>
    </html>
  );
}
