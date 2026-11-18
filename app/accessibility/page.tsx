import type { Metadata } from "next";
import { Mail, Phone } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { CartDrawer } from "@/components/cart-drawer";

export const metadata: Metadata = {
  title: "הצהרת נגישות | EYEBREED OFFICIAL",
  description:
    "מידע על נגישות אתר EYEBREED, התאמות הנגישות ודרכי יצירת קשר בנושא נגישות.",
};

const capabilities = [
  "ניווט מלא באמצעות מקלדת ומחוון מיקוד ברור.",
  "מבנה כותרות, אזורי תוכן ושמות נגישים עבור קוראי מסך.",
  "טקסט חלופי לתמונות תוכן והסתרת תמונות דקורטיביות מטכנולוגיות מסייעות.",
  "אפשרות לדלג ישירות לתוכן הראשי מכל עמוד.",
  "התאמת כיוון ושפת העמוד לעברית ולאנגלית.",
  "תמיכה בהגדלת טקסט, ניגודיות גבוהה, גווני אפור, הדגשת קישורים, גופן קריא והפחתת תנועה.",
  "טפסים עם תוויות, הוראות והודעות שגיאה הניתנות לזיהוי באמצעות טכנולוגיות מסייעות.",
  "חלונות ותפריטים הניתנים לפתיחה, סגירה וניווט באמצעות מקלדת, כולל מקש Escape.",
];

export default function AccessibilityPage() {
  return (
    <>
      <Navbar />
      <main className="bg-cream text-ink" dir="rtl">
        <header className="border-b border-black/15 bg-ink px-5 py-16 text-white sm:px-10 lg:py-24">
          <div className="mx-auto max-w-5xl">
            <p className="text-xs font-semibold tracking-[.16em] text-white/80">
              EYEBREED · נגישות
            </p>
            <h1 className="mt-5 font-display text-[clamp(3rem,9vw,7rem)] leading-none">
              הצהרת נגישות
            </h1>
            <p className="mt-7 max-w-3xl text-base leading-8 text-white/85">
              אנו ב-EYEBREED מחויבים לאפשר לכל אדם, לרבות אנשים עם מוגבלות,
              להשתמש באתר, לקבל מידע ולבצע רכישה באופן עצמאי, שוויוני ומכבד.
            </p>
          </div>
        </header>

        <div className="mx-auto max-w-5xl px-5 py-14 sm:px-10 lg:py-20">
          <section aria-labelledby="standard-heading">
            <h2 id="standard-heading" className="font-display text-4xl">
              תקן ורמת הנגישות
            </h2>
            <div className="mt-5 space-y-4 text-sm leading-7 text-black/80 sm:text-base sm:leading-8">
              <p>
                האתר פותח במטרה לעמוד בדרישות תקנות שוויון זכויות לאנשים עם
                מוגבלות (התאמות נגישות לשירות), התשע״ג–2013, ובהמלצות התקן
                הישראלי ת״י 5568 לנגישות תכנים באינטרנט ברמת AA, המבוסס על
                הנחיות WCAG של ארגון W3C.
              </p>
              <p>
                נגישות היא תהליך מתמשך. אנו מבצעים בדיקות ותיקונים שוטפים,
                אך ייתכן שיימצא רכיב שעדיין אינו נגיש באופן מלא. אם נתקלתם
                בקושי, נשמח לקבל דיווח ולספק חלופה נגישה בזמן סביר.
              </p>
            </div>
          </section>

          <section aria-labelledby="adjustments-heading" className="mt-14">
            <h2 id="adjustments-heading" className="font-display text-4xl">
              התאמות שבוצעו באתר
            </h2>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              {capabilities.map((capability) => (
                <li
                  key={capability}
                  className="flex gap-3 rounded-lg border border-black/15 bg-white p-4 text-sm leading-7"
                >
                  <span aria-hidden="true" className="mt-2 h-2 w-2 shrink-0 rounded-full bg-ink" />
                  <span>{capability}</span>
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="tools-heading" className="mt-14">
            <h2 id="tools-heading" className="font-display text-4xl">
              שימוש בכלי הנגישות
            </h2>
            <p className="mt-5 text-sm leading-7 text-black/80 sm:text-base sm:leading-8">
              כפתור הנגישות הקבוע בתחתית המסך מאפשר לשנות את גודל הטקסט,
              להפעיל ניגודיות גבוהה או גווני אפור, להדגיש קישורים, לבחור גופן
              קריא ולהפחית תנועה. ההעדפות נשמרות במכשיר עד לאיפוסן. הכלים הם
              שכבת סיוע ואינם מחליפים את התאמות הנגישות המובנות באתר.
            </p>
          </section>

          <section aria-labelledby="physical-heading" className="mt-14">
            <h2 id="physical-heading" className="font-display text-4xl">
              הסדרי נגישות ושירות חלופי
            </h2>
            <p className="mt-5 text-sm leading-7 text-black/80 sm:text-base sm:leading-8">
              המידע בדף זה מתייחס לשירות המקוון באתר. לבירור הסדרי נגישות
              במקום פיזי, ככל שהדבר רלוונטי לבקשתכם, או לקבלת מידע בפורמט
              נגיש חלופי, אפשר לפנות אלינו בדרכי הקשר שלהלן.
            </p>
          </section>

          <section
            aria-labelledby="contact-heading"
            className="mt-14 rounded-2xl bg-ink p-6 text-white sm:p-9"
          >
            <h2 id="contact-heading" className="font-display text-4xl">
              דיווח על קושי ויצירת קשר
            </h2>
            <p className="mt-5 max-w-3xl text-sm leading-7 text-white/85">
              אם מצאתם בעיית נגישות, ציינו ככל האפשר את כתובת העמוד, תיאור
              הפעולה שניסיתם לבצע, סוג הדפדפן והטכנולוגיה המסייעת שבה נעזרתם.
              איש הקשר לנגישות: צוות EYEBREED.
            </p>
            <div className="mt-7 flex flex-col gap-4 text-sm sm:flex-row sm:flex-wrap sm:gap-7">
              <a
                href="mailto:eyebreedofficial@gmail.com?subject=%D7%A4%D7%A0%D7%99%D7%99%D7%94%20%D7%91%D7%A0%D7%95%D7%A9%D7%90%20%D7%A0%D7%92%D7%99%D7%A9%D7%95%D7%AA"
                className="inline-flex min-h-12 items-center gap-3 rounded-lg border border-white/40 px-5 underline underline-offset-4"
              >
                <Mail size={18} aria-hidden="true" />
                <span dir="ltr">eyebreedofficial@gmail.com</span>
              </a>
              <a
                href="tel:+972509045444"
                className="inline-flex min-h-12 items-center gap-3 rounded-lg border border-white/40 px-5 underline underline-offset-4"
              >
                <Phone size={18} aria-hidden="true" />
                <span dir="ltr">+972 50-904-5444</span>
              </a>
            </div>
          </section>

          <p className="mt-10 border-t border-black/20 pt-6 text-sm text-black/75">
            תאריך עדכון אחרון של ההצהרה:{" "}
            <time dateTime="2026-11-18">18 בנובמבר 2026</time>.
          </p>
        </div>
      </main>
      <Footer />
      <CartDrawer />
    </>
  );
}
