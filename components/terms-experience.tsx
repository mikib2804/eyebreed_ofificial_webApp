"use client";

import Image from "next/image";
import { useStore } from "@/components/store-provider";

type Section = {
  title: string;
  paragraphs?: string[];
  bullets?: string[];
  closing?: string;
};

type TermsContent = {
  subtitle: string;
  updatedAt?: string;
  intro?: string[];
  sections: Section[];
};

const he: TermsContent = {
  subtitle: "מדיניות האתר, משלוחים, החזרות ופרטיות",
  updatedAt: "עדכון אחרון: נובמבר 2026",
  intro: [
    "ברוכים הבאים ל-Eyebreed Official.",
    "השימוש באתר וביצוע רכישה דרכו כפופים למדיניות המפורטת במסמך זה. המשך השימוש באתר מהווה הסכמה לתנאים, בכפוף להוראות הדין.",
  ],
  sections: [
    {
      title: "1. תנאי שימוש באתר",
      paragraphs: [
        "האתר מופעל על ידי Eyebreed Official ומשמש להצגת מוצרי המותג ולמכירתם.",
        "החברה רשאית לעדכן, לשנות, להוסיף או להסיר תכנים, מוצרים, מחירים ומבצעים בכל עת.",
        "החברה רשאית להפסיק את פעילות האתר באופן זמני או קבוע לצורך תחזוקה, שדרוגים, תיקונים או נסיבות אחרות.",
        "אין להשתמש באתר לצורך פעילות בלתי חוקית, ניסיון לפגוע במערכות האתר או שימוש לרעה בשירותיו.",
        "החברה רשאית לסרב או לבטל הזמנה במקרים של חשד להונאה, שימוש בלתי מורשה באמצעי תשלום, טעות מהותית בפרטי ההזמנה או נסיבות אחרות המצדיקות זאת על פי דין. במקרה של ביטול הזמנה ששולמה, יבוצע החזר בהתאם לדין.",
      ],
    },
    {
      title: "2. מוצרים, תמונות ומחירים",
      paragraphs: [
        "החברה עושה מאמצים להציג תמונות, סרטונים ותיאורי מוצרים מדויקים ככל האפשר.",
        "ייתכנו הבדלים מסוימים בין הצבעים המוצגים במסך לבין הצבעים בפועל, בשל הגדרות מסך, תאורה ותנאי צילום.",
        "ייתכנו הבדלים מינוריים במידות ובמאפייני ייצור בין פריטים מאותו דגם.",
        "המחירים באתר מוצגים בשקלים חדשים, אלא אם צוין אחרת.",
        "החברה רשאית לשנות מחירים ומבצעים בכל עת. שינוי מחיר לא ישפיע על הזמנה שכבר אושרה.",
      ],
    },
    {
      title: "3. הזמנות ותשלומים",
      paragraphs: [
        "ביצוע הזמנה באתר מחייב מסירת פרטים נכונים ומלאים, לרבות שם, כתובת, פרטי התקשרות ופרטי תשלום.",
        "לאחר ביצוע הזמנה תישלח ללקוח הודעת אישור בהתאם למערכות האתר.",
        "אישור קבלת ההזמנה אינו בהכרח אישור סופי לכך שניתן לספק את המוצר. האישור כפוף לאימות התשלום, זמינות המוצר ויכולת אספקתו.",
        "התשלום מתבצע באמצעות אמצעי התשלום וספקי הסליקה המוצגים באתר.",
        "במקרה של חיוב כפול, חיוב שגוי או חיוב בגין הזמנה שלא ניתן לספק, החברה תבדוק את המקרה ותפעל לתיקון החיוב או להשבת התשלום בהתאם לדין.",
      ],
    },
    {
      title: "4. מדיניות משלוחים ואספקה",
      paragraphs: [
        "החברה מספקת משלוחים ליעדים המוצגים כאפשריים בעת ביצוע ההזמנה באתר.",
        "אפשרויות המשלוח, עלויות המשלוח ותנאי האספקה יוצגו ללקוח במהלך הרכישה.",
        "זמני האספקה המוצגים באתר הם הערכות בלבד, אלא אם נמסרה התחייבות מפורשת אחרת.",
        "זמני המשלוח עשויים להשתנות בשל עומסים בחברות השילוח, חגים, תנאי מזג אוויר, עיכובים לוגיסטיים, נסיבות ביטחוניות, עיכובים במכס או נסיבות אחרות שאינן בשליטת החברה.",
        "החברה תעשה מאמצים סבירים לספק את ההזמנות במסגרת הזמן שנמסר ללקוח, אך אינה מתחייבת למועד אספקה מדויק שאינו מובטח במפורש.",
        "במקרה של עיכוב משמעותי באספקה, ניתן לפנות לשירות הלקוחות לצורך בירור ועדכון.",
        "במקרה שבו החברה אינה מסוגלת לספק את המוצר, הלקוח יהיה זכאי לפתרון בהתאם לדין, לרבות ביטול העסקה והשבת כספו במקרים המתאימים.",
        "האחריות למסירת כתובת ופרטי התקשרות נכונים חלה על הלקוח.",
      ],
    },
    {
      title: "5. הזמנות מוקדמות (PRE-ORDER)",
      paragraphs: [
        "בחלק מהדרופים והמוצרים של Eyebreed Official עשויה להתאפשר רכישה מוקדמת לפני שהמוצר זמין למשלוח מיידי.",
        "ברכישת מוצר בהזמנה מוקדמת, הלקוח מודע לכך שהמוצר עשוי להיות בתהליך ייצור, הכנה, אריזה או שילוח.",
        "זמני האספקה של הזמנות מוקדמות הם הערכות בלבד ועשויים להשתנות בהתאם לתהליכי הייצור והלוגיסטיקה.",
        "החברה אינה מתחייבת למועד אספקה מדויק אלא אם התחייבה לכך במפורש בעת הרכישה.",
        "החברה תעשה מאמצים סבירים לעדכן את הלקוחות במקרה של עיכוב משמעותי.",
        "רכישה מוקדמת אינה מבטלת את זכויות הביטול וההחזר המוקנות ללקוח על פי דין.",
        "במקרה שבו לא ניתן יהיה לספק הזמנה מוקדמת, החברה תפעל לביטול העסקה ולהשבת התשלום בהתאם לדין.",
      ],
    },
    {
      title: "6. מדיניות ביטולים, החזרות והחלפות",
      paragraphs: [
        "החברה מכבדת את זכויות הצרכנים בהתאם לחוק הגנת הצרכן ולתקנות הרלוונטיות בישראל.",
        "ברכישה דרך האתר, ניתן לבטל עסקה בהתאם לתקופות ולתנאים הקבועים בחוק.",
        "ככלל, ברכישת מוצר ניתן לבטל עסקה בתוך 14 ימים מיום קבלת המוצר או מיום קבלת מסמך פרטי העסקה, לפי המאוחר, בכפוף לחריגים הקבועים בחוק.",
        "בביטול עסקה שאינו נובע מפגם או אי התאמה, החברה רשאית לגבות דמי ביטול בשיעור הקבוע בחוק: 5% ממחיר העסקה או 100 ש”ח, לפי הנמוך מביניהם.",
        "במקרה של ביטול עקב פגם במוצר, אי התאמה, אי אספקה במועד או הפרה מצד החברה, לא ייגבו דמי ביטול ככל שהדין אוסר זאת.",
        "במקרה של ביטול עקב חרטה, הלקוח יידרש להחזיר את המוצר בהתאם להוראות הדין ועל חשבונו, ככל שנדרש.",
        "החברה תטפל בבקשות החזרה, החלפה או ביטול בהתאם להוראות הדין.",
        "אין במדיניות זו כדי לגרוע מזכויות ביטול נוספות המוקנות ללקוח על פי חוק.",
      ],
    },
    {
      title: "7. מצב המוצר בעת החזרה",
      paragraphs: [
        "החברה מבקשת שלקוחות המחזירים מוצרים ישמרו על המוצר, האריזה, התוויות והאביזרים הנלווים ככל האפשר.",
        "מומלץ להחזיר מוצרים כשהם נקיים, שלמים וללא נזק שנגרם עקב שימוש שאינו סביר לצורך בדיקת המוצר.",
        "הסרת תוויות, שימוש במוצר, כביסה או גרימת נזק עשויים להשפיע על אופן הטיפול בהחזרה בהתאם לדין ולנסיבות המקרה.",
        "פתיחת אריזת המוצר או בדיקתו אינן שוללות כשלעצמן את זכויות הביטול המוקנות ללקוח על פי חוק.",
      ],
    },
    {
      title: "8. מוצרים פגומים או הזמנה שגויה",
      paragraphs: [
        "אם התקבל מוצר פגום, מוצר שונה מהמוצר שהוזמן או מוצר שאינו תואם את פרטי ההזמנה, יש ליצור קשר עם שירות הלקוחות בהקדם האפשרי.",
        "מומלץ לצרף תמונות של המוצר ושל פרטי ההזמנה כדי לאפשר בדיקה מהירה.",
        "החברה תבדוק את הפנייה ותציע פתרון בהתאם לנסיבות ולהוראות הדין, לרבות החלפה, תיקון, ביטול עסקה או החזר כספי, לפי העניין.",
        "במקרים שבהם הלקוח קיבל מוצר שגוי או פגום, החברה תישא בעלויות ההחזרה ככל שנדרש על פי דין.",
      ],
    },
    {
      title: "9. תקלות באתר והגבלת אחריות",
      paragraphs: [
        "Eyebreed Official עושה מאמצים להבטיח פעילות תקינה, רציפה ובטוחה של האתר.",
        "עם זאת, החברה אינה מתחייבת שהאתר יהיה זמין בכל עת או שיפעל ללא הפרעות, שגיאות, באגים, תקלות או בעיות טכניות.",
        "ייתכנו הפסקות זמניות בפעילות האתר בשל תחזוקה, עדכוני מערכת, תקלות שרתים, בעיות תקשורת או גורמים חיצוניים.",
        "החברה אינה מתחייבת שכל התכנים, התמונות, המחירים, התיאורים והמידע באתר יהיו חפים מכל טעות.",
        "במקרה של טעות טכנית במחיר, בפרטי מוצר, במלאי או בתהליך ההזמנה, החברה רשאית לבדוק את המקרה ולפעול לתיקון הטעות בהתאם לדין.",
        "החברה אינה אחראית לתקלות שמקורן בתשתיות אינטרנט, במכשירי המשתמש, בספקי תקשורת או במערכות צד שלישי, ככל שהדבר אינו נובע ממעשה או מחדל שבאחריותה על פי דין.",
        "החברה אינה מתחייבת שהאתר יהיה חסין לחלוטין מפני הפרעות, ניסיונות חדירה או אירועי אבטחת מידע, אך תפעל בהתאם לחובות אבטחת המידע החלות עליה.",
        "במקרה שבו לקוח חויב בגין הזמנה שלא ניתן לספק עקב תקלה באתר או כשל במערכת, החברה תבדוק את המקרה ותפעל לביטול העסקה ולהשבת התשלום בהתאם לדין.",
        "אין באמור בסעיף זה כדי לפטור את החברה מאחריות המוטלת עליה על פי חוק.",
      ],
    },
    {
      title: "10. שירותים וספקים חיצוניים",
      paragraphs: [
        "האתר עשוי להשתמש בשירותים חיצוניים, לרבות Shopify, חברות סליקה, חברות שילוח, מערכות דיוור, שירותי אחסון וכלים טכנולוגיים נוספים.",
        "שירותים אלה עשויים להיות כפופים לתנאי השימוש ולמדיניות הפרטיות של אותם ספקים.",
        "החברה אינה אחראית לתקלות טכניות שמקורן בספק חיצוני ואינן בשליטתה, בכפוף לאחריותה על פי דין.",
        "במקרה שבו תקלה בשירות חיצוני משפיעה על הזמנה, תשלום או אספקת מוצר, החברה תעשה מאמצים סבירים לסייע ללקוח ולטפל בבעיה.",
      ],
    },
    {
      title: "11. מדיניות פרטיות ואבטחת מידע",
      paragraphs: [
        "החברה עשויה לאסוף מידע אישי מהלקוחות במסגרת השימוש באתר, לרבות שם, כתובת, כתובת דואר אלקטרוני, מספר טלפון, פרטי הזמנות ופרטי התקשרות.",
        "המידע נאסף לצורך טיפול בהזמנות, ביצוע תשלומים, אספקת מוצרים, שירות לקוחות, מתן עדכונים ושיפור חוויית השימוש באתר.",
        "ככל שהלקוח בוחר להירשם לקבלת עדכונים שיווקיים, החברה עשויה לשלוח לו הודעות על מוצרים חדשים, דרופים, מבצעים ועדכונים, בהתאם להסכמתו ולהוראות הדין.",
        "ניתן לבקש להפסיק קבלת הודעות שיווקיות באמצעות אפשרות ההסרה בהודעה או באמצעות פנייה לחברה.",
        "המידע עשוי להיות מועבר לספקים חיצוניים הנדרשים לצורך תפעול האתר ומתן השירות, כגון Shopify, חברות סליקה, חברות שילוח וספקי שירותים טכנולוגיים.",
        "החברה לא תמכור מידע אישי של לקוחות לצדדים שלישיים לצורכי שיווק עצמאי שלהם, אלא אם התקבל לכך אישור מתאים ובהתאם לדין.",
        "החברה נוקטת אמצעים סבירים להגנה על מידע אישי מפני גישה בלתי מורשית, שימוש לרעה או חשיפה.",
        "למרות אמצעי האבטחה, לא ניתן להבטיח אבטחה מוחלטת של מערכות מידע או העברת מידע באינטרנט.",
        "בהתאם לדין, הלקוח רשאי לפנות לחברה בבקשה לעיין במידע אישי הנוגע אליו ולבקש לתקנו, בכפוף לתנאים ולהוראות החוק.",
        "החברה עשויה להשתמש בקובצי Cookies ובטכנולוגיות דומות לצורך תפעול האתר, שמירת העדפות, ניתוח פעילות, שיפור חוויית המשתמש והתאמת פרסומות, בהתאם לדין ולהגדרות הרלוונטיות.",
        "החברה עשויה לשמור מידע למשך התקופה הנדרשת לצורך המטרות שלשמן נאסף, עמידה בדרישות החוק, טיפול בהזמנות וניהול מחלוקות.",
      ],
    },
    {
      title: "12. זכויות יוצרים וקניין רוחני",
      paragraphs: [
        "כל התכנים באתר, לרבות שם המותג Eyebreed Official, הלוגו, העיצובים, התמונות, הסרטונים, הטקסטים, הגרפיקה והאלמנטים הוויזואליים, מוגנים בזכויות יוצרים ובזכויות קניין רוחני.",
        "אין להעתיק, להפיץ, לפרסם, לשכפל, למכור או לעשות שימוש מסחרי בתכני האתר ללא אישור מראש ובכתב מהחברה.",
        "השימוש באתר אינו מקנה ללקוח בעלות או זכויות כלשהן בקניין הרוחני של המותג.",
      ],
    },
    {
      title: "13. שינויים במדיניות",
      paragraphs: [
        "החברה רשאית לעדכן את המדיניות מעת לעת בהתאם לשינויים בפעילות העסק, באתר או בדרישות החוק.",
        "הגרסה המעודכנת תפורסם באתר ותיכנס לתוקף במועד פרסומה, בכפוף לדין.",
        "שינויים במדיניות לא יפגעו בזכויות שהוקנו ללקוחות במסגרת עסקאות שכבר בוצעו, ככל שהדין מגן עליהן.",
      ],
    },
    {
      title: "14. יצירת קשר",
      paragraphs: [
        "לכל שאלה, בירור, בקשה לביטול עסקה, החזרה, החלפה או פנייה בנושא פרטיות, ניתן ליצור קשר עם Eyebreed Official:",
        "דואר אלקטרוני: eyebreedofficial@gmail.com",
        "טלפון: +972 50-904-5444",
        "כתובת העסק: [יש להכניס כתובת עסק]",
        "אתר: [יש להכניס כתובת האתר]",
        "הודעות ביטול עסקה ניתן לשלוח בדרכים המותרות על פי דין, לרבות באמצעות אמצעי הביטול המקוונים הנדרשים באתר.",
      ],
    },
    {
      title: "15. הוראות כלליות",
      paragraphs: [
        "מדיניות זו כפופה לדיני מדינת ישראל.",
        "במקרה של סתירה בין הוראות מסמך זה לבין הוראות דין מחייבות, יגברו הוראות הדין.",
        "אין באמור במסמך זה כדי לשלול זכויות צרכניות, זכויות פרטיות או כל זכות אחרת המוקנית ללקוח על פי דין.",
        "ככל שסעיף מסוים במדיניות יימצא בלתי תקף או בלתי אכיף, יתר סעיפי המדיניות ימשיכו לעמוד בתוקפם ככל שניתן.",
      ],
    },
  ],
};

const en: TermsContent = {
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
            {locale === "he" ? "מדיניות ותקנון" : "TERMS OF USE"}
          </h1>
          <p className="mt-5 max-w-xl text-sm leading-7 text-white/75">
            {content.subtitle}
          </p>
          {content.updatedAt && (
            <p className="mt-3 text-xs tracking-[.08em] text-white/70">
              {content.updatedAt}
            </p>
          )}
        </div>
      </header>
      <div className="mx-auto max-w-5xl px-6 py-14 sm:px-10 lg:py-24">
        {content.intro && (
          <div className="mb-12 border-s-2 border-espresso-600 ps-5">
            {content.intro.map((paragraph) => (
              <p key={paragraph} className="mt-3 text-sm leading-8 text-black/70 first:mt-0">
                {paragraph}
              </p>
            ))}
          </div>
        )}
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
