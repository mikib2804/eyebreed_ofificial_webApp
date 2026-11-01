import type { Metadata } from "next";
import { Navbar } from "@/components/navbar";
import { FaqExperience } from "@/components/faq-experience";
import { Footer } from "@/components/footer";
import { CartDrawer } from "@/components/cart-drawer";

export const metadata: Metadata = {
  title: "Questions & Answers | EYEBREED OFFICIAL",
  description: "Answers about EYEBREED, the Vision collection, products, sizing, delivery, and returns.",
};

export default function FaqPage() {
  return <><Navbar /><FaqExperience /><Footer /><CartDrawer /></>;
}
