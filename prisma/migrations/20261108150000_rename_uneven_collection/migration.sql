UPDATE "Product"
SET
  "name" = 'No One Cares Pants – EYEBREED',
  "nameHe" = 'מכנסי No One Cares – EYEBREED',
  "description" = REPLACE("description", 'Uneven Pants', 'No One Cares Pants – EYEBREED'),
  "descriptionHe" = REPLACE("descriptionHe", 'מכנסי Uneven', 'מכנסי No One Cares – EYEBREED'),
  "updatedAt" = CURRENT_TIMESTAMP
WHERE "slug" = 'uneven-pants';

UPDATE "Product"
SET
  "name" = 'No One Cares Hoodie – EYEBREED',
  "nameHe" = 'קפוצ׳ון No One Cares – EYEBREED',
  "description" = REPLACE("description", 'Uneven Hoodie', 'No One Cares Hoodie – EYEBREED'),
  "descriptionHe" = REPLACE("descriptionHe", 'קפוצ׳ון Uneven', 'קפוצ׳ון No One Cares – EYEBREED'),
  "updatedAt" = CURRENT_TIMESTAMP
WHERE "slug" = 'uneven-hoodie';
