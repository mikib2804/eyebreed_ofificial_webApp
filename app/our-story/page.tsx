import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { CartDrawer } from "@/components/cart-drawer";
import { OurStoryExperience } from "@/components/our-story-experience";

export const metadata = { title: "Our Story | EYEBREED", description: "The story and vision behind EYEBREED." };

export default function OurStoryPage() {
  return <><Navbar /><OurStoryExperience /><Footer /><CartDrawer /></>;
}
