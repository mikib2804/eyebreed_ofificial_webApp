import { redirect } from "next/navigation";
import { getAdminAccess } from "@/lib/admin-auth";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const access = await getAdminAccess();
  if (access.status === "unauthenticated") redirect("/login?callbackUrl=/admin");
  if (access.status === "forbidden") redirect("/");
  return children;
}
