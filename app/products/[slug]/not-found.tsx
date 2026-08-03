import Link from "next/link";

export default function ProductNotFound() {
  return <main className="grid min-h-screen place-items-center bg-ink px-6 text-center text-white"><div><p className="font-display text-7xl">Not found</p><p className="mt-4 text-xs tracking-luxury text-white/60">THIS PIECE IS NO LONGER AVAILABLE</p><Link href="/#products" className="mt-8 inline-block border border-white/40 px-6 py-4 text-[10px] tracking-luxury">RETURN TO COLLECTION</Link></div></main>;
}
