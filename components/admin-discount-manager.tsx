"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type Discount = { id: string; name: string; code: string | null; type: "PERCENTAGE" | "FIXED"; scope: "STORE" | "PRODUCT" | "CATEGORY"; value: number; active: boolean; startsAt: string | null; endsAt: string | null; minimumPurchase: number | null; usageLimit: number | null; perCustomerLimit: number | null; usageCount: number; productIds: string[]; categoryIds: string[] };
type Option = { id: string; name: string };
type Redemption = { id: string; discountName: string; code: string | null; orderNumber: string; email: string; amount: number; currency: string; createdAt: string };

const field = "mt-2 min-h-11 w-full border border-black/20 bg-white px-3 text-sm !text-[#171412] caret-black [color-scheme:light] placeholder:!text-black/35 outline-none focus:border-black";
const dateValue = (value: string | null) => value ? new Date(value).toISOString().slice(0, 16) : "";

export function AdminDiscountManager({ discounts, products, categories, redemptions }: { discounts: Discount[]; products: Option[]; categories: Option[]; redemptions: Redemption[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<Discount | null>(null);
  const [scope, setScope] = useState<Discount["scope"]>("STORE");
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!editing) return;
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    nameRef.current?.focus({ preventScroll: true });
  }, [editing]);

  function startEdit(discount: Discount) {
    setEditing(discount);
    setScope(discount.scope);
    setSelectedProductIds(discount.productIds);
    setSelectedCategoryIds(discount.categoryIds);
    setMessage("");
  }
  function reset() { setEditing(null); setScope("STORE"); setSelectedProductIds([]); setSelectedCategoryIds([]); setMessage(""); }

  function toggleSelection(id: string, selected: boolean, current: string[], update: (ids: string[]) => void) {
    update(selected ? [...new Set([...current, id])] : current.filter((currentId) => currentId !== id));
  }

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
    setMessage(editing ? "Discount updated." : "Discount created."); setEditing(null); setScope("STORE"); setSelectedProductIds([]); setSelectedCategoryIds([]); event.currentTarget.reset(); router.refresh();
  }

  return <div className="space-y-8">
    <form ref={formRef} key={editing?.id ?? "new"} dir="ltr" onSubmit={submit} className={`admin-discount-form scroll-mt-5 grid min-w-0 gap-5 border bg-white p-3 text-[#171412] sm:p-6 md:grid-cols-2 ${editing ? "border-black ring-2 ring-black/10" : "border-black/20"}`}>
      <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between md:col-span-2"><h3 className="font-display text-2xl sm:text-3xl">{editing ? "Edit discount" : "Create discount"}</h3>{editing && <button type="button" onClick={reset} className="min-h-11 text-xs underline">Cancel edit</button>}</div>
      {editing && <p className="md:col-span-2 -mt-3 text-xs text-black/55">Editing “{editing.name}”. Update the fields below and press UPDATE DISCOUNT.</p>}
      <Field label="Name"><input ref={nameRef} className={field} name="name" defaultValue={editing?.name ?? "15% website promotion"} required /></Field>
      <Field label="Code (leave blank for automatic promotion)"><input className={field} name="code" defaultValue={editing?.code ?? ""} maxLength={64} /></Field>
      <Field label="Type"><select className={field} name="type" defaultValue={editing?.type ?? "PERCENTAGE"}><option value="PERCENTAGE">Percentage</option><option value="FIXED">Fixed amount</option></select></Field>
      <Field label="Value"><input className={field} name="value" type="number" min="0.01" max="1000000" step="0.01" defaultValue={editing?.value ?? 15} required /></Field>
      <Field label="Scope"><select className={field} name="scope" value={scope} onChange={(event) => setScope(event.target.value as Discount["scope"])}><option value="STORE">Entire store</option><option value="PRODUCT">Selected products</option><option value="CATEGORY">Selected categories</option></select></Field>
      {scope === "PRODUCT" && <fieldset className="md:col-span-2"><legend className="text-xs text-black/65">Products <span className="text-black/40">· {selectedProductIds.length} selected</span></legend><div className="mt-2 grid max-h-64 gap-2 overflow-y-auto rounded-md border border-black/20 bg-white p-3 sm:grid-cols-2 lg:grid-cols-3">{products.map((product) => <label key={product.id} className={`flex min-h-11 cursor-pointer items-center gap-3 rounded-md border px-3 py-2 text-sm transition ${selectedProductIds.includes(product.id) ? "border-black bg-black text-white" : "border-black/10 bg-white text-[#171412] hover:border-black/40"}`}><input type="checkbox" name="productIds" value={product.id} checked={selectedProductIds.includes(product.id)} onChange={(event) => toggleSelection(product.id, event.target.checked, selectedProductIds, setSelectedProductIds)} className="h-4 w-4 accent-black" /><span>{product.name}</span></label>)}</div></fieldset>}
      {scope === "CATEGORY" && <fieldset className="md:col-span-2"><legend className="text-xs text-black/65">Categories <span className="text-black/40">· {selectedCategoryIds.length} selected</span></legend><div className="mt-2 grid gap-2 rounded-md border border-black/20 bg-white p-3 sm:grid-cols-2 lg:grid-cols-3">{categories.map((category) => <label key={category.id} className={`flex min-h-11 cursor-pointer items-center gap-3 rounded-md border px-3 py-2 text-sm transition ${selectedCategoryIds.includes(category.id) ? "border-black bg-black text-white" : "border-black/10 bg-white text-[#171412] hover:border-black/40"}`}><input type="checkbox" name="categoryIds" value={category.id} checked={selectedCategoryIds.includes(category.id)} onChange={(event) => toggleSelection(category.id, event.target.checked, selectedCategoryIds, setSelectedCategoryIds)} className="h-4 w-4 accent-black" /><span>{category.name}</span></label>)}</div></fieldset>}
      <Field label="Starts at"><input className={field} name="startsAt" type="datetime-local" defaultValue={dateValue(editing?.startsAt ?? null)} /></Field>
      <Field label="Ends at"><input className={field} name="endsAt" type="datetime-local" defaultValue={dateValue(editing?.endsAt ?? null)} /></Field>
      <Field label="Minimum purchase"><input className={field} name="minimumPurchase" type="number" min="0" step="0.01" defaultValue={editing?.minimumPurchase ?? ""} /></Field>
      <Field label="Total usage limit"><input className={field} name="usageLimit" type="number" min="1" defaultValue={editing?.usageLimit ?? ""} /></Field>
      <Field label="Per-customer limit"><input className={field} name="perCustomerLimit" type="number" min="1" defaultValue={editing?.perCustomerLimit ?? ""} /></Field>
      <label className="flex items-center gap-3 text-sm"><input type="checkbox" name="active" defaultChecked={editing?.active ?? true} /> Active</label>
      <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4 md:col-span-2"><button disabled={busy} className="min-h-11 w-full bg-ink px-6 py-4 text-xs tracking-luxury text-white disabled:opacity-50 sm:w-auto">{busy ? "SAVING…" : editing ? "UPDATE DISCOUNT" : "CREATE DISCOUNT"}</button>{message && <p role={error ? "alert" : "status"} className={`break-words text-xs ${error ? "text-red-700" : "text-green-800"}`}>{message}</p>}</div>
    </form>
    <section className="min-w-0 border border-black/10 bg-white p-3 sm:p-6"><h3 className="font-display text-2xl sm:text-3xl">Configured discounts</h3><div className="mt-5 divide-y divide-black/10">{discounts.map((discount) => <article key={discount.id} className="flex min-w-0 flex-col items-stretch gap-3 py-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-4"><div className="min-w-0"><div className="flex min-w-0 flex-wrap items-center gap-2 sm:gap-3"><b className="break-words">{discount.name}</b><span className={`shrink-0 rounded-full px-2 py-1 text-[9px] ${discount.active ? "bg-green-100 text-green-900" : "bg-black/5 text-black/50"}`}>{discount.active ? "ACTIVE" : "INACTIVE"}</span></div><p className="mt-1 break-words text-xs text-black/55">{discount.code ?? "Automatic"} · {discount.type === "PERCENTAGE" ? `${discount.value}%` : discount.value} · {discount.scope} · used {discount.usageCount}{discount.usageLimit ? `/${discount.usageLimit}` : ""}</p></div><button type="button" onClick={() => startEdit(discount)} aria-label={`Edit ${discount.name}`} className="min-h-11 w-full rounded-md border border-black bg-white px-4 text-[10px] font-semibold tracking-wider transition hover:bg-black hover:text-white sm:w-auto">EDIT</button></article>)}{!discounts.length && <p className="py-8 text-sm text-black/50">No discounts configured yet.</p>}</div></section>
    <section className="min-w-0 border border-black/10 bg-white p-3 sm:p-6"><h3 className="font-display text-2xl sm:text-3xl">Recent redemptions</h3><div className="mt-5 space-y-2 sm:hidden">{redemptions.map((redemption)=><article key={redemption.id} className="border border-black/10 p-3 text-xs"><div className="flex items-start justify-between gap-3"><strong className="break-words">{redemption.discountName}</strong><span className="shrink-0">{new Intl.NumberFormat("en",{style:"currency",currency:redemption.currency}).format(redemption.amount)}</span></div><p className="mt-2 break-all text-black/55">#{redemption.orderNumber} · {redemption.email}</p><p className="mt-2 text-[10px] text-black/45">{redemption.code ?? "Automatic"} · {new Date(redemption.createdAt).toLocaleDateString()}</p></article>)}</div><div className="mt-5 hidden overflow-x-auto sm:block"><table className="w-full min-w-[720px] text-left text-xs"><thead><tr className="border-b border-black"><th className="py-3">Discount</th><th>Order</th><th>Customer</th><th>Saved</th><th>Date</th></tr></thead><tbody>{redemptions.map((redemption)=><tr key={redemption.id} className="border-b border-black/10"><td className="py-4">{redemption.discountName}<small className="block text-black/50">{redemption.code ?? "Automatic"}</small></td><td>#{redemption.orderNumber}</td><td>{redemption.email}</td><td>{new Intl.NumberFormat("en",{style:"currency",currency:redemption.currency}).format(redemption.amount)}</td><td>{new Date(redemption.createdAt).toLocaleDateString()}</td></tr>)}</tbody></table></div>{!redemptions.length&&<p className="py-8 text-sm text-black/50">No discount codes have been redeemed yet.</p>}</section>
  </div>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="text-xs text-black/65">{label}{children}</label>; }
