"use client";

import { FormEvent, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { AdminLocale } from "@/lib/admin-i18n";

type MaintenanceNotice = {
  id: string;
  title: string;
  message: string;
  duration: string;
  startsAt: string;
  endsAt: string;
  active: boolean;
  subtitle: string | null;
  createdAt: string;
  updatedAt: string;
};

const field = "mt-2 min-h-12 w-full rounded-md border border-black/20 bg-white px-3 py-2 text-sm outline-none transition focus:border-black focus:ring-1 focus:ring-black";

function localDateTime(value: string | Date) {
  const date = value instanceof Date ? value : new Date(value);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60_000).toISOString().slice(0, 16);
}

async function request(url: string, method: "POST" | "PATCH" | "DELETE", body?: unknown) {
  const response = await fetch(url, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const result = (await response.json().catch(() => ({}))) as { error?: string };
  if (!response.ok) throw new Error(result.error || "Update failed");
}

export function AdminMaintenanceManager({ notices, locale }: { notices: MaintenanceNotice[]; locale: AdminLocale }) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [editing, setEditing] = useState<MaintenanceNotice | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const he = locale === "he";
  const defaultStart = new Date();
  const defaultEnd = new Date(defaultStart.getTime() + 60 * 60 * 1_000);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const start = new Date(String(form.get("startsAt")));
    const end = new Date(String(form.get("endsAt")));
    if (!Number.isFinite(start.getTime()) || !Number.isFinite(end.getTime()) || end <= start) {
      setMessage(he ? "זמן הסיום חייב להיות מאוחר מזמן ההתחלה." : "End time must be later than start time.");
      return;
    }
    const body = {
      title: String(form.get("title") ?? ""),
      message: String(form.get("message") ?? ""),
      duration: String(form.get("duration") ?? ""),
      startsAt: start.toISOString(),
      endsAt: end.toISOString(),
      subtitle: String(form.get("subtitle") ?? ""),
      active: form.get("active") === "on",
    };
    setSaving(true);
    setMessage(he ? "שומר…" : "Saving…");
    try {
      await request(editing ? `/api/admin/maintenance/${editing.id}` : "/api/admin/maintenance", editing ? "PATCH" : "POST", body);
      setMessage(he ? "הודעת התחזוקה נשמרה." : "Maintenance notice saved.");
      setEditing(null);
      formElement.reset();
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : (he ? "השמירה נכשלה." : "Save failed."));
    } finally {
      setSaving(false);
    }
  }

  async function toggle(notice: MaintenanceNotice) {
    setPendingId(notice.id);
    setMessage("");
    try {
      await request(`/api/admin/maintenance/${notice.id}`, "PATCH", { active: !notice.active });
      setMessage(he ? "מצב התחזוקה עודכן." : "Maintenance status updated.");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : (he ? "העדכון נכשל." : "Update failed."));
    } finally {
      setPendingId(null);
    }
  }

  async function remove(notice: MaintenanceNotice) {
    if (!window.confirm(he ? `למחוק את “${notice.title}” לצמיתות?` : `Permanently delete “${notice.title}”?`)) return;
    setPendingId(notice.id);
    setMessage("");
    try {
      await request(`/api/admin/maintenance/${notice.id}`, "DELETE");
      if (editing?.id === notice.id) setEditing(null);
      setMessage(he ? "הודעת התחזוקה נמחקה." : "Maintenance notice deleted.");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : (he ? "המחיקה נכשלה." : "Delete failed."));
    } finally {
      setPendingId(null);
    }
  }

  function edit(notice: MaintenanceNotice) {
    setEditing(notice);
    setMessage("");
    window.setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 0);
  }

  return (
    <div className="space-y-8">
      <form ref={formRef} key={editing?.id ?? "new"} onSubmit={submit} className="scroll-mt-24 rounded-lg border border-black/15 bg-white p-4 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div><p className="text-[9px] uppercase tracking-[.2em] text-black/45">EYEBREED</p><h3 className="mt-1 font-display text-3xl">{editing ? (he ? "עריכת הודעה" : "Edit notice") : (he ? "הודעת תחזוקה חדשה" : "New maintenance notice")}</h3></div>
          {editing && <button type="button" onClick={() => { setEditing(null); setMessage(""); }} className="min-h-11 rounded-md border border-black px-4 text-xs">{he ? "ביטול עריכה" : "CANCEL EDIT"}</button>}
        </div>
        <div className="mt-6 grid gap-5 md:grid-cols-2">
          <label className="text-xs font-medium">{he ? "כותרת" : "Title"}<input name="title" required minLength={2} maxLength={140} defaultValue={editing?.title ?? (he ? "אנחנו מתחדשים" : "We are evolving")} className={field} /></label>
          <label className="text-xs font-medium">{he ? "כותרת משנה (אופציונלי)" : "Optional subtitle"}<input name="subtitle" maxLength={240} defaultValue={editing?.subtitle ?? ""} className={field} /></label>
          <label className="text-xs font-medium md:col-span-2">{he ? "הודעה" : "Message"}<textarea name="message" required minLength={10} maxLength={2_000} rows={5} defaultValue={editing?.message ?? ""} className={`${field} resize-y`} /></label>
          <label className="text-xs font-medium">{he ? "משך משוער" : "Expected duration"}<input name="duration" required maxLength={120} placeholder={he ? "לדוגמה: כשעתיים" : "For example: About 2 hours"} defaultValue={editing?.duration ?? ""} className={field} /></label>
          <label className="flex min-h-12 items-center gap-3 self-end rounded-md border border-black/15 px-4 py-3 text-xs"><input name="active" type="checkbox" defaultChecked={editing?.active ?? false} className="h-5 w-5 accent-[#76513f]" />{he ? "הפעלת מצב תחזוקה" : "Activate maintenance mode"}</label>
          <label className="text-xs font-medium">{he ? "התחלה" : "Start"}<input name="startsAt" type="datetime-local" required defaultValue={localDateTime(editing?.startsAt ?? defaultStart)} className={field} /></label>
          <label className="text-xs font-medium">{he ? "סיום צפוי" : "Expected end"}<input name="endsAt" type="datetime-local" required defaultValue={localDateTime(editing?.endsAt ?? defaultEnd)} className={field} /></label>
        </div>
        <div className="mt-6 flex flex-wrap items-center gap-4"><button disabled={saving} className="min-h-12 rounded-md bg-[#211b17] px-6 text-xs font-semibold text-white disabled:opacity-45">{saving ? (he ? "שומר…" : "SAVING…") : editing ? (he ? "שמירת שינויים" : "SAVE CHANGES") : (he ? "יצירת הודעה" : "CREATE NOTICE")}</button>{message && <p role="status" className="text-xs text-black/65">{message}</p>}</div>
      </form>

      <section aria-labelledby="maintenance-history-heading">
        <h3 id="maintenance-history-heading" className="font-display text-3xl">{he ? "הודעות תחזוקה" : "Maintenance notices"}</h3>
        <div className="mt-4 space-y-4">
          {notices.map((notice) => {
            return <article key={notice.id} className={`rounded-lg border bg-white p-4 sm:p-5 ${notice.active ? "border-[#76513f] ring-2 ring-[#76513f]/10" : "border-black/10"}`}>
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h4 className="break-words font-display text-2xl">{notice.title}</h4>{notice.active && <span className="rounded-full bg-[#76513f] px-3 py-1 text-[9px] font-semibold text-white">{he ? "פעילה" : "ACTIVE"}</span>}</div>{notice.subtitle && <p className="mt-2 text-xs text-black/55">{notice.subtitle}</p>}<p className="mt-3 whitespace-pre-line text-sm leading-6 text-black/75">{notice.message}</p><dl className="mt-4 grid gap-2 text-xs text-black/60 sm:grid-cols-3"><div><dt className="font-semibold text-black">{he ? "משך" : "Duration"}</dt><dd>{notice.duration}</dd></div><div><dt className="font-semibold text-black">{he ? "התחלה" : "Start"}</dt><dd>{new Date(notice.startsAt).toLocaleString(he ? "he-IL" : "en-US")}</dd></div><div><dt className="font-semibold text-black">{he ? "סיום צפוי" : "Expected end"}</dt><dd>{new Date(notice.endsAt).toLocaleString(he ? "he-IL" : "en-US")}</dd></div></dl></div>
                <div className="flex shrink-0 flex-wrap gap-2"><button type="button" disabled={pendingId === notice.id} onClick={() => toggle(notice)} role="switch" aria-checked={notice.active} className={`min-h-11 rounded-full border px-4 text-[10px] font-semibold ${notice.active ? "border-[#76513f] bg-[#76513f] text-white" : "border-black/25 bg-white"}`}>{notice.active ? (he ? "כיבוי" : "DEACTIVATE") : (he ? "הפעלה" : "ACTIVATE")}</button><button type="button" onClick={() => edit(notice)} className="min-h-11 rounded-md border border-black px-4 text-[10px] font-semibold">{he ? "עריכה" : "EDIT"}</button><button type="button" disabled={pendingId === notice.id} onClick={() => remove(notice)} className="min-h-11 rounded-md border border-red-700 px-4 text-[10px] font-semibold text-red-800 disabled:opacity-45">{he ? "מחיקה" : "DELETE"}</button></div>
              </div>
            </article>;
          })}
          {!notices.length && <p className="rounded-lg border border-dashed border-black/20 p-8 text-center text-sm text-black/50">{he ? "עדיין לא נוצרו הודעות תחזוקה." : "No maintenance notices have been created yet."}</p>}
        </div>
      </section>
    </div>
  );
}
