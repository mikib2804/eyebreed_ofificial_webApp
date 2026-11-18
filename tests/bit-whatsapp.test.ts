import assert from "node:assert/strict";
import { test } from "node:test";
import {
  BIT_WHATSAPP_NUMBER,
  buildBitWhatsappMessage,
  buildBitWhatsappUrl,
  type BitWhatsappOrder,
} from "../lib/bit-whatsapp";

const order: BitWhatsappOrder = {
  locale: "he",
  currency: "ILS",
  address: {
    label: "בית",
    fullName: "ישראל ישראלי",
    phone: "0501234567",
    line1: "רחוב הדוגמה 1",
    line2: "דירה 4",
    city: "תל אביב",
    postalCode: "61000",
    country: "Israel",
  },
  lines: [{
    name: "חולצת Vision",
    quantity: 2,
    size: "M",
    color: null,
    unitAmount: 100,
    lineAmount: 200,
  }],
  subtotal: 200,
  discountAmount: 30,
  shippingAmount: 0,
  total: 170,
  freeShipping: true,
  promotion: { label: "15% website promotion", percentage: 15 },
  discountCode: "SAVE15",
};

test("Bit WhatsApp message includes address, variants, trusted prices, and discount calculation", () => {
  const message = buildBitWhatsappMessage(order);
  assert.match(message, /ישראל ישראלי/);
  assert.match(message, /רחוב הדוגמה 1, דירה 4, תל אביב, 61000, Israel/);
  assert.match(message, /חולצת Vision/);
  assert.match(message, /מידה: M \| כמות: 2/);
  assert.match(message, /15% website promotion · 15% · קוד: SAVE15/);
  assert.match(message, /חישוב:.*200.*-.*30.*\+.*0.*=.*170/);
});

test("Bit WhatsApp URL targets the configured business number with encoded text", () => {
  const url = buildBitWhatsappUrl(order);
  assert.ok(url.startsWith(`https://wa.me/${BIT_WHATSAPP_NUMBER}?text=`));
  assert.equal(decodeURIComponent(url.split("?text=")[1]), buildBitWhatsappMessage(order));
});
