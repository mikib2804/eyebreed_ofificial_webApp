import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getAdminAccess } from "@/lib/admin-auth";
import { AdminProductForm } from "@/components/admin-product-form";
import { AdminDiscountManager } from "@/components/admin-discount-manager";
import { AdminInventory, AdminMessages, AdminOrders, AdminPreOrders, AdminSettings } from "@/components/admin-operations";

type ProductRow = { id:string; name:string; status:string; inventory:number; priceUsd:unknown; categoryName:string };
type MessageRow = { id:string; fullName:string; email:string; message:string; createdAt:Date; status:string; replyBody?:string|null };
type CustomerRow = { id:string; name:string|null; email:string|null; createdAt:Date };
type WaitRow = { id:string; email:string; createdAt:Date };
const sections = ["Overview","Products","Discounts","Orders","Pre-orders","Messages","Customers","Inventory","Settings"];

export default async function AdminPage({ searchParams }: { searchParams: Promise<{ section?:string }> }) {
  const access = await getAdminAccess();
  if (access.status === "unauthenticated") redirect("/login?callbackUrl=/admin");
  if (access.status === "forbidden") redirect("/");
  const active = (await searchParams).section ?? "Overview";
  const [categories, productRecords, messages, customers, waitlist, discounts, discountRedemptions, orders, preOrders, settings] = await Promise.all([
    prisma.category.findMany({ select:{ id:true, name:true }, orderBy:{ name:"asc" } }),
    prisma.product.findMany({ select:{ id:true,name:true,status:true,inventory:true,priceUsd:true,category:{select:{name:true}} }, orderBy:{createdAt:"desc"} }),
    prisma.contactMessage.findMany({ select:{id:true,fullName:true,email:true,message:true,createdAt:true,status:true,replyBody:true}, orderBy:{createdAt:"desc"}, take:100 }),
    prisma.user.findMany({ where:{role:"CUSTOMER"}, select:{id:true,name:true,email:true,createdAt:true}, orderBy:{createdAt:"desc"}, take:100 }),
    prisma.visionWaitlistEntry.findMany({ select:{id:true,email:true,createdAt:true}, orderBy:{createdAt:"desc"}, take:100 }),
    prisma.discount.findMany({ include: { products: { select: { id: true } }, categories: { select: { id: true } } }, orderBy: { createdAt: "desc" } }),
    prisma.discountRedemption.findMany({ include: { discount: { select: { name: true, code: true } }, order: { select: { orderNumber: true } } }, orderBy: { createdAt: "desc" }, take: 100 }),
    prisma.order.findMany({ select:{id:true,orderNumber:true,customerName:true,customerEmail:true,total:true,currency:true,status:true,paymentStatus:true,shippingStatus:true,trackingNumber:true,shippingProvider:true,createdAt:true}, orderBy:{createdAt:"desc"}, take:100 }),
    prisma.preOrder.findMany({ select:{id:true,email:true,status:true,createdAt:true,product:{select:{name:true}}}, orderBy:{createdAt:"desc"}, take:100 }),
    prisma.storeSettings.findUnique({where:{id:"store"}}),
  ]);
  const products: ProductRow[] = productRecords.map((product)=>({...product,categoryName:product.category.name}));
  const now = new Date();
  const [salesByCurrency, totalOrders, pendingOrders, shippedOrders, activeDiscounts, unreadMessages] = await Promise.all([
    prisma.order.groupBy({ by: ["currency"], where: { paymentStatus: "PAID" }, _sum: { total: true } }),
    prisma.order.count(),
    prisma.order.count({ where: { status: { notIn: ["DELIVERED", "CANCELLED", "REFUNDED"] } } }),
    prisma.order.count({ where: { shippingStatus: "SHIPPED" } }),
    prisma.discount.count({
      where: {
        active: true,
        AND: [
          { OR: [{ startsAt: null }, { startsAt: { lte: now } }] },
          { OR: [{ endsAt: null }, { endsAt: { gte: now } }] },
        ],
      },
    }),
    prisma.contactMessage.count({ where: { status: "NEW" } }),
  ]);
  const lowStock = products.filter(p => p.inventory <= 5);
  const totalSales = salesByCurrency.length
    ? salesByCurrency.map((row) => new Intl.NumberFormat("en", { style: "currency", currency: row.currency, maximumFractionDigits: 2 }).format(Number(row._sum.total ?? 0))).join(" · ")
    : "—";
  const cards = [["Total sales",totalSales],["Total orders",String(totalOrders)],["Pending orders",String(pendingOrders)],["Shipped",String(shippedOrders)],["Products",String(products.length)],["Low stock",String(lowStock.length)],["Active discounts",String(activeDiscounts)],["Unread messages",String(unreadMessages)]];
  return <main className="min-h-screen bg-[#f1eee8] text-[#171412]"><div className="grid min-h-screen lg:grid-cols-[250px_1fr]">
    <aside className="border-b border-black/10 bg-[#211b17] p-6 text-white lg:sticky lg:top-0 lg:h-screen"><p className="text-[10px] tracking-[.35em] text-white/55">EYEBREED</p><h1 className="mt-3 font-display text-3xl">Manager</h1><nav className="mt-8 flex gap-2 overflow-x-auto lg:block lg:space-y-1">{sections.map(s=><Link key={s} href={`/admin?section=${encodeURIComponent(s)}`} className={`block whitespace-nowrap rounded px-3 py-3 text-xs uppercase tracking-[.14em] ${active===s?'bg-white text-black':'text-white/60 hover:bg-white/10 hover:text-white'}`}>{s}</Link>)}</nav></aside>
    <section className="min-w-0 p-5 md:p-10"><header className="mb-10 flex flex-wrap items-end justify-between gap-4"><div><p className="text-[10px] uppercase tracking-[.3em] text-black/45">Management console</p><h2 className="mt-2 font-display text-5xl md:text-7xl">{active}</h2></div><p className="text-xs text-black/50">{access.user.email}</p></header>
      {active==="Overview" && <><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{cards.map(([label,value])=><article key={label} className="border border-black/10 bg-white p-5"><p className="text-[10px] uppercase tracking-[.18em] text-black/45">{label}</p><p className="mt-5 font-display text-4xl">{value}</p></article>)}</div><Panel title="Recent inquiries"><Messages rows={messages.slice(0,5)}/></Panel><Panel title="Inventory attention"><Products rows={lowStock.slice(0,8)}/></Panel></>}
      {active==="Products" && <><AdminProductForm categories={categories}/><Panel title="Product catalogue"><Products rows={products}/></Panel></>}
      {active==="Discounts" && <AdminDiscountManager categories={categories} products={products.map(({id,name})=>({id,name}))} discounts={discounts.map((discount)=>({id:discount.id,name:discount.name,code:discount.code,type:discount.type,scope:discount.scope,value:Number(discount.value),active:discount.active,startsAt:discount.startsAt?.toISOString()??null,endsAt:discount.endsAt?.toISOString()??null,minimumPurchase:discount.minimumPurchase===null?null:Number(discount.minimumPurchase),usageLimit:discount.usageLimit,perCustomerLimit:discount.perCustomerLimit,usageCount:discount.usageCount,productIds:discount.products.map((product)=>product.id),categoryIds:discount.categories.map((category)=>category.id)}))} redemptions={discountRedemptions.map((redemption)=>({id:redemption.id,discountName:redemption.discount.name,code:redemption.discount.code,orderNumber:redemption.order.orderNumber,email:redemption.email,amount:Number(redemption.amount),currency:redemption.currency,createdAt:redemption.createdAt.toISOString()}))}/>} 
      {active==="Inventory" && <><AdminInventory products={products.map(({id,name,inventory})=>({id,name,inventory}))}/><Panel title="Stock by product"><Products rows={products}/></Panel></>}
      {active==="Messages" && <Panel title="Contact inbox"><AdminMessages messages={messages.map((message)=>({...message,status:String(message.status),createdAt:message.createdAt.toISOString(),replyBody:message.replyBody??null}))}/></Panel>}
      {active==="Customers" && <Panel title="Registered customers"><div className="divide-y divide-black/10">{customers.map(c=><div className="flex justify-between gap-4 py-4 text-sm" key={c.id}><span>{c.name||"Unnamed customer"}</span><a className="underline" href={`mailto:${c.email}`}>{c.email}</a></div>)}</div></Panel>}
      {active==="Pre-orders" && <><Panel title="Product pre-orders"><AdminPreOrders items={preOrders.map((item)=>({id:item.id,email:item.email,productName:item.product.name,status:item.status,createdAt:item.createdAt.toISOString()}))}/></Panel><Panel title="Vision waitlist"><div className="divide-y divide-black/10">{waitlist.map(w=><div className="flex justify-between py-4 text-sm" key={w.id}><a className="underline" href={`mailto:${w.email}`}>{w.email}</a><time>{w.createdAt.toLocaleDateString("he-IL")}</time></div>)}</div></Panel></>}
      {active==="Orders" && <Panel title="Order fulfilment"><AdminOrders orders={orders.map((order)=>({...order,total:Number(order.total),status:order.status,paymentStatus:order.paymentStatus,shippingStatus:order.shippingStatus,createdAt:order.createdAt.toISOString()}))}/></Panel>}
      {active==="Settings" && <Panel title="Store settings"><AdminSettings settings={{contactEmail:settings?.contactEmail??"",contactPhone:settings?.contactPhone??"",shippingInfo:settings?.shippingInfo??"",defaultLowStockThreshold:settings?.defaultLowStockThreshold??5,announcement:settings?.announcement??"",announcementActive:settings?.announcementActive??false}}/></Panel>}
    </section></div></main>;
}
function Panel({title,children}:{title:string;children:React.ReactNode}) { return <section className="mt-8 border border-black/10 bg-white p-5 md:p-7"><h3 className="font-display text-3xl">{title}</h3><div className="mt-5">{children}</div></section> }
function Products({rows}:{rows:ProductRow[]}) { return <div className="overflow-x-auto"><table className="w-full min-w-[650px] text-left text-xs"><thead><tr className="border-b border-black"><th className="py-3">Product</th><th>Status</th><th>Stock</th><th>USD</th><th>Category</th></tr></thead><tbody>{rows.map(p=><tr key={p.id} className="border-b border-black/10"><td className="py-4 font-medium">{p.name}</td><td>{p.status}</td><td className={p.inventory<=5?'text-red-700':''}>{p.inventory}</td><td>${String(p.priceUsd)}</td><td>{p.categoryName}</td></tr>)}</tbody></table>{!rows.length&&<p className="py-8 text-black/50">No products found.</p>}</div> }
function Messages({rows}:{rows:MessageRow[]}) { return <div className="divide-y divide-black/10">{rows.map(m=><article key={m.id} className="py-5"><div className="flex flex-wrap justify-between gap-2"><p className="font-medium">{m.fullName} · <a className="underline" href={`mailto:${m.email}`}>{m.email}</a></p><span className="text-[10px] uppercase tracking-wider">{m.status}</span></div><p className="mt-2 line-clamp-3 text-sm leading-6 text-black/60">{m.message}</p></article>)}{!rows.length&&<p className="py-8 text-black/50">Inbox is empty.</p>}</div> }
