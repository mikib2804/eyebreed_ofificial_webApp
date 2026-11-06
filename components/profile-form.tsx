"use client";

import { FormEvent, useState } from "react";
import { useStore } from "@/components/store-provider";

const fieldClass = "mt-2 w-full rounded-xl border border-black/15 bg-white px-4 py-3.5 text-sm text-[#171412] outline-none transition focus:border-espresso-600 focus:ring-1 focus:ring-espresso-600 disabled:cursor-not-allowed disabled:bg-black/5 disabled:text-black/55";

export function ProfileForm({ user, canChangePassword }: { user: { name: string | null; email: string | null; phone: string | null }; canChangePassword: boolean }) {
  const { locale } = useStore();
  const hebrew = locale === "he";
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [saving, setSaving] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setSaving(true);
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/account/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(form)),
    });
    const result = await response.json().catch(() => ({}));
    setIsError(!response.ok);
    setMessage(response.ok ? (hebrew ? "הפרטים נשמרו." : "Profile updated.") : (result.error ?? (hebrew ? "לא ניתן לשמור את הפרטים." : "Could not update profile.")));
    setSaving(false);
  }

  return <form onSubmit={submit} className="max-w-2xl space-y-6">
    <Field name="name" label={hebrew ? "שם מלא" : "FULL NAME"} defaultValue={user.name ?? ""} autoComplete="name" required />
    <Field name="email" label={hebrew ? "אימייל" : "EMAIL"} type="email" value={user.email ?? ""} readOnly aria-describedby="profile-email-note" />
    <p id="profile-email-note" className="-mt-3 text-xs leading-5 text-black/55">{hebrew ? "שינוי אימייל יופעל לאחר השלמת תהליך אימות מאובטח." : "Email changes will be enabled after the secure verification flow is completed."}</p>
    <Field name="phone" label={hebrew ? "טלפון" : "PHONE"} defaultValue={user.phone ?? ""} autoComplete="tel" />
    {canChangePassword ? <fieldset className="grid gap-6 sm:grid-cols-2">
      <legend className="sr-only">{hebrew ? "שינוי סיסמה" : "Change password"}</legend>
      <Field name="currentPassword" label={hebrew ? "סיסמה נוכחית" : "CURRENT PASSWORD"} type="password" maxLength={72} autoComplete="current-password" />
      <Field name="newPassword" label={hebrew ? "סיסמה חדשה" : "NEW PASSWORD"} type="password" minLength={8} maxLength={72} autoComplete="new-password" />
    </fieldset> : <p className="rounded-xl bg-black/5 px-4 py-3 text-xs leading-5">{hebrew ? "החשבון מחובר באמצעות Google ואין לו סיסמה מקומית לשינוי." : "This account signs in with Google and does not have a local password to change."}</p>}
    {message && <p role={isError ? "alert" : "status"} aria-live="polite" className={`rounded-xl px-4 py-3 text-xs ${isError ? "bg-red-50 text-red-800" : "bg-emerald-50 text-emerald-900"}`}>{message}</p>}
    <button disabled={saving} className="min-h-12 rounded-full bg-[#171412] px-8 py-4 text-[9px] tracking-luxury !text-white transition hover:bg-espresso-700 disabled:cursor-wait disabled:opacity-55">{saving ? (hebrew ? "שומר…" : "SAVING…") : (hebrew ? "שמירת שינויים" : "SAVE CHANGES")}</button>
  </form>;
}

function Field({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return <label className="block text-[9px] tracking-[.14em] text-black/60">{label}<input {...props} className={fieldClass} /></label>;
}
