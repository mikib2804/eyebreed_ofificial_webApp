import type { Locale } from "@/lib/i18n";

export const preOrderContent = {
  he: {
    title: "מהי הזמנה מוקדמת (PRE-ORDER)?",
    paragraphs: [
      "כל הפריטים מדרופ VISION נמכרים בשיטת הזמנה מוקדמת (Pre-Order).",
      "אז מה זה בעצם אומר?",
      "הזמנה מוקדמת מאפשרת לנו כמותג להבין את הביקוש האמיתי של הקהל ולייצר בהתאם.",
      "אבל EYEBREED היא הרבה מעבר למותג בגדים. מאחורי המותג עומד רעיון שלא כולם בהכרח יתחברו אליו. אולי לחלקכם יהיה קשה להבין מה הקשר בין בגדים, אי-סימטריה בעיניים והרצון לנצח בחיים.",
      "אבל מי שכן מתחבר לחזון ובוחר ללבוש EYEBREED, מבין שהמסר הוא הרבה מעבר למה שרואים מבחוץ.",
    ],
    important: "חשוב לדעת לפני ההזמנה:",
    bullets: [
      "כל הפריטים נמכרים בהזמנה מוקדמת.",
      "הסחורה עדיין לא נמצאת בישראל.",
      "זמן האספקה המשוער הוא בין 30 ל-60 ימים ממועד ההזמנה.",
      "לאחר ביצוע ההזמנה, תוכלו לקבל עדכונים מהאתר בנוגע להתקדמות ההזמנה ולמועד האספקה.",
    ],
    closing: "אנחנו מעריכים כל אחד ואחת שבוחרים להיות חלק מהדרך שלנו.",
  },
  en: {
    title: "What is a PRE-ORDER?",
    paragraphs: [
      "All items from the VISION drop are sold as Pre-Orders.",
      "What does that mean?",
      "Pre-Ordering allows us as a brand to understand real customer demand and produce accordingly.",
      "EYEBREED is much more than a clothing brand. Behind the brand is an idea that not everyone will necessarily connect with. Some may find it difficult to understand the connection between clothing, eye asymmetry, and the desire to win in life.",
      "Those who connect with the vision and choose to wear EYEBREED understand that the message goes far beyond what is visible on the outside.",
    ],
    important: "Important information before ordering:",
    bullets: [
      "All items are sold as Pre-Orders.",
      "The merchandise is not yet in Israel.",
      "Estimated delivery is 30–60 days from the order date.",
      "After ordering, you can receive website updates about order progress and the expected delivery date.",
    ],
    closing: "We appreciate everyone who chooses to be part of our journey.",
  },
} as const;

export function preOrderFaqAnswer(locale: Locale) {
  const content = preOrderContent[locale];
  return [
    ...content.paragraphs,
    content.important,
    ...content.bullets.map((item) => `• ${item}`),
    content.closing,
    "IT’S NOT THE EYES, IT’S THE VISION.",
    "EYEBREED.",
  ].join("\n\n");
}
