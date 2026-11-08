import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { LoginExperience } from "@/components/login-experience";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string | string[] }>;
}) {
  const session = await auth();
  const rawCallback = (await searchParams).callbackUrl;
  const callbackUrl = Array.isArray(rawCallback) ? rawCallback[0] : rawCallback;
  const safeCallback =
    callbackUrl?.startsWith("/") && !callbackUrl.startsWith("//")
      ? callbackUrl
      : "/account";

  // A stale/invalidated JWT can still produce a session-shaped value with an
  // empty user id. Show the login form in that case. Valid users continue to
  // the protected destination instead of being sent back to the home page.
  if (session?.user?.id) redirect(safeCallback);
  return <LoginExperience />;
}
