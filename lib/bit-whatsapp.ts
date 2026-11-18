import type { Locale } from "@/lib/i18n";

export const BIT_WHATSAPP_NUMBER = "972509045444";

type BitAddress = {
  label?: string;
  fullName: string;
  phone: string | null;
  line1: string;
  line2: string | null;
  city: string;
  postalCode: string | null;
  country: string;
};

type BitOrderLine = {
  name: string;
  quantity: number;
  size: string | null;
  color: string | null;
  unitAmount: number;
  lineAmount: number;
};

export type BitWhatsappOrder = {
  locale: Locale;
  currency: "USD" | "ILS" | "EUR";
  address: BitAddress;
  lines: BitOrderLine[];
  subtotal: number;
  discountAmount: number;
  shippingAmount: number;
  total: number;
  freeShipping: boolean;
  promotion: { label: string; percentage: number } | null;
  discountCode: string | null;
};

function amount(value: number, currency: BitWhatsappOrder["currency"], locale: Locale) {
  return new Intl.NumberFormat(locale === "he" ? "he-IL" : "en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}

export function buildBitWhatsappMessage(order: BitWhatsappOrder) {
  const he = order.locale === "he";
  const addressParts = [
    order.address.line1,
    order.address.line2,
    order.address.city,
    order.address.postalCode,
    order.address.country,
  ].filter(Boolean);
  const itemLines = order.lines.flatMap((line, index) => [
    `${index + 1}. ${line.name}`,
    `${he ? "מידה" : "Size"}: ${line.size || (he ? "ללא" : "N/A")} | ${he ? "כמות" : "Quantity"}: ${line.quantity}${line.color ? ` | ${he ? "צבע" : "Color"}: ${line.color}` : ""}`,
    `${he ? "מחיר ליחידה" : "Unit price"}: ${amount(line.unitAmount, order.currency, order.locale)} | ${he ? "סה״כ לפריט" : "Line total"}: ${amount(line.lineAmount, order.currency, order.locale)}`,
  ]);
  const promotionDetails = [
    order.promotion?.label,
    order.promotion && order.promotion.percentage > 0 ? `${order.promotion.percentage}%` : null,
    order.discountCode ? `${he ? "קוד" : "Code"}: ${order.discountCode}` : null,
  ].filter(Boolean).join(" · ");
  const calculation = order.discountAmount > 0
    ? `${amount(order.subtotal, order.currency, order.locale)} - ${amount(order.discountAmount, order.currency, order.locale)} + ${amount(order.shippingAmount, order.currency, order.locale)} = ${amount(order.total, order.currency, order.locale)}`
    : `${amount(order.subtotal, order.currency, order.locale)} + ${amount(order.shippingAmount, order.currency, order.locale)} = ${amount(order.total, order.currency, order.locale)}`;

  return [
    he
      ? "שלום, אני רוצה להשלים הזמנה מ-EYEBREED ולשלם באמצעות Bit."
      : "Hello, I would like to complete my EYEBREED order and pay with Bit.",
    "",
    he ? "*פרטי לקוח ומשלוח*" : "*Customer and shipping details*",
    `${he ? "שם" : "Name"}: ${order.address.fullName}`,
    order.address.phone ? `${he ? "טלפון" : "Phone"}: ${order.address.phone}` : null,
    order.address.label ? `${he ? "סוג כתובת" : "Address label"}: ${order.address.label}` : null,
    `${he ? "כתובת" : "Address"}: ${addressParts.join(", ")}`,
    "",
    he ? "*פריטים*" : "*Items*",
    ...itemLines,
    "",
    he ? "*חישוב ההזמנה*" : "*Order calculation*",
    `${he ? "סכום ביניים" : "Subtotal"}: ${amount(order.subtotal, order.currency, order.locale)}`,
    order.discountAmount > 0 && order.promotion ? `${he ? "הנחה" : "Discount"} (${promotionDetails}): -${amount(order.discountAmount, order.currency, order.locale)}` : null,
    `${he ? "משלוח" : "Shipping"}: ${order.freeShipping ? (he ? "חינם" : "FREE") : amount(order.shippingAmount, order.currency, order.locale)}`,
    `${he ? "חישוב" : "Calculation"}: ${calculation}`,
    `${he ? "סה״כ לתשלום" : "Total to pay"}: *${amount(order.total, order.currency, order.locale)}*`,
    `${he ? "מטבע" : "Currency"}: ${order.currency}`,
    "",
    he
      ? "אשמח לאישור זמינות ולפרטי התשלום ב-Bit. ידוע לי שההזמנה תאושר רק לאחר אישור התשלום."
      : "Please confirm availability and send the Bit payment details. I understand the order is confirmed only after payment approval.",
  ].filter((line): line is string => line !== null).join("\n");
}

export function buildBitWhatsappUrl(order: BitWhatsappOrder) {
  return `https://wa.me/${BIT_WHATSAPP_NUMBER}?text=${encodeURIComponent(buildBitWhatsappMessage(order))}`;
}
