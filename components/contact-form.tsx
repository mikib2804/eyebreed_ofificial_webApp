"use client";

import { FormEvent, useRef, useState, type InputHTMLAttributes } from "react";
import { Send } from "lucide-react";
import { useStore } from "@/components/store-provider";

type Status = { type: "idle" | "loading" | "success" | "error"; message: string };

export function ContactForm({ compact = false }: { compact?: boolean }) {
  const { locale } = useStore();
  const hebrew = locale === "he";
  const startedAt = useRef(Date.now());
  const [status, setStatus] = useState<Status>({ type: "idle", message: "" });

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status.type === "loading") return;

    const form = event.currentTarget;
    const data = new FormData(form);
    setStatus({ type: "loading", message: hebrew ? "שולחים..." : "Sending..." });

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: data.get("fullName"),
          email: data.get("email"),
          message: data.get("message"),
          company: data.get("company"),
          locale,
          startedAt: startedAt.current,
        }),
      });
      const result = (await response.json().catch(() => null)) as { message?: string } | null;
      if (!response.ok) throw new Error(result?.message || (hebrew ? "שליחת ההודעה נכשלה." : "Message sending failed."));

      form.reset();
      startedAt.current = Date.now();
      setStatus({ type: "success", message: result?.message || (hebrew ? "ההודעה נשלחה בהצלחה." : "Your message was sent successfully.") });
    } catch (error) {
      setStatus({ type: "error", message: error instanceof Error ? error.message : (hebrew ? "אירעה שגיאה. נסו שוב." : "Something went wrong. Please try again.") });
    }
  }

  return (
    <form onSubmit={submit} className={compact ? "space-y-5" : "space-y-7"}>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label={hebrew ? "שם מלא" : "FULL NAME"} name="fullName" autoComplete="name" minLength={2} maxLength={80} required />
        <Field label={hebrew ? "אימייל" : "EMAIL"} name="email" type="email" autoComplete="email" maxLength={254} required dir="ltr" />
      </div>

      <label className="block">
        <span className="mb-3 block text-[10px] tracking-[.18em] text-black/60">{hebrew ? "הודעה" : "MESSAGE"}</span>
        <textarea name="message" required minLength={10} maxLength={2000} rows={compact ? 5 : 7} className="w-full resize-none rounded-xl border border-black/15 bg-white px-5 py-4 text-sm leading-7 outline-none transition focus:border-espresso-600 focus:ring-1 focus:ring-espresso-600" placeholder={hebrew ? "איך נוכל לעזור?" : "How can we help?"} />
        <span className="mt-2 block text-[9px] text-black/45">{hebrew ? "10–2,000 תווים" : "10–2,000 characters"}</span>
      </label>

      <div className="absolute -start-[10000px] top-auto h-px w-px overflow-hidden" aria-hidden="true">
        <label>Company<input name="company" type="text" tabIndex={-1} autoComplete="off" /></label>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <button type="submit" disabled={status.type === "loading"} className="inline-flex min-h-14 items-center justify-center gap-4 rounded-full bg-ink px-8 text-[10px] tracking-[.18em] text-white transition hover:bg-espresso-700 disabled:cursor-wait disabled:opacity-60">
          <span>{status.type === "loading" ? (hebrew ? "שולחים" : "SENDING") : (hebrew ? "שליחת הודעה" : "SEND MESSAGE")}</span>
          <Send size={15} strokeWidth={1.4} className={hebrew ? "rotate-180" : ""} />
        </button>
        <p aria-live="polite" className={`min-h-5 text-sm ${status.type === "success" ? "text-green-700" : status.type === "error" ? "text-red-700" : "text-black/55"}`}>{status.message}</p>
      </div>
    </form>
  );
}

function Field({ label, name, type = "text", dir, ...props }: InputHTMLAttributes<HTMLInputElement> & { label: string; name: string }) {
  return (
    <label className="block">
      <span className="mb-3 block text-[10px] tracking-[.18em] text-black/60">{label}</span>
      <input {...props} dir={dir} name={name} type={type} className="min-h-14 w-full rounded-xl border border-black/15 bg-white px-5 text-sm outline-none transition focus:border-espresso-600 focus:ring-1 focus:ring-espresso-600" />
    </label>
  );
}
