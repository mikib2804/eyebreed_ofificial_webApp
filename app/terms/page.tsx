import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { CartDrawer } from "@/components/cart-drawer";
import { TermsExperience } from "@/components/terms-experience";

export const metadata = { title: "Terms of Use | EYEBREED OFFICIAL", description: "EYEBREED Official website terms, purchase conditions, returns, and shipping." };

export default function TermsPage() { return <><Navbar /><TermsExperience /><Footer /><CartDrawer /></>; }
