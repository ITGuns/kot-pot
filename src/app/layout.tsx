import type { Metadata, Viewport } from "next";
import { Bebas_Neue, Instrument_Serif, Manrope, Noto_Sans_KR } from "next/font/google";
import { SITE_URL } from "@/lib/constants";
import "./globals.css";

const display = Instrument_Serif({ weight: "400", style: ["normal", "italic"], subsets: ["latin"], variable: "--font-display-serif", display: "swap" });
const sans = Manrope({ subsets: ["latin"], variable: "--font-sans-body", display: "swap" });
const label = Bebas_Neue({ weight: "400", subsets: ["latin"], variable: "--font-label-condensed", display: "swap" });
const korean = Noto_Sans_KR({ subsets: ["latin"], variable: "--font-korean", display: "swap", preload: false });

/* Public pages override these with values from the database (see app/(site)/layout.tsx). */
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "Kot Pot I — Korean BBQ & Hot Pot · McAllen, TX", template: "%s | Kot Pot I" },
  description: "Authentic Korean BBQ and bubbling hot pot in McAllen, TX. All-you-can-eat menu, premium marbled meats, signature broths and soju cocktails.",
  openGraph: { type: "website", siteName: "Kot Pot I", locale: "en_US" },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: "#0a0908",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable} ${label.variable} ${korean.variable}`}>
      <body>{children}</body>
    </html>
  );
}
