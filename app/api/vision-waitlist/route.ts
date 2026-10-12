import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { randomUUID } from "crypto";

const requestSchema = z.object({
  email: z.string().trim().email().transform((email) => email.toLowerCase()),
});

export async function POST(request: Request) {
  const parsed = requestSchema.safeParse(await request.json().catch(() => null));

  if (!parsed.success) {
    return NextResponse.json(
      { message: "Enter a valid email address." },
      { status: 400 },
    );
  }

  try {
    await prisma.$executeRaw`
      INSERT INTO "VisionWaitlistEntry" ("id", "email", "createdAt")
      VALUES (${randomUUID()}, ${parsed.data.email}, CURRENT_TIMESTAMP)
      ON CONFLICT ("email") DO NOTHING
    `;

    return NextResponse.json({ message: "You’re on the list." });
  } catch {
    return NextResponse.json(
      { message: "We couldn’t save your email. Please try again." },
      { status: 500 },
    );
  }
}
