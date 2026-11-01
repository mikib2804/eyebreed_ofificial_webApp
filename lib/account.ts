import { redirect } from "next/navigation";
import { auth } from "@/auth";
export async function requireCustomer() { const session = await auth(); if (!session?.user?.id) redirect("/login?callbackUrl=/account"); return session.user; }
export function money(value: unknown, currency = "ILS") { return new Intl.NumberFormat("en", { style: "currency", currency }).format(Number(value)); }
