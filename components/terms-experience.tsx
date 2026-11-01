"use client";

import Image from "next/image";
import { useStore } from "@/components/store-provider";

type Section = {
  title: string;
  paragraphs?: string[];
  bullets?: string[];
  closing?: string;
};

const he: { subtitle: string; sections: Section[] } = {
  subtitle: "תקנון האתר, תנאי רכישה, החזרות ומשלוחים",
  sections: [
    {
      title: "1. כללי",
      paragraphs: [
        "ברוכים הבאים לאתר Eyebreed Official. השימוש באתר וביצוע רכישה דרכו כפופים לתנאים המפורטים בתקנון זה. מטרת התקנון היא להגדיר את תנאי הרכישה, המשלוחים, ההחזרות והשירות ללקוחות.",
        "אין בתקנון זה כדי לגרוע מזכויות המוקנות לצרכן על פי דין.",
      ],
    },
    {
      title: "2. הזמנות מוקדמות (PRE-ORDER)",
      paragraphs: [
        "חלק ממוצרי Eyebreed Official מוצעים במסגרת הזמנה מוקדמת, לפני היציאה הרשמית של הדרופ.",
      ],
      bullets: [
        "רכישה במסגרת הזמנה מוקדמת אינה רכישה של מוצר המיועד בהכרח למשלוח מיידי.",
        "מועד האספקה המדויק אינו ידוע בעת ביצוע ההזמנה, ולא ניתן להתחייב לתאריך הגעה מסוים.",
        "אנו פועלים להשלמת תהליך הייצור והשילוח ולמסירת ההזמנות בהקדם האפשרי.",
        "במקרה של עיכוב מהותי, נפעל לעדכן את הלקוחות בהתאם לנסיבות ולהוראות הדין.",
        "הזמנה מוקדמת אינה גורעת מזכויות הלקוח על פי דין, לרבות זכויות הנוגעות לביטול עסקה ולאיחור באספקה.",
      ],
      closing: "מומלץ לעיין בפרטי המוצר ובתנאי ההזמנה לפני השלמת הרכישה.",
    },
    {
      title: "3. תשלום ואישור הזמנה",
      bullets: [
        "ניתן לבצע רכישות באמצעות אמצעי התשלום המוצגים באתר.",
        "לאחר השלמת ההזמנה יישלח אישור בהתאם לפרטי ההתקשרות שנמסרו.",
        "הלקוח אחראי למסירת פרטים נכונים ומלאים, לרבות שם, כתובת למשלוח, מספר טלפון וכתובת דוא״ל.",
        "במקרה של תקלה בתשלום או בפרטי ההזמנה, ייתכן שניצור קשר עם הלקוח לצורך בירור.",
      ],
    },
    {
      title: "4. משלוחים ואספקה",
      bullets: [
        "המשלוחים יבוצעו ליעדים שבהם ניתן שירות, בהתאם לאפשרויות המוצגות באתר.",
        "בהזמנות מוקדמות לא ניתן להתחייב למועד הגעה מדויק.",
        "במקרה של עיכוב, אובדן משלוח או בעיה באספקה, ניתן לפנות לשירות הלקוחות לצורך בירור וטיפול.",
        "הטיפול במקרים של עיכוב באספקה ייעשה בהתאם לנסיבות ולהוראות הדין החל.",
      ],
    },
    {
      title: "5. ביטולים, החזרות והחלפות",
      bullets: [
        "לא ניתן להחזיר מוצר לאחר לבישתו או לאחר שנעשה בו שימוש, בכפוף לזכויות הצרכן על פי דין.",
        "פתיחת השקית או האריזה אינה שוללת כשלעצמה את הזכאות לביטול עסקה. כל בקשה תיבחן בהתאם להוראות הדין הרלוונטיות.",
        "בקשות לביטול עסקה, החזרה או החלפה יטופלו בהתאם לסוג העסקה, מועד הבקשה, מצב המוצר והוראות הדין.",
        "מוצרים פגומים או מוצרים שאינם תואמים את ההזמנה יטופלו בהתאם לזכויות הלקוח על פי דין.",
        "החזרים כספיים, דמי ביטול ותנאי החזרה ייקבעו בהתאם להוראות הדין החל.",
        "לצורך הגשת בקשה לביטול או להחזרה, ניתן לפנות לשירות הלקוחות דרך פרטי ההתקשרות המופיעים באתר.",
      ],
      closing:
        "אין באמור בסעיף זה כדי לגרוע מזכויות צרכניות שאינן ניתנות להתניה על פי דין.",
    },
    {
      title: "6. מוצרים, מידות וצבעים",
      bullets: [
        "אנו עושים מאמצים להציג תמונות, צבעים ותיאורים מדויקים של המוצרים.",
        "ייתכנו הבדלים קלים בגוון המוצר בשל תאורה, צילום והגדרות מסך.",
        "מומלץ לעיין בטבלת המידות ובתיאור המוצר לפני הרכישה.",
        "אין באמור כדי לגרוע מזכויות הלקוח במקרה של פגם או אי־התאמה בהתאם לדין.",
      ],
    },
    {
      title: "7. אחריות ושירות לקוחות",
      paragraphs: [
        "Eyebreed Official תפעל לטיפול בפניות הנוגעות להזמנות, תשלומים, משלוחים, מוצרים פגומים ואי־התאמות.",
        "אין בתקנון זה כדי לפטור את העסק מאחריות שאינה ניתנת להתניה על פי דין.",
      ],
    },
    {
      title: "8. פרטיות ואבטחת מידע",
      paragraphs: [
        "פרטים אישיים הנמסרים במסגרת השימוש באתר וביצוע הזמנות יטופלו בהתאם למדיניות הפרטיות של האתר ולהוראות הדין החל. מומלץ לעיין במדיניות הפרטיות לפני מסירת פרטים אישיים.",
      ],
    },
    {
      title: "9. יצירת קשר",
      paragraphs: [
        "לשאלות בנוגע להזמנות, למשלוחים, לביטולים או למוצרים, ניתן לפנות באמצעות פרטי ההתקשרות המפורסמים באתר Eyebreed Official.",
      ],
    },
  ],
};

