import "server-only";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export type AdminAccess =
  | { status: "unauthenticated" }
  | { status: "forbidden" }
  | {
      status: "authorized";
      user: { id: string; email: string | null; name: string | null };
    };

/**
 * Admin authorization must use the current database role. The JWT role is
 * useful for UI hints only because it can remain stale after a role change.
 */
export async function getAdminAccess(): Promise<AdminAccess> {
  const session = await auth();
  if (!session?.user?.id) return { status: "unauthenticated" };

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, email: true, name: true, role: true },
  });

  if (!user || user.role !== "ADMIN") return { status: "forbidden" };

  return {
    status: "authorized",
    user: { id: user.id, email: user.email, name: user.name },
  };
}
