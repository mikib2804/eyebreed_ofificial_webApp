import Link from "next/link";

export default async function CheckoutCancelPage({ searchParams }: { searchParams: Promise<{ order?: string }> }) {
  const { order } = await searchParams;
  return <main className="grid min-h-[70vh] place-items-center bg-cream px-6 text-center text-ink"><div className="max-w-xl"><p className="text-[10px] tracking-luxury">{order ? `ORDER ${order}` : "CHECKOUT"}</p><h1 className="mt-4 font-display text-6xl">Payment cancelled</h1><p className="mt-6 text-sm leading-7 text-black/65">No successful payment was recorded. Your cart remains available so you can review it and try again.</p><Link href="/#products" className="mt-8 inline-flex min-h-12 items-center rounded-full bg-ink px-7 text-[10px] tracking-luxury !text-white">RETURN TO STORE</Link></div></main>;
}