const en: { subtitle: string; sections: Section[] } = {
  subtitle: "Website Terms, Purchase Conditions, Returns and Shipping",
  sections: [
    {
      title: "1. General",
      paragraphs: [
        "Welcome to Eyebreed Official. Use of this website and purchases made through it are subject to these terms. Their purpose is to define the conditions governing purchases, shipping, returns, and customer service.",
        "Nothing in these terms limits any consumer rights granted by applicable law.",
      ],
    },
    {
      title: "2. Pre-Orders",
      paragraphs: [
        "Some Eyebreed Official products are offered for pre-order before the official release of a drop.",
      ],
      bullets: [
        "A pre-order purchase does not necessarily concern a product intended for immediate shipment.",
        "The exact delivery date is unknown when the order is placed, and no specific arrival date can be guaranteed.",
        "We work to complete production and shipping and deliver orders as soon as possible.",
        "If a material delay occurs, we will update customers in accordance with the circumstances and applicable law.",
        "A pre-order does not limit the customer’s legal rights, including rights relating to cancellation and delayed delivery.",
      ],
      closing:
        "Please review the product information and order conditions before completing your purchase.",
    },
    {
      title: "3. Payment and Order Confirmation",
      bullets: [
        "Purchases may be made using the payment methods displayed on the website.",
        "After an order is completed, confirmation will be sent using the contact details provided.",
        "The customer is responsible for providing accurate and complete information, including name, shipping address, telephone number, and email address.",
        "If there is a problem with payment or order information, we may contact the customer for clarification.",
      ],
    },
    {
      title: "4. Shipping and Delivery",
      bullets: [
        "Orders will be shipped to destinations where service is available, according to the options displayed on the website.",
        "An exact arrival date cannot be guaranteed for pre-orders.",
        "If a shipment is delayed, lost, or affected by a delivery problem, customer service may be contacted for investigation and assistance.",
        "Delivery delays will be handled according to the circumstances and applicable law.",
      ],
    },
    {
      title: "5. Cancellations, Returns and Exchanges",
      bullets: [
        "A product cannot be returned after it has been worn or used, subject to the consumer’s rights under applicable law.",
        "Opening a bag or package does not by itself eliminate the right to cancel a transaction. Every request will be reviewed under the relevant law.",
        "Cancellation, return, and exchange requests will be handled according to the transaction type, request date, product condition, and applicable law.",
        "Defective products or products that do not match the order will be handled according to the customer’s legal rights.",
        "Refunds, cancellation fees, and return conditions will be determined under applicable law.",
        "To request a cancellation or return, contact customer service using the details published on the website.",
      ],
      closing:
        "Nothing in this section limits consumer rights that cannot legally be waived or restricted.",
    },
    {
      title: "6. Products, Sizes and Colors",
      bullets: [
        "We make reasonable efforts to display accurate product images, colors, and descriptions.",
        "Minor color differences may occur because of lighting, photography, and screen settings.",
        "Please review the size guide and product description before purchasing.",
        "Nothing in this section limits the customer’s legal rights in the event of a defect or non-conformity.",
      ],
    },
    {
      title: "7. Responsibility and Customer Service",
      paragraphs: [
        "Eyebreed Official will address enquiries relating to orders, payments, shipping, defective products, and non-conformities.",
        "Nothing in these terms exempts the business from liability that cannot be excluded under applicable law.",
      ],
    },
    {
      title: "8. Privacy and Information Security",
      paragraphs: [
        "Personal information provided while using the website or placing an order will be handled according to the website’s privacy policy and applicable law. Please review the privacy policy before providing personal information.",
      ],
    },
    {
      title: "9. Contact",
      paragraphs: [
        "For questions about orders, shipping, cancellations, or products, contact us using the details published on the Eyebreed Official website.",
      ],
    },
  ],
};

