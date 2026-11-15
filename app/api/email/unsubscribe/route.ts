import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyUnsubscribeToken } from "@/lib/email";

const page = (title: string, message: string, status = 200) => new NextResponse(`<!doctype html><html lang="he" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title></head><body style="margin:0;background:#f4f0eb;color:#171412;font-family:Arial,sans-serif;display:grid;min-height:100vh;place-items:center"><main style="max-width:560px;background:#fff;border:1px solid #ded7cf;padding:40px;text-align:center"><h1 style="letter-spacing:5px">EYEBREED</h1><h2>${title}</h2><p style="line-height:1.7">${message}</p><a href="/" style="display:inline-block;margin-top:18px;background:#171412;color:#fff;text-decoration:none;padding:14px 22px">חזרה לאתר</a></main></body></html>`, { status, headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" } });

export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("token") ?? "";
  const userId = verifyUnsubscribeToken(token);
  if (!userId) return page("קישור לא תקין", "לא ניתן לאמת את קישור ההסרה. אפשר לעדכן את ההעדפה מתוך הפרופיל.", 400);
  const result = await prisma.user.updateMany({ where: { id: userId }, data: { acceptMarketingEmails: false } });
  if (!result.count) return page("החשבון לא נמצא", "לא נמצא חשבון פעיל עבור קישור זה.", 404);
  return page("הוסרת מרשימת התפוצה", "העדפת הדיוור עודכנה מיד. לא יישלחו אליך הודעות שיווקיות נוספות.");
}
