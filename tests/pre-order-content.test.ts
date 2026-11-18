import assert from "node:assert/strict";
import test from "node:test";
import { preOrderContent, preOrderFaqAnswer } from "../lib/pre-order-content";

test("Hebrew pre-order disclosure contains every required fulfillment fact", () => {
  const answer = preOrderFaqAnswer("he");

  assert.match(answer, /כל הפריטים מדרופ VISION נמכרים בשיטת הזמנה מוקדמת/);
  assert.match(answer, /הסחורה עדיין לא נמצאת בישראל/);
  assert.match(answer, /30 ל-60 ימים/);
  assert.match(answer, /עדכונים מהאתר בנוגע להתקדמות ההזמנה/);
  assert.match(answer, /IT’S NOT THE EYES, IT’S THE VISION\./);
  assert.match(answer, /EYEBREED\./);
});

test("English pre-order disclosure retains the same operational facts", () => {
  const answer = preOrderFaqAnswer("en");

  assert.equal(preOrderContent.en.bullets.length, preOrderContent.he.bullets.length);
  assert.match(answer, /merchandise is not yet in Israel/i);
  assert.match(answer, /30–60 days/);
  assert.match(answer, /website updates about order progress/i);
});
