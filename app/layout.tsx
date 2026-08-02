import type { Metadata } from "next";
import { Cormorant_Garamond, Montserrat } from "next/font/google";
import { StoreProvider } from "@/components/store-provider";
import "./globals.css";

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
    icon: "/appIcon.ico",
  },
  description: "Timeless clothing, considered for modern life.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${cormorant.variable} ${montserrat.variable}`}>
        <StoreProvider>{children}</StoreProvider>
      </body>
    </html>
  );
}
