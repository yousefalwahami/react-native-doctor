import type { Metadata } from "next";
import { IBM_Plex_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

const SITE_URL = "https://react-native-doc.vercel.app";
const TWITTER_IMAGE_PATH = "/og-banner.svg";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "React Native Doctor",
  description: "Diagnose React Native & Expo codebase health.",
  twitter: {
    card: "summary_large_image",
    images: [TWITTER_IMAGE_PATH],
  },
  icons: { icon: "/favicon.svg" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${ibmPlexMono.variable} antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
