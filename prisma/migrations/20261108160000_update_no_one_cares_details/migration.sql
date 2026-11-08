UPDATE "Product"
SET
  "description" = 'Part of the premium No One Cares tracksuit by EYEBREED, featuring an oversized hoodie and pants cut from premium 500 GSM fleece in an 80% cotton and 20% polyester composition.

The set features a double-layer hood, hidden pockets, uniquely designed seams and pink EYEBREED embroidery to complete the look.',
  "descriptionHe" = 'סט פוטר פרימיום הכולל קפוצ’ון ומכנסיים בגזרת Oversized, עשוי בד Fleece איכותי במשקל 500GSM, בהרכב 80% כותנה ו־20% פוליאסטר.

הסט כולל כובע כפול, כיסים נסתרים, תפרים בעיצוב ייחודי ורקמת EYEBREED ורודה להשלמת הלוק.',
  "material" = '500 GSM Fleece · 80% cotton · 20% polyester',
  "updatedAt" = CURRENT_TIMESTAMP
WHERE "slug" IN ('uneven-pants', 'uneven-hoodie');
