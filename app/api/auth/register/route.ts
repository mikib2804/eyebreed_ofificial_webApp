import { hash } from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const registerSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().email().transform((email) => email.toLowerCase()),
  password: z.string().min(8).max(72)
});

export async function POST(request: Request) {
  const parsed = registerSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Please check your details." }, { status: 400 });

  const existing = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (existing) return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });

  const passwordHash = await hash(parsed.data.password, 12);
  await prisma.user.create({ data: { name: parsed.data.name, email: parsed.data.email, passwordHash } });
  return NextResponse.json({ ok: true }, { status: 201 });
}
