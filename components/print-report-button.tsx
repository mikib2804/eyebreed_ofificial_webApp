"use client";

import { Printer } from "lucide-react";

export function PrintReportButton({ label }: { label: string }) {
  return <button type="button" onClick={() => window.print()} className="inline-flex min-h-11 items-center gap-2 rounded-md bg-black px-5 text-xs font-semibold text-white print:hidden"><Printer size={16} aria-hidden="true" />{label}</button>;
}
