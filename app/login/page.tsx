import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { LoginExperience } from "@/components/login-experience";

export default async function LoginPage() {
  const session = await auth();
  if (session) redirect("/");
  return <LoginExperience />;
}
