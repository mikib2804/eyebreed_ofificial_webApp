import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { z } from "zod";
import { PrismaAdapter } from "@auth/prisma-adapter";
import type { Adapter } from "next-auth/adapters";
import type { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import authConfig from "@/auth.config";
import { normalizedEmailSchema } from "@/lib/validation";
import { consumeRateLimit, requestFingerprint } from "@/lib/rate-limit";

const credentialsSchema = z.object({
  email: normalizedEmailSchema,
  password: z.string().min(8)
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma) as Adapter,
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60, updateAge: 24 * 60 * 60 },
  cookies: { sessionToken: { name: process.env.NODE_ENV === "production" ? "__Secure-eyebreed.session" : "eyebreed.session", options: { httpOnly: true, sameSite: "lax", path: "/", secure: process.env.NODE_ENV === "production" } } },
  providers: [
    ...authConfig.providers,
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials, request) {
        const parsed = credentialsSchema.safeParse(credentials);
        if (!parsed.success) return null;
        const rate = await consumeRateLimit("login", `${requestFingerprint(request)}:${parsed.data.email}`, 10, 15 * 60);
        if (!rate.allowed) return null;

        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email.toLowerCase() }
        });
        if (!user?.passwordHash) return null;
        if (!await compare(parsed.data.password, user.passwordHash)) return null;

        return { id: user.id, email: user.email, name: user.name, image: user.image, role: user.role, sessionVersion: user.sessionVersion };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.sessionVersion = user.sessionVersion ?? (await prisma.user.findUnique({ where: { id: user.id }, select: { sessionVersion: true } }))?.sessionVersion ?? 0;
      } else if (token.id) {
        const current = await prisma.user.findUnique({ where: { id: String(token.id) }, select: { sessionVersion: true } });
        if (!current || current.sessionVersion !== token.sessionVersion) token.id = "";
      }
      return token;
    },
    session({ session, token }) {
      session.user.id = String(token.id ?? "");
      session.user.role = token.role as Role;
      return session;
    }
  }
});
