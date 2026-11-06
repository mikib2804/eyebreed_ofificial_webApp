"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { EmptyState, PageTitle } from "@/components/account-shell";
import { useStore } from "@/components/store-provider";

type Address = { id: string; label: string; fullName: string; phone: string | null; line1: string; line2: string | null; city: string; postalCode: string | null; country: string; isDefault: boolean };
const inputClass = "mt-2 w-full rounded-xl border border-black/15 bg-white px-4 py-3 text-sm outline-none focus:border-espresso-600 focus:ring-1 focus:ring-espresso-600";

export function AddressBook({ addresses }: { addresses: Address[] }) {
  const { locale } = useStore();
  const hebrew = locale === "he";
  const router = useRouter();
  const [editing, setEditing] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState<string | null>(null);

  async function mutate(id: string, method: "PATCH" | "DELETE", body?: object) {
    setBusy(id); setMessage("");
    const response = await fetch(`/api/account/addresses/${id}`, { method, headers: body ? { "Content-Type": "application/json" } : undefined, body: body ? JSON.stringify(body) : undefined });
    const result = await response.json().catch(() => ({}));
    setBusy(null);
    if (!response.ok) { setMessage(result.error ?? (hebrew ? "לא ניתן לעדכן את הכתובת." : "Could not update the address.")); return false; }
    setEditing(null); router.refresh(); return true;
  }

  async function save(event: FormEvent<HTMLFormElement>, address: Address) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    await mutate(address.id, "PATCH", {
      label: form.get("label"), fullName: form.get("fullName"), phone: form.get("phone") || null,
      line1: form.get("line1"), line2: form.get("line2") || null, city: form.get("city"),
      postalCode: form.get("postalCode") || null, country: form.get("country"),
      isDefault: form.get("isDefault") === "on",
    });
  }

  return <>
    <PageTitle title="My Addresses"><p className="mt-4 text-sm text-black/60">{hebrew ? "הכתובות נשמרות בחשבון ומשמשות לתהליך רכישה מהיר יותר." : "Saved addresses make checkout faster and remain connected to your account."}</p></PageTitle>
    {message && <p role="alert" className="mb-5 rounded-xl bg-red-50 px-4 py-3 text-xs text-red-800">{message}</p>}
    {addresses.length ? <div className="mb-10 grid gap-4 sm:grid-cols-2">{addresses.map((address) => <article key={address.id} className="rounded-2xl border border-black/15 bg-white p-6 text-sm leading-6">
      {editing === address.id ? <form onSubmit={(event) => save(event, address)} className="grid gap-4">
        <Field name="label" label={hebrew ? "תווית" : "LABEL"} defaultValue={address.label} required />
        <Field name="fullName" label={hebrew ? "שם מלא" : "FULL NAME"} defaultValue={address.fullName} required />
        <Field name="phone" label={hebrew ? "טלפון" : "PHONE"} defaultValue={address.phone ?? ""} />
        <Field name="line1" label={hebrew ? "כתובת" : "ADDRESS"} defaultValue={address.line1} required />
        <Field name="line2" label={hebrew ? "דירה / יחידה" : "APARTMENT / UNIT"} defaultValue={address.line2 ?? ""} />
        <div className="grid gap-4 sm:grid-cols-2"><Field name="city" label={hebrew ? "עיר" : "CITY"} defaultValue={address.city} required /><Field name="postalCode" label={hebrew ? "מיקוד" : "POSTAL CODE"} defaultValue={address.postalCode ?? ""} /></div>
        <Field name="country" label={hebrew ? "מדינה" : "COUNTRY"} defaultValue={address.country} required />
        <label className="flex items-center gap-2 text-xs"><input type="checkbox" name="isDefault" defaultChecked={address.isDefault} /> {hebrew ? "כתובת ברירת מחדל" : "Default address"}</label>
        <div className="flex gap-3"><button disabled={busy === address.id} className="rounded-full bg-[#171412] px-5 py-2 text-[9px] tracking-wider !text-white disabled:opacity-50">{hebrew ? "שמירה" : "SAVE"}</button><button type="button" onClick={() => setEditing(null)} className="text-[9px] underline">{hebrew ? "ביטול" : "CANCEL"}</button></div>
      </form> : <>
        {address.isDefault && <p className="mb-3 text-[8px] tracking-luxury">{hebrew ? "ברירת מחדל" : "DEFAULT"}</p>}
        <b>{address.label}</b><p>{address.fullName}<br />{address.line1}{address.line2 && <><br />{address.line2}</>}<br />{address.city} {address.postalCode}<br />{address.country}</p>
        <div className="mt-4 flex flex-wrap gap-4 text-[9px] tracking-wider"><button type="button" onClick={() => setEditing(address.id)} className="underline underline-offset-4">{hebrew ? "עריכה" : "EDIT"}</button>{!address.isDefault && <button type="button" disabled={busy === address.id} onClick={() => mutate(address.id, "PATCH", { isDefault: true })} className="underline underline-offset-4 disabled:opacity-50">{hebrew ? "הגדרה כברירת מחדל" : "SET DEFAULT"}</button>}<button type="button" disabled={busy === address.id} onClick={() => mutate(address.id, "DELETE")} className="text-red-700 underline underline-offset-4 disabled:opacity-50">{hebrew ? "הסרה" : "REMOVE"}</button></div>
      </>}
    </article>)}</div> : <EmptyState title="No saved addresses" text="Add an address for a faster checkout." />}
    <h2 className="mb-5 mt-10 font-display text-3xl">{hebrew ? "הוספת כתובת" : "Add an address"}</h2>
    <CreateAddressForm />
  </>;
}

