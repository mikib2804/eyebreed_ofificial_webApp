import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";

const google = Google({
  // Google is allowed to link to an existing credentials account only after
  // its signed profile asserts that the email is verified. This avoids both a
  // duplicate customer and unverified-email account takeover.
  allowDangerousEmailAccountLinking: true,
  profile(profile) {
    if (!profile.email || !profile.email_verified) throw new Error("Google account email is not verified.");
    return {
      id: profile.sub,
      name: profile.name,
      email: profile.email.normalize("NFKC").toLowerCase(),
      emailVerified: new Date(),
      image: profile.picture,
      role: "CUSTOMER" as const,
    };
  },
});

export default {
  // Local development runs directly on localhost. Production remains opt-in
  // so a deployment must explicitly trust its configured reverse proxy/host.
  trustHost: process.env.NODE_ENV !== "production" || process.env.AUTH_TRUST_HOST === "true",
  providers: [google],
  pages: { signIn: "/login" },
  session: { strategy: "jwt" },
} satisfies NextAuthConfig;
