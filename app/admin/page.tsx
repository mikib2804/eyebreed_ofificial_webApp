import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { AdminProductForm } from "@/components/admin-product-form";

type ProductRow = { id:string; name:string; status:string; inventory:number; priceUsd:unknown; categoryName:string };
type MessageRow = { id:string; fullName:string; email:string; message:string; createdAt:Date; status:string };
type CustomerRow = { id:string; name:string|null; email:string|null; createdAt:Date };
type WaitRow = { id:string; email:string; createdAt:Date };
const sections = ["Overview","Products","Discounts","Orders","Pre-orders","Messages","Customers","Inventory","Settings"];

export default async function AdminPage({ searchParams }: { searchParams: Promise<{ section?:string }> }) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/");
  const active = (await searchParams).section ?? "Overview";
  const [categories, products, messages, customers, waitlist] = await Promise.all([
    prisma.category.findMany({ select:{ id:true, name:true }, orderBy:{ name:"asc" } }),
    prisma.$queryRaw<ProductRow[]>`SELECT p."id",p."name",p."status",p."inventory",p."priceUsd",c."name" AS "categoryName" FROM "Product" p JOIN "Category" c ON c."id"=p."categoryId" ORDER BY p."createdAt" DESC`,
    prisma.$queryRaw<MessageRow[]>`SELECT "id","fullName","email","message","createdAt", COALESCE("status"::text,'NEW') AS "status" FROM "ContactMessage" ORDER BY "createdAt" DESC LIMIT 100`.catch(() => prisma.$queryRaw<MessageRow[]>`SELECT "id","fullName","email","message","createdAt",'NEW' AS "status" FROM "ContactMessage" ORDER BY "createdAt" DESC LIMIT 100`),
    prisma.$queryRaw<CustomerRow[]>`SELECT "id","name","email","createdAt" FROM "User" WHERE "role"='CUSTOMER' ORDER BY "createdAt" DESC LIMIT 100`,
    prisma.$queryRaw<WaitRow[]>`SELECT "id","email","createdAt" FROM "VisionWaitlistEntry" ORDER BY "createdAt" DESC LIMIT 100`,
  ]);
  const lowStock = products.filter(p => p.inventory <= 5);
  const cards = [["Total sales","—"],["Total orders","0"],["Pending orders","0"],["Shipped","0"],["Products",String(products.length)],["Low stock",String(lowStock.length)],["Active discounts","0"],["Unread messages",String(messages.filter(m=>m.status==='NEW').length)]];
  return <main className="min-h-screen bg-[#f1eee8] text-[#171412]"><div className="grid min-h-screen lg:grid-cols-[250px_1fr]">
    <aside className="border-b border-black/10 bg-[#211b17] p-6 text-white lg:sticky lg:top-0 lg:h-screen"><p className="text-[10px] tracking-[.35em] text-white/55">EYEBREED</p><h1 className="mt-3 font-display text-3xl">Manager</h1><nav className="mt-8 flex gap-2 overflow-x-auto lg:block lg:space-y-1">{sections.map(s=><Link key={s} href={`/admin?section=${encodeURIComponent(s)}`} className={`block whitespace-nowrap rounded px-3 py-3 text-xs uppercase tracking-[.14em] ${active===s?'bg-white text-black':'text-white/60 hover:bg-white/10 hover:text-white'}`}>{s}</Link>)}</nav></aside>
    <section className="min-w-0 p-5 md:p-10"><header className="mb-10 flex flex-wrap items-end justify-between gap-4"><div><p className="text-[10px] uppercase tracking-[.3em] text-black/45">Management console</p><h2 className="mt-2 font-display text-5xl md:text-7xl">{active}</h2></div><p className="text-xs text-black/50">{session.user.email}</p></header>
      {active==="Overview" && <><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{cards.map(([label,value])=><article key={label} className="border border-black/10 bg-white p-5"><p className="text-[10px] uppercase tracking-[.18em] text-black/45">{label}</p><p className="mt-5 font-display text-4xl">{value}</p></article>)}</div><Panel title="Recent inquiries"><Messages rows={messages.slice(0,5)}/></Panel><Panel title="Inventory attention"><Products rows={lowStock.slice(0,8)}/></Panel></>}
      {active==="Products" && <><AdminProductForm categories={categories}/><Panel title="Product catalogue"><Products rows={products}/></Panel></>}
      {active==="Inventory" && <Panel title="Stock by product"><Products rows={products}/></Panel>}
      {active==="Messages" && <Panel title="Contact inbox"><Messages rows={messages}/></Panel>}
      {active==="Customers" && <Panel title="Registered customers"><div className="divide-y divide-black/10">{customers.map(c=><div className="flex justify-between gap-4 py-4 text-sm" key={c.id}><span>{c.name||"Unnamed customer"}</span><a className="underline" href={`mailto:${c.email}`}>{c.email}</a></div>)}</div></Panel>}
      {active==="Pre-orders" && <Panel title="Vision waitlist"><div className="divide-y divide-black/10">{waitlist.map(w=><div className="flex justify-between py-4 text-sm" key={w.id}><a className="underline" href={`mailto:${w.email}`}>{w.email}</a><time>{w.createdAt.toLocaleDateString("he-IL")}</time></div>)}</div></Panel>}
      {["Discounts","Orders","Settings"].includes(active) && <Panel title={`${active} workspace`}><p className="text-sm leading-7 text-black/60">This workspace becomes operational after applying the included database migration and configuring the project’s payment, email, and image-storage providers.</p></Panel>}
    </section></div></main>;
}
function Panel({title,children}:{title:string;children:React.ReactNode}) { return <section className="mt-8 border border-black/10 bg-white p-5 md:p-7"><h3 className="font-display text-3xl">{title}</h3><div className="mt-5">{children}</div></section> }
function Products({rows}:{rows:ProductRow[]}) { return <div className="overflow-x-auto"><table className="w-full min-w-[650px] text-left text-xs"><thead><tr className="border-b border-black"><th className="py-3">Product</th><th>Status</th><th>Stock</th><th>USD</th><th>Category</th></tr></thead><tbody>{rows.map(p=><tr key={p.id} className="border-b border-black/10"><td className="py-4 font-medium">{p.name}</td><td>{p.status}</td><td className={p.inventory<=5?'text-red-700':''}>{p.inventory}</td><td>${String(p.priceUsd)}</td><td>{p.categoryName}</td></tr>)}</tbody></table>{!rows.length&&<p className="py-8 text-black/50">No products found.</p>}</div> }
function Messages({rows}:{rows:MessageRow[]}) { return <div className="divide-y divide-black/10">{rows.map(m=><article key={m.id} className="py-5"><div className="flex flex-wrap justify-between gap-2"><p className="font-medium">{m.fullName} · <a className="underline" href={`mailto:${m.email}`}>{m.email}</a></p><span className="text-[10px] uppercase tracking-wider">{m.status}</span></div><p className="mt-2 line-clamp-3 text-sm leading-6 text-black/60">{m.message}</p></article>)}{!rows.length&&<p className="py-8 text-black/50">Inbox is empty.</p>}</div> }
