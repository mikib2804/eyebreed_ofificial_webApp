import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { LoginExperience } from "@/components/login-experience";
export default async function Register(){if(await auth())redirect("/account");return <LoginExperience initialMode="register"/>}
