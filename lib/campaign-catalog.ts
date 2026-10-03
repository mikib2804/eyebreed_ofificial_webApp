import type { StoreProduct } from "@/lib/catalog";

const careHe = `הוראות כביסה
• כביסה עדינה בטמפרטורה של עד 20°C
• אין לשלב בין צבעים
• מומלץ ייבוש עצמי / ייבוש באוויר
• מומלץ להימנע מייבוש בחום גבוה`;

const careEn = `Care Instructions
• Gentle wash at temperatures up to 20°C
• Do not mix colors
• Air drying is recommended
• Avoid drying at high temperatures`;

const brandStoryHe = `EYEBREED — IT’S NOT THE EYES, IT’S THE VISION.

הסיפור שלנו — EYEBREED נולד מחוסר ביטחון. מאחורי המותג עומד אדם שלא תמיד היה מסוגל להסתכל על עצמו במראה בלי לשפוט את עצמו — את המראה שלו, את חוסר הסימטריה בעיניים ואת הדרך שבה אחרים עלולים לראות אותו.

אבל במקום לתת לחוסר הביטחון להגדיר אותו, הוא החליט להפוך אותו ל־Vision. חוסר הסימטריה בעיניים הפך לנקודת ההתחלה של EYEBREED — "גזעי עיניים". מותג שנבנה מתוך הרעיון שהדבר שאנחנו הכי מנסים להסתיר יכול להפוך דווקא לדבר שהכי מייחד אותנו.

EYEBREED הוא לא רק מה שאתה לובש. מי שלובש אותו הוא חלק מקהילה שבאה לנצח את החיים, להתגבר על מה שעוצר אותה ולהסתכל קדימה.`;

const brandStoryEn = `EYEBREED — IT’S NOT THE EYES, IT’S THE VISION.

Our story — EYEBREED was born from insecurity. Behind the brand is a person who could not always look in the mirror without judging his appearance, the asymmetry of his eyes, or the way others might see him.

Instead of allowing insecurity to define him, he chose to transform it into Vision. The asymmetry became the starting point for EYEBREED: a brand built on the belief that what we try hardest to hide can become what makes us most distinctive.

EYEBREED is more than what you wear. Everyone who wears it joins a community determined to overcome what holds them back, take on life, and keep looking forward.`;

export const modernAllImages = [
  "/campaign/modernAll/DSCF0093.JPG",
  "/campaign/modernAll/DSCF0127.JPG",
  "/campaign/modernAll/DSCF0181.JPG",
  "/campaign/modernAll/DSCF0280.JPG",
  "/campaign/modernAll/DSCF0415.JPG",
  "/campaign/modernAll/DSCF0422.JPG",
  "/campaign/modernAll/DSCF0479.JPG",
  "/campaign/modernAll/DSCF0544.JPG",
  "/campaign/modernAll/DSCF9999.JPG",
] as const;

