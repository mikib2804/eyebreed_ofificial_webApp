"use client";

import { FormEvent, useState } from "react";
import { useStore } from "@/components/store-provider";
import { personNameInputAttributes, phoneInputAttributes, sanitizePhoneInput } from "@/lib/input-constraints";
import { useSubmitGuard } from "@/lib/use-submit-guard";

const fieldClass = "mt-2 w-full rounded-md border border-black/15 bg-white px-4 py-3.5 text-sm text-[#171412] outline-none transition focus:border-espresso-600 focus:ring-1 focus:ring-espresso-600 disabled:cursor-not-allowed disabled:bg-black/5 disabled:text-black/55";

export function ProfileForm({ user, canChangePassword }: { user: { name: string | null; email: string | null; phone: string | null; acceptMarketingEmails: boolean }; canChangePassword: boolean }) {
  const { locale } = useStore();
  const hebrew = locale === "he";
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [saving, setSaving] = useState(false);
  const { blocked, run } = useSubmitGuard();

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    await run(async () => {
      setMessage("");
      setSaving(true);
      try {
        const form = new FormData(formElement);
        const response = await fetch("/api/account/profile", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...Object.fromEntries(form), acceptMarketingEmails: form.get("acceptMarketingEmails") === "on", locale }),
        });
        const result = await response.json().catch(() => ({}));
        setIsError(!response.ok);
        setMessage(response.ok ? (hebrew ? "הפרטים נשמרו." : "Profile updated.") : (result.error ?? (hebrew ? "לא ניתן לשמור את הפרטים." : "Could not update profile.")));
      } finally {
        setSaving(false);
      }
    });
  }

  return <form onSubmit={submit} className="max-w-2xl space-y-6">
    <Field name="name" label={hebrew ? "שם מלא" : "FULL NAME"} defaultValue={user.name ?? ""} autoComplete="name" {...personNameInputAttributes} required />
    <Field name="email" label={hebrew ? "אימייל" : "EMAIL"} type="email" maxLength={254} value={user.email ?? ""} readOnly aria-describedby="profile-email-note" />
    <p id="profile-email-note" className="-mt-3 text-xs leading-5 text-black/55">{hebrew ? "שינוי אימייל יופעל לאחר השלמת תהליך אימות מאובטח." : "Email changes will be enabled after the secure verification flow is completed."}</p>
    <Field name="phone" label={hebrew ? "טלפון" : "PHONE"} defaultValue={user.phone ?? ""} {...phoneInputAttributes} onInput={(event) => { event.currentTarget.value = sanitizePhoneInput(event.currentTarget.value); }} />
    <label className="flex items-start gap-3 rounded-md border border-black/10 bg-white p-4 text-xs leading-5"><input className="mt-1 h-4 w-4 shrink-0 accent-black" type="checkbox" name="acceptMarketingEmails" defaultChecked={user.acceptMarketingEmails}/><span>{hebrew ? "אני מאשר/ת לקבל מ-Eyebreed הודעות פרסומיות, מבצעים והנחות באמצעות דואר אלקטרוני." : "I agree to receive marketing emails, advertisements, promotions, and special discounts from Eyebreed."}</span></label>
    {canChangePassword ? <fieldset className="grid gap-6 sm:grid-cols-2">
      <legend className="sr-only">{hebrew ? "שינוי סיסמה" : "Change password"}</legend>
      <Field name="currentPassword" label={hebrew ? "סיסמה נוכחית" : "CURRENT PASSWORD"} type="password" maxLength={72} autoComplete="current-password" />
      <Field name="newPassword" label={hebrew ? "סיסמה חדשה" : "NEW PASSWORD"} type="password" minLength={8} maxLength={72} autoComplete="new-password" />
    </fieldset> : <p className="rounded-md bg-black/5 px-4 py-3 text-xs leading-5">{hebrew ? "החשבון מחובר באמצעות Google ואין לו סיסמה מקומית לשינוי." : "This account signs in with Google and does not have a local password to change."}</p>}
    {message && <p role={isError ? "alert" : "status"} aria-live="polite" className={`rounded-md px-4 py-3 text-xs ${isError ? "bg-red-50 text-red-800" : "bg-emerald-50 text-emerald-900"}`}>{message}</p>}
    <button disabled={saving || blocked} className="min-h-12 rounded-md bg-[#171412] px-8 py-4 text-[9px] tracking-luxury !text-white transition hover:bg-espresso-700 disabled:cursor-wait disabled:opacity-55">{saving ? (hebrew ? "שומר…" : "SAVING…") : (hebrew ? "שמירת שינויים" : "SAVE CHANGES")}</button>
  </form>;
}

function Field({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return <label className="block text-[9px] tracking-[.14em] text-black/60">{label}<input {...props} className={fieldClass} /></label>;
}
