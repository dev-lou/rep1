import type { Metadata, Viewport } from "next";
import { Poppins, Space_Grotesk } from "next/font/google";
import Script from "next/script";
import "./globals.css";
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-poppins",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-heading",
  display: "swap",
});

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://snapit-photobooth.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: "Snap IT | PhotoBooth",
  description: "Premium photo booth experience — capture, customize, and share your moments.",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "Snap IT | PhotoBooth",
    description: "Premium photo booth experience — capture, customize, and share your moments.",
    url: "/",
    siteName: "Snap IT PhotoBooth",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Snap IT PhotoBooth",
      },
    ],
    locale: "en_US",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#faf9f6",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full w-full">
      <body
        className={`${poppins.variable} ${spaceGrotesk.variable} font-poppins h-full w-full overflow-hidden antialiased`}
        style={{ color: "#1a1a1a" }}
      >
        {children}
        <Script
          id="register-sw"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              if ("serviceWorker" in navigator) {
                window.addEventListener("load", () => {
                  navigator.serviceWorker.register("/sw.js").catch(() => {});
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