function CreateAddressForm() {
  const router = useRouter();
  const { locale } = useStore();
  const hebrew = locale === "he";
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setMessage("");
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/account/addresses", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...Object.fromEntries(form), isDefault: form.get("isDefault") === "on" }) });
    const result = await response.json().catch(() => ({})); setBusy(false);
    if (!response.ok) { setMessage(result.error ?? "Could not add address."); return; }
    event.currentTarget.reset(); router.refresh();
  }
  return <form onSubmit={submit} className="grid gap-5 rounded-2xl border border-black/10 bg-[#f7f2eb] p-5 sm:grid-cols-2 sm:p-7">
    <Field name="label" label={hebrew ? "תווית" : "LABEL"} placeholder={hebrew ? "בית" : "Home"} />
    <Field name="fullName" label={hebrew ? "שם מלא" : "FULL NAME"} autoComplete="name" required />
    <Field name="phone" label={hebrew ? "טלפון" : "PHONE"} autoComplete="tel" />
    <Field name="line1" label={hebrew ? "כתובת" : "ADDRESS"} autoComplete="address-line1" required />
    <Field name="line2" label={hebrew ? "דירה / יחידה" : "APARTMENT / UNIT"} autoComplete="address-line2" />
    <Field name="city" label={hebrew ? "עיר" : "CITY"} autoComplete="address-level2" required />
    <Field name="postalCode" label={hebrew ? "מיקוד" : "POSTAL CODE"} autoComplete="postal-code" />
    <Field name="country" label={hebrew ? "מדינה" : "COUNTRY"} defaultValue="Israel" autoComplete="country-name" required />
    <label className="flex items-center gap-2 text-xs"><input type="checkbox" name="isDefault" /> {hebrew ? "הגדרה כברירת מחדל" : "Set as default"}</label>
    <div>{message && <p role="alert" className="mb-2 text-xs text-red-700">{message}</p>}<button disabled={busy} className="min-h-11 rounded-full bg-[#171412] px-6 py-3 text-[9px] tracking-luxury !text-white transition hover:bg-espresso-700 disabled:opacity-50">{busy ? (hebrew ? "מוסיף…" : "ADDING…") : (hebrew ? "הוספת כתובת" : "ADD ADDRESS")}</button></div>
  </form>;
}

function Field({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) { return <label className="block text-[9px] tracking-[.14em] text-black/60">{label}<input {...props} className={inputClass} /></label>; }
