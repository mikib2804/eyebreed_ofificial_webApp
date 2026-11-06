import type { Metadata } from "next";
import { Cormorant_Garamond, Montserrat } from "next/font/google";
import { StoreProvider } from "@/components/store-provider";
import { CookieConsent } from "@/components/cookie-consent";
import "./globals.css";
import { PaletteProvider } from "@/components/palette-provider";
import { paletteBootstrap, palettes, paletteVariables } from "@/lib/palettes";
import type { CSSProperties } from "react";
import { AuthProvider } from "@/components/auth-provider";

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
  title: { default: "EYEBREED — Elevated essentials", template: "%s · EYEBREED" },
  icons: {
    icon: "/icon.ico",
  },
  description: "Timeless clothing, considered for modern life.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="he"
      dir="rtl"
      style={paletteVariables(palettes[0]) as CSSProperties}
      suppressHydrationWarning
    >
      <body className={`${cormorant.variable} ${montserrat.variable}`}>
        <a href="#main-content" className="sr-only z-[100] rounded bg-white px-4 py-3 text-sm text-black focus:not-sr-only focus:fixed focus:start-4 focus:top-4">Skip to main content</a>
        <script dangerouslySetInnerHTML={{ __html: paletteBootstrap }} />
        <PaletteProvider>
          <AuthProvider><StoreProvider>
            <div id="main-content" tabIndex={-1}>{children}</div>
            <CookieConsent />
          </StoreProvider></AuthProvider>
        </PaletteProvider>
      </body>
    </html>
  );
}
