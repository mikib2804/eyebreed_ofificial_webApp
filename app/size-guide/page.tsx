import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { CartDrawer } from "@/components/cart-drawer";
import { SizeGuideExperience } from "@/components/size-guide/size-guide-experience";

export const metadata = { title: "Vision Size Guide | EYEBREED", description: "Measurements and personalized size recommendations for the EYEBREED Vision collection." };

export default function SizeGuidePage() { return <><Navbar /><SizeGuideExperience /><Footer /><CartDrawer /></>; }
