export const copy = {
  en: {
    shipping:
      "BUY 3 ITEMS: FREE SHIPPING + A FREE HAT · BUY THE ZIP-UP + POLO: FREE SHIPPING",
    nav: ["NEW IN", "CLOTHING", "ACCESSORIES", "EDITORIAL"],
    // nav: ["NEW IN", "CLOTHING", "SHOES", "ACCESSORIES", "EDITORIAL"],
    collection: "NEW COLLECTION",
    headlineA: "VISION",
    headlineB: "OF LIFE",
    headlineC: "",
    intro: "More then human Eye can see.",
    cta: "SHOP THE COLLECTION",
    edit: "THE VISION",
    media: "The Vision Collection",
    add: "ADD TO BAG",
    cart: "YOUR BAG",
    empty: "Your bag is currently empty.",
    subtotal: "SUBTOTAL",
    checkout: "PROCEED TO CHECKOUT",
    contact: "CONTACT US",
  },
  he: {
    shipping:
      "קנו 3 פריטים וקבלו משלוח חינם + כובע מתנה · קנו זיפ אפ ופולו וקבלו משלוח חינם",
    nav: ["חדש", "ביגוד", "נעליים", "אקססוריז", "מגזין"],
    collection: "קולקציה חדשה",
    headlineA: "ראיית",
    headlineB: "החיים שלי",
    headlineC: "",
    intro: "יותר ממה שהעין האנושית יכולה לראות.",
    cta: "לקולקציה",
    edit: "THE VISION",
    media: "The Vision Collection",
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
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
