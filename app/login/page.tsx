import { redirect } from "next/navigation";
import { auth, signIn } from "@/auth";

export default async function LoginPage() {
  const session = await auth();
  if (session) redirect("/");
  return (
    <main className="grid min-h-screen place-items-center bg-ink px-6 text-white">
      <div className="w-full max-w-md border border-white/20 p-10 text-center">
        <a href="/" className="font-display text-5xl tracking-[.2em]">
          EYEBREED
        </a>
        <h1 className="mt-12 font-display text-4xl">Welcome back</h1>
        <p className="mt-3 text-xs leading-6 text-white/55">
          Sign in to access your bag, orders and saved pieces.
        </p>
        <form
          action={async () => {
            "use server";
            await signIn("google", { redirectTo: "/" });
          }}
        >
          <button className="mt-10 w-full bg-white py-4 text-[10px] tracking-luxury text-black">
            CONTINUE WITH GOOGLE
          </button>
        </form>
      </div>
    </main>
  );
}
