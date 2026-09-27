export const copy = {
  en: {
    shipping: "COMPLIMENTARY SHIPPING & RETURNS ON ALL ORDERS",
    nav: ["NEW IN", "CLOTHING", "SHOES", "ACCESSORIES", "EDITORIAL"],
    collection: "NEW COLLECTION",
    headlineA: "DESIGN.",
    headlineB: "QUALITY.",
    headlineC: "STATEMENT.",
    intro: "Timeless pieces, considered for modern life.",
    cta: "SHOP THE COLLECTION",
    edit: "THE VISION",
    media: "THE AUTUMN FILM",
    add: "ADD TO BAG",
    cart: "YOUR BAG",
    empty: "Your bag is currently empty.",
    subtotal: "SUBTOTAL",
    checkout: "PROCEED TO CHECKOUT",
    contact: "CONTACT US",
  },
  he: {
    shipping: "משלוח והחזרות ללא עלות בכל הזמנה",
    nav: ["חדש", "ביגוד", "נעליים", "אקססוריז", "מגזין"],
    collection: "קולקציה חדשה",
    headlineA: "עיצוב.",
    headlineB: "איכות.",
    headlineC: "אמירה.",
    intro: "פריטים על־זמניים, שנוצרו לחיים המודרניים.",
    cta: "לקולקציה",
    edit: "הבחירה שלנו",
    media: "סרט הסתיו",
    add: "הוספה לסל",
    cart: "הסל שלך",
    empty: "הסל שלך עדיין ריק.",
    subtotal: "סכום ביניים",
    checkout: "לתשלום",
    contact: "צרו קשר",
  },
} as const;

export type Locale = keyof typeof copy;
export const Currency = {
  USD: "USD",
  ILS: "ILS",
  EUR: "EUR",
} as const;

export type Currency = (typeof Currency)[keyof typeof Currency];
export const money = (amount: number, currency: Currency, locale: Locale) =>
  new Intl.NumberFormat(locale === "he" ? "he-IL" : "en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
