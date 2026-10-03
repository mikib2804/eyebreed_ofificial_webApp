import type { Metadata } from "next";
import { Cormorant_Garamond, Montserrat } from "next/font/google";
import { StoreProvider } from "@/components/store-provider";
import { CookieConsent } from "@/components/cookie-consent";
import "./globals.css";
import { PaletteProvider } from "@/components/palette-provider";
import { paletteBootstrap, palettes, paletteVariables } from "@/lib/palettes";
import type { CSSProperties } from "react";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-cormorant",
  weight: ["400", "500", "600"],
});
const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "EYEBREED — Elevated essentials",
  icons: {
    icon: "/icon.ico",
  },
  description: "Timeless clothing, considered for modern life.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" style={paletteVariables(palettes[0]) as CSSProperties} suppressHydrationWarning>
      <body className={`${cormorant.variable} ${montserrat.variable}`}>
        <script dangerouslySetInnerHTML={{ __html: paletteBootstrap }} />
        <PaletteProvider>
        <StoreProvider>
          {children}
          <CookieConsent />
        </StoreProvider>
        </PaletteProvider>
      </body>
    </html>
  );
}