export const campaignProducts = [
  {
    folder: "hat",
    name: "Vision EB Hat",
    nameHe: "כובע Vision EB",
    slug: "vision-logo-beanie",
    description: `Vision EB Hat is a knitted and stitched beanie with the EB logo integrated into the design.

Details:
• Type: Beanie
• Fabric: Knitted knit
• Logo: EB
• Colors: Pink, brown
• Sizes: M, L

${careEn}`,
    descriptionHe: `Vision EB Hat הוא כובע גרב סרוג ותפור, עם לוגו EB כחלק בלתי נפרד מהעיצוב.

הכובע עשוי מבד Knit סרוג, ומגיע בשני צבעים המשתלבים בשפת הצבעים של קולקציית Vision.

פרטים:
• סוג: כובע גרב
• בד: Knit סרוג
• לוגו: EB
• צבעים: ורוד, חום
• מידות: M, L

${careHe}`,
    story: brandStoryEn,
    storyHe: brandStoryHe,
    material: "Knitted knit",
    prices: { USD: 45, ILS: 169, EUR: 42 },
    sizes: ["M", "L"],
    displayImage: "/campaign/hat/display.JPG",
    images: [
      "/campaign/hat/model_View.jpg",
      "/campaign/hat/display.JPG",
      "/campaign/hat/DSCF9877.JPG",
      "/campaign/hat/DSCF0133.JPG",
      "/campaign/modernAll/DSCF0127.JPG",
      "/campaign/hat/DSCF0144.JPG",
    ],
  },
  {
    folder: "hoodie",
    name: "Vision Zip Up",
    nameHe: "קפוצ׳ון Vision Zip Up",
    slug: "vision-washed-zip-hoodie",
    description: `Vision Zip Up has an oversized fit and is made from 100% cotton at 400 GSM for a heavyweight structure and strong presence.

The zip-up comes in a washed blue tone, with purple and pink stitching details that create the distinctive language of the Vision collection. An embroidered EB stamp appears on the hood.

Details:
• Fit: Oversized
• Fabric: 100% cotton
• Fabric weight: 400 GSM
• Color: Washed blue
• Stitching details: Purple and pink
• Hood with embroidered EB stamp

${careEn}`,
    descriptionHe: `Vision Zip Up בגזרת Oversized, עשוי מבד 100% כותנה במשקל 400 GSM למבנה כבד ונוכחות חזקה.

הזיפ אפ מגיע בגוון כחול Washed, עם פרטי תפירה בגווני סגול וורוד היוצרים את השפה הייחודית של קולקציית Vision. על כובע הזיפ אפ מופיעה חותמת EB תפורה, כחלק מהמיתוג של הפריט.

פרטים:
• גזרה: Oversized
• בד: 100% כותנה
• משקל בד: 400 GSM
• צבע: כחול Washed
• פרטי תפירה: סגול וורוד
• כובע עם חותמת EB תפורה

${careHe}`,
    story: brandStoryEn,
    storyHe: brandStoryHe,
    material: "100% cotton · 400 GSM",
    prices: { USD: 129, ILS: 479, EUR: 119 },
    sizes: ["XS", "S", "M", "L", "XL"],
    displayImage: "/campaign/hoodie/display.JPG",
    images: [
      "/campaign/hoodie/model_View.jpg",
      "/campaign/hoodie/display.JPG",
      "/campaign/hoodie/DSCF9961.JPG",
      "/campaign/modernAll/DSCF9999.JPG",
      "/campaign/hoodie/DSCF0035.JPG",
      "/campaign/hoodie/DSCF0042.JPG",
      "/campaign/hoodie/DSCF0436.JPG",
      "/campaign/hoodie/DSCF0446.JPG",
      "/campaign/hoodie/DSCF0479.JPG",
      "/campaign/hoodie/DSCF0588.JPG",
      "/campaign/hoodie/DSCF0600.JPG",
      "/campaign/hoodie/DSCF9919.JPG",
      "/campaign/hoodie/DSCF9933.JPG",
      "/campaign/hoodie/DSCF9938.JPG",
    ],
  },
  {
    folder: "pants",
    name: "Vision Joggers",
    nameHe: "מכנסי Vision Joggers",
    slug: "vision-panel-sweatpants",
    description: `Vision Joggers have an oversized, baggy fit designed for a wide, comfortable presence.

Made from heavyweight 365 GSM fleece in an 85% cotton and 15% polyester composition. The joggers include a back pocket with the EB brand stamp and wide white stripes running down both sides.

Details:
• Fit: Oversized / Baggy
• Fabric: Heavyweight fleece, 365 GSM
• Composition: 85% cotton / 15% polyester
• Colors: White, grey
• Design: Stitched construction
• Back pocket with EB stamp

${careEn}`,
    descriptionHe: `מכנס Vision Joggers בגזרת Oversized / Baggy, שנבנה לנוכחות רחבה ונוחה.

עשוי מבד פליס כבד במשקל 365 GSM, בהרכב של 85% כותנה ו־15% פוליאסטר. המכנס כולל כיס אחורי עם חותמת המותג EB ופסים רחבים בגוון לבן העוברים משני צידי המכנס ומשלימים את העיצוב במרכז הצדדים.

פרטים:
• גזרה: Oversized / Baggy
• בד: פליס כבד, 365 GSM
• הרכב: 85% כותנה / 15% פוליאסטר
• צבעים: לבן, אפור
• עיצוב: תפירה
• כיס אחורי עם חותמת EB

${careHe}`,
    story: brandStoryEn,
    storyHe: brandStoryHe,
    material: "85% cotton · 15% polyester · 365 GSM",
    prices: { USD: 99, ILS: 369, EUR: 92 },
    sizes: ["XS", "S", "M", "L", "XL"],
    displayImage: "/campaign/pants/display.JPG",
    images: [
      "/campaign/pants/model_View.jpg",
      "/campaign/pants/display.JPG",
      "/campaign/pants/DSCF0068.JPG",
      "/campaign/pants/DSCF0501.JPG",
      "/campaign/pants/DSCF0102.JPG",
      "/campaign/modernAll/DSCF0544.JPG",
      "/campaign/pants/DSCF0519.JPG",
      "/campaign/pants/DSCF0520.JPG",
      "/campaign/pants/DSCF0538.JPG",
      "/campaign/pants/DSCF0544.JPG",
      "/campaign/pants/DSCF0565.JPG",
    ],
  },
  {
    folder: "shirt",
    name: "Vision Polo",
    nameHe: "חולצת Vision Polo",
    slug: "vision-25-layered-jersey",
    description: `Vision Polo has a subtle oversized fit with long sleeves beginning at mid-arm to create an additional color layer within the design.

Made from 100% cotton using fabrics between 220–260 GSM. The design combines cut-and-sew construction with printed elements and EB stamps positioned at the garment edges.

Details:
• Fit: Subtle oversized
• Fabric: 100% cotton
• Fabric weight: 220–260 GSM
• Colors: Pink, brown
• Design: Cut-and-sew construction with printed stitching
• White sleeves beginning at the middle of the polo
• EB stamps at the garment edges

${careEn}`,
    descriptionHe: `Vision Polo בגזרת Oversized עדינה, עם שרוולים ארוכים המתחילים מאמצע היד ויוצרים שכבת צבע נוספת כחלק מהעיצוב.

הפולו עשוי 100% כותנה, בשילוב בדים במשקלים של 220–260 GSM. העיצוב משלב חיתוכים ותפירות כחלק מהבגד, לצד אלמנטים מודפסים וחותמות EB הממוקמות בקצוות הבגד. השרוולים הלבנים מתחילים מאמצע הפולו ומשלימים את מראה השכבות.

פרטים:
• גזרה: Oversized עדינה
• בד: 100% כותנה
• משקל בד: 220–260 GSM
• צבעים: ורוד, חום
• עיצוב: חיתוך ותפירה עם הבגד + תפירה מודפסת
• שרוולים לבנים המתחילים מאמצע הפולו
• חותמות EB בקצוות הבגד

${careHe}`,
    story: brandStoryEn,
    storyHe: brandStoryHe,
    material: "100% cotton · 220–260 GSM",
    prices: { USD: 89, ILS: 329, EUR: 82 },
    sizes: ["XS", "S", "M", "L", "XL"],
    displayImage: "/campaign/shirt/display.JPG",
    images: [
      "/campaign/shirt/model_View.jpg",
      "/campaign/shirt/display.JPG",
      "/campaign/shirt/DSCF0054.JPG",
      "/campaign/shirt/DSCF0177.JPG",
      "/campaign/shirt/DSCF0090.JPG",
      "/campaign/modernAll/DSCF0093.JPG",
      "/campaign/shirt/DSCF0111.JPG",
      "/campaign/shirt/DSCF0134.JPG",
      "/campaign/shirt/DSCF0181.JPG",
      "/campaign/shirt/DSCF0221.JPG",
      "/campaign/shirt/DSCF0246.JPG",
      "/campaign/shirt/DSCF0256.JPG",
      "/campaign/shirt/DSCF0280.JPG",
      "/campaign/shirt/DSCF0300.JPG",
      "/campaign/shirt/DSCF0303.JPG",
    ],
  },
] as const;

export function campaignProductToStoreProduct(
  item: (typeof campaignProducts)[number],
  databaseProduct?: StoreProduct,
): StoreProduct {
  const perSize = item.folder === "hat" ? 30 : 6;
  return {
    id: databaseProduct?.id ?? `campaign-${item.slug}`,
    slug: item.slug,
    name: item.name,
    nameHe: item.nameHe,
    material: item.material,
    image: item.displayImage,
    images: [...item.images],
    description: item.description,
    descriptionHe: item.descriptionHe,
    story: item.story,
    storyHe: item.storyHe,
    inventory: databaseProduct?.inventory ?? perSize * item.sizes.length,
    sizes: databaseProduct?.sizes ?? item.sizes.map((size) => ({ size, inventory: perSize })),
    prices: { ...item.prices },
  };
}
