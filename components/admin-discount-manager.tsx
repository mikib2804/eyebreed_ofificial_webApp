"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type Discount = { id: string; name: string; code: string | null; type: "PERCENTAGE" | "FIXED"; scope: "STORE" | "PRODUCT" | "CATEGORY"; value: number; active: boolean; startsAt: string | null; endsAt: string | null; minimumPurchase: number | null; usageLimit: number | null; perCustomerLimit: number | null; usageCount: number; productIds: string[]; categoryIds: string[] };
type Option = { id: string; name: string };
type Redemption = { id: string; discountName: string; code: string | null; orderNumber: string; email: string; amount: number; currency: string; createdAt: string };

const field = "mt-2 min-h-11 w-full border border-black/20 bg-white px-3 text-sm outline-none focus:border-black";
const dateValue = (value: string | null) => value ? new Date(value).toISOString().slice(0, 16) : "";

export function AdminDiscountManager({ discounts, products, categories, redemptions }: { discounts: Discount[]; products: Option[]; categories: Option[]; redemptions: Redemption[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<Discount | null>(null);
  const [scope, setScope] = useState<Discount["scope"]>("STORE");
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState(false);

  function startEdit(discount: Discount) { setEditing(discount); setScope(discount.scope); setMessage(""); }
  function reset() { setEditing(null); setScope("STORE"); setMessage(""); }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setMessage(""); setError(false);
    const form = new FormData(event.currentTarget);
    const body = {
      name: form.get("name"), code: form.get("code"), type: form.get("type"), scope: form.get("scope"), value: form.get("value"), active: form.get("active") === "on",
      startsAt: form.get("startsAt"), endsAt: form.get("endsAt"), minimumPurchase: form.get("minimumPurchase"), usageLimit: form.get("usageLimit"), perCustomerLimit: form.get("perCustomerLimit"),
      productIds: form.getAll("productIds"), categoryIds: form.getAll("categoryIds"),
    };
    const response = await fetch(editing ? `/api/admin/discounts/${editing.id}` : "/api/admin/discounts", { method: editing ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const result = await response.json().catch(() => ({})); setBusy(false);
    if (!response.ok) { setError(true); setMessage(result.error ?? "Could not save discount."); return; }
    setMessage(editing ? "Discount updated." : "Discount created."); setEditing(null); setScope("STORE"); event.currentTarget.reset(); router.refresh();
  }

  return <div className="space-y-8">
    <form key={editing?.id ?? "new"} onSubmit={submit} className="grid gap-5 border border-black/20 bg-white p-6 md:grid-cols-2">
      <div className="md:col-span-2 flex items-center justify-between gap-4"><h3 className="font-display text-3xl">{editing ? "Edit discount" : "Create discount"}</h3>{editing && <button type="button" onClick={reset} className="text-xs underline">Cancel edit</button>}</div>
      <Field label="Name"><input className={field} name="name" defaultValue={editing?.name ?? "15% website promotion"} required /></Field>
      <Field label="Code (leave blank for automatic promotion)"><input className={field} name="code" defaultValue={editing?.code ?? ""} maxLength={64} /></Field>
      <Field label="Type"><select className={field} name="type" defaultValue={editing?.type ?? "PERCENTAGE"}><option value="PERCENTAGE">Percentage</option><option value="FIXED">Fixed amount</option></select></Field>
      <Field label="Value"><input className={field} name="value" type="number" min="0.01" max="1000000" step="0.01" defaultValue={editing?.value ?? 15} required /></Field>
      <Field label="Scope"><select className={field} name="scope" value={scope} onChange={(event) => setScope(event.target.value as Discount["scope"])}><option value="STORE">Entire store</option><option value="PRODUCT">Selected products</option><option value="CATEGORY">Selected categories</option></select></Field>
      {scope === "PRODUCT" && <Field label="Products"><select className={`${field} min-h-32 py-2`} name="productIds" multiple defaultValue={editing?.productIds}>{products.map((product) => <option key={product.id} value={product.id}>{product.name}</option>)}</select></Field>}
      {scope === "CATEGORY" && <Field label="Categories"><select className={`${field} min-h-32 py-2`} name="categoryIds" multiple defaultValue={editing?.categoryIds}>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></Field>}
      <Field label="Starts at"><input className={field} name="startsAt" type="datetime-local" defaultValue={dateValue(editing?.startsAt ?? null)} /></Field>
      <Field label="Ends at"><input className={field} name="endsAt" type="datetime-local" defaultValue={dateValue(editing?.endsAt ?? null)} /></Field>
      <Field label="Minimum purchase"><input className={field} name="minimumPurchase" type="number" min="0" step="0.01" defaultValue={editing?.minimumPurchase ?? ""} /></Field>
      <Field label="Total usage limit"><input className={field} name="usageLimit" type="number" min="1" defaultValue={editing?.usageLimit ?? ""} /></Field>
      <Field label="Per-customer limit"><input className={field} name="perCustomerLimit" type="number" min="1" defaultValue={editing?.perCustomerLimit ?? ""} /></Field>
      <label className="flex items-center gap-3 text-sm"><input type="checkbox" name="active" defaultChecked={editing?.active ?? true} /> Active</label>
      <div className="md:col-span-2 flex flex-wrap items-center gap-4"><button disabled={busy} className="bg-ink px-6 py-4 text-xs tracking-luxury text-white disabled:opacity-50">{busy ? "SAVING…" : editing ? "UPDATE DISCOUNT" : "CREATE DISCOUNT"}</button>{message && <p role={error ? "alert" : "status"} className={`text-xs ${error ? "text-red-700" : "text-green-800"}`}>{message}</p>}</div>
    </form>
    <section className="border border-black/10 bg-white p-6"><h3 className="font-display text-3xl">Configured discounts</h3><div className="mt-5 divide-y divide-black/10">{discounts.map((discount) => <article key={discount.id} className="flex flex-wrap items-center justify-between gap-4 py-4"><div><div className="flex items-center gap-3"><b>{discount.name}</b><span className={`rounded-full px-2 py-1 text-[9px] ${discount.active ? "bg-green-100 text-green-900" : "bg-black/5 text-black/50"}`}>{discount.active ? "ACTIVE" : "INACTIVE"}</span></div><p className="mt-1 text-xs text-black/55">{discount.code ?? "Automatic"} · {discount.type === "PERCENTAGE" ? `${discount.value}%` : discount.value} · {discount.scope} · used {discount.usageCount}{discount.usageLimit ? `/${discount.usageLimit}` : ""}</p></div><button type="button" onClick={() => startEdit(discount)} className="text-xs underline underline-offset-4">Edit</button></article>)}{!discounts.length && <p className="py-8 text-sm text-black/50">No discounts configured yet.</p>}</div></section>
    <section className="border border-black/10 bg-white p-6"><h3 className="font-display text-3xl">Recent redemptions</h3><div className="mt-5 overflow-x-auto"><table className="w-full min-w-[720px] text-left text-xs"><thead><tr className="border-b border-black"><th className="py-3">Discount</th><th>Order</th><th>Customer</th><th>Saved</th><th>Date</th></tr></thead><tbody>{redemptions.map((redemption)=><tr key={redemption.id} className="border-b border-black/10"><td className="py-4">{redemption.discountName}<small className="block text-black/50">{redemption.code ?? "Automatic"}</small></td><td>#{redemption.orderNumber}</td><td>{redemption.email}</td><td>{new Intl.NumberFormat("en",{style:"currency",currency:redemption.currency}).format(redemption.amount)}</td><td>{new Date(redemption.createdAt).toLocaleDateString()}</td></tr>)}</tbody></table>{!redemptions.length&&<p className="py-8 text-sm text-black/50">No discount codes have been redeemed yet.</p>}</div></section>
  </div>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="text-xs text-black/65">{label}{children}</label>; }