export function TermsExperience() {
  const { locale } = useStore();
  const content = locale === "he" ? he : en;
  return (
    <main className="bg-cream text-ink" dir={locale === "he" ? "rtl" : "ltr"}>
      <header className="relative min-h-[430px] overflow-hidden border-b border-black/15 bg-ink px-6 py-16 text-white sm:min-h-[520px] sm:px-10 lg:py-24">
        <Image
          src="/campaign/modernAll/DSCF9999.JPG"
          alt="EYEBREED Vision campaign"
          fill
          priority
          className="object-cover object-center opacity-70"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,5,5,.75)_0%,rgba(5,5,5,.50)_48%,rgba(5,5,5,.15)_100%)] rtl:bg-[linear-gradient(270deg,rgba(5,5,5,.75)_0%,rgba(5,5,5,.50)_48%,rgba(5,5,5,.15)_100%)]" />{" "}
        <div className="relative z-10 mx-auto flex min-h-[300px] max-w-5xl flex-col justify-center sm:min-h-[390px]">
          <p
            dir="ltr"
            className={`text-[10px] tracking-[.28em] text-espresso-400 ${locale === "he" ? "text-right" : "text-left"}`}
          >
            EYEBREED OFFICIAL
          </p>
          <h1 className="mt-5 font-display text-[clamp(3rem,8vw,7rem)] leading-none">
            {locale === "he" ? "תנאי שימוש" : "TERMS OF USE"}
          </h1>
          <p className="mt-5 max-w-xl text-sm leading-7 text-white/75">
            {content.subtitle}
          </p>
        </div>
      </header>
      <div className="mx-auto max-w-5xl px-6 py-14 sm:px-10 lg:py-24">
        <div className="space-y-12">
          {content.sections.map((section) => (
            <section
              key={section.title}
              className="border-t border-black/15 pt-7"
            >
              <h2 className="font-display text-3xl sm:text-4xl">
                {section.title}
              </h2>
              {section.paragraphs?.map((p) => (
                <p key={p} className="mt-5 text-sm leading-8 text-black/70">
                  {p}
                </p>
              ))}
              {section.bullets && (
                <ul className="mt-5 space-y-3 text-sm leading-7 text-black/70">
                  {section.bullets.map((item) => (
                    <li key={item} className="flex gap-3">
                      <span className="mt-3 h-1 w-1 shrink-0 rounded-full bg-espresso-600" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              )}
              {section.closing && (
                <p className="mt-5 border-s-2 border-espresso-600 ps-4 text-sm leading-7 text-black/70">
                  {section.closing}
                </p>
              )}
            </section>
          ))}
        </div>
        <footer className="mt-16 border-t border-black/20 pt-10 text-center">
          <p dir="ltr" className="font-display text-3xl">
            EYEBREED OFFICIAL
          </p>
          <p dir="ltr" className="mt-3">
            It’s not the eyes, it’s the vision.
          </p>
        </footer>
      </div>
    </main>
  );
}
