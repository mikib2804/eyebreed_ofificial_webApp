export type FaqItem = {
  id: string;
  question: string;
  answer: string;
};

export type FaqCategory = {
  title: string;
  items: FaqItem[];
};

export const faqContent: Record<"he" | "en", FaqCategory[]> = {
  he: [
    {
      title: "על המותג והחזון",
      items: [
        {
          id: "what-is-eyebreed",
          question: "מה זה בעצם Eyebreed?",
          answer: "Eyebreed הוא הרבה מעבר למותג בגדים. הוא נולד מתוך סיפור אישי והפך לדרך להביע את עצמך, להתפתח ולראות את עצמך מעבר למה שאתה חושב שאתה היום. דרך אופנת רחוב אנחנו מביאים לידי ביטוי חזון שמתחיל מבפנים ונראה כלפי חוץ.",
        },
        {
          id: "why-eyebreed",
          question: "למה הקמתי את Eyebreed?",
          answer: "Eyebreed התחיל מחוסר ביטחון שהיה לי לגבי העיניים שלי. במקום לתת לחוסר הביטחון הזה להגדיר אותי, החלטתי להפוך אותו למשהו גדול יותר. ככה נולד מותג שמייצג את הדרך שבה אני רוצה לחיות — לא לתת לאופן שבו אני רואה את עצמי היום להגביל את מי שאני יכול להיות מחר.",
        },
        {
          id: "meaning-of-vision",
          question: "מה המשמעות של המשפט It’s not the eyes, it’s the vision?",
          answer: "זה לא העיניים, זו הראייה. המשפט מסמל את הרעיון שהדרך שבה אנחנו רואים את עצמנו לא חייבת לקבוע מי נהיה. חוסר הביטחון שלנו לא מגדיר את הפוטנציאל שלנו. מה שחשוב הוא החזון שלנו והפעולות שאנחנו עושים כדי להתקדם.",
        },
        {
          id: "vision-drop",
          question: "מה עומד מאחורי דרופ VISION?",
          answer: "VISION הוא יותר מדרופ של בגדים — הוא תזכורת להסתכל מעבר למי שאנחנו חושבים שאנחנו היום. הוא מייצג התפתחות, אמונה עצמית, התמדה והבחירה לא לתת לפחדים ולחוסר הביטחון שלנו לנהל אותנו.",
        },
        {
          id: "what-makes-us-different",
          question: "מה הופך את Eyebreed למותג שונה?",
          answer: "אנחנו שמים דגש על הגזרות, הבדים והפרטים הקטנים, אבל לא פחות חשוב מכך — על המשמעות שמאחורי כל פריט. אנחנו רוצים ליצור משהו שאנשים יוכלו להתחבר אליו, לא רק ללבוש אותו.",
        },
        {
          id: "who-is-it-for",
          question: "למי המותג מיועד?",
          answer: "לכל מי שרוצה להתקדם, לבנות משהו משלו ולא לתת לדעות של אחרים או לחוסר הביטחון שלו לעצור אותו. אתה לא חייב להיות האדם שאתה שואף להיות כבר עכשיו — אתה רק צריך חזון ורצון להתקדם.",
        },
        {
          id: "confidence",
          question: "האם צריך להיות בטוח בעצמך כדי להתחבר למותג?",
          answer: "ממש לא. Eyebreed נולד דווקא מתוך חוסר ביטחון. אנחנו מאמינים שלא צריך להיות מושלם כדי להתחיל, ולא צריך להרגיש בטוח בכל רגע כדי להתקדם.",
        },
        {
          id: "how-it-feels",
          question: "מה אנחנו רוצים שאנשים ירגישו כשהם לובשים Eyebreed?",
          answer: "אנחנו רוצים שכל פריט יהיה יותר ממשהו שנראה טוב. אנחנו רוצים שהוא יזכיר לך שיש לך אפשרות לבחור את הדרך שלך, להתפתח ולהסתכל קדימה — לא כדי להוכיח משהו לאחרים, אלא כדי לבנות את האדם שאתה רוצה להיות.",
        },
        {
          id: "future-drops",
          question: "איך אפשר להתעדכן בדרופים הבאים?",
          answer: "אפשר לעקוב אחרינו ברשתות החברתיות ולהירשם לרשימת הדיוור באתר כדי לקבל עדכונים על דרופים חדשים והרשמות מוקדמות כשהן זמינות.",
        },
      ],
    },
    {
      title: "על המוצרים וההזמנות",
      items: [
        {
          id: "choosing-size",
          question: "איך בוחרים מידה?",
          answer: "מומלץ לעיין במדריך המידות ובתיאור המוצר לפני ביצוע ההזמנה, כדי לבחור את המידה המתאימה לך.",
        },
        {
          id: "oversized-fit",
          question: "האם הבגדים בגזרת אוברסייז?",
          answer: "המותג מתמקד באסתטיקת סטריטוור ובגזרות אוברסייז. מומלץ לבדוק את תיאור המוצר ומדריך המידות כדי לבחור את ההתאמה הרצויה.",
        },
        {
          id: "delivery-time",
          question: "תוך כמה זמן המשלוח מגיע?",
          answer: "זמני המשלוח משתנים בהתאם לכתובת ולשיטת המשלוח שנבחרה. לפרטים נוספים ניתן לעיין במדיניות המשלוחים באתר.",
        },
        {
          id: "returns",
          question: "האם ניתן להחזיר או להחליף מוצר?",
          answer: "ניתן לעיין במדיניות ההחזרות וההחלפות באתר לקבלת מידע על התנאים ועל אופן ביצוע התהליך.",
        },
        {
          id: "contact",
          question: "איך אפשר ליצור איתנו קשר?",
          answer: "לשאלות בנוגע להזמנות, למידות או למוצרים, ניתן לפנות אלינו דרך פרטי יצירת הקשר המופיעים באתר או בעמודים הרשמיים שלנו ברשתות החברתיות.",
        },
      ],
    },
  ],
  en: [
    {
      title: "The Brand & The Vision",
      items: [
        {
          id: "what-is-eyebreed",
          question: "What is Eyebreed?",
          answer: "Eyebreed is much more than a clothing brand. It began with a personal story and became a way to express yourself, grow, and see beyond who you think you are today. Through streetwear, we bring to life a vision that starts within and becomes visible on the outside.",
        },
        {
          id: "why-eyebreed",
          question: "Why did I create Eyebreed?",
          answer: "Eyebreed began with the insecurity I felt about my eyes. Instead of letting that insecurity define me, I chose to turn it into something bigger. That is how a brand was born around the way I want to live: never letting how I see myself today limit who I can become tomorrow.",
        },
        {
          id: "meaning-of-vision",
          question: "What does ‘It’s not the eyes, it’s the vision’ mean?",
          answer: "The phrase represents the idea that how we see ourselves does not have to determine who we become. Our insecurities do not define our potential. What matters is our vision and the actions we take to move forward.",
        },
        {
          id: "vision-drop",
          question: "What is the idea behind the VISION drop?",
          answer: "VISION is more than a clothing drop. It is a reminder to look beyond who we think we are today. It represents growth, self-belief, persistence, and the choice not to let fear or insecurity take control.",
        },
        {
          id: "what-makes-us-different",
          question: "What makes Eyebreed different?",
          answer: "We focus on silhouettes, fabrics, and small details, but just as importantly, on the meaning behind every piece. We want to create something people can connect with, not simply wear.",
        },
        {
          id: "who-is-it-for",
          question: "Who is the brand for?",
          answer: "For anyone who wants to move forward, build something of their own, and refuse to let other people’s opinions or personal insecurities hold them back. You do not have to be the person you aspire to become yet. You only need a vision and the desire to progress.",
        },
        {
          id: "confidence",
          question: "Do I need to feel confident to connect with the brand?",
          answer: "Not at all. Eyebreed was born from insecurity. We believe you do not need to be perfect to begin, and you do not need to feel confident at every moment to keep moving forward.",
        },
        {
          id: "how-it-feels",
          question: "How do we want people to feel when wearing Eyebreed?",
          answer: "We want every piece to be more than something that looks good. We want it to remind you that you can choose your path, grow, and look ahead—not to prove anything to others, but to build the person you want to become.",
        },
        {
          id: "future-drops",
          question: "How can I hear about future drops?",
          answer: "Follow us on social media and join the mailing list on our website to receive updates about new drops and early-access registrations when they become available.",
        },
      ],
    },
    {
      title: "Products & Orders",
      items: [
        {
          id: "choosing-size",
          question: "How do I choose a size?",
          answer: "Review the size guide and product description before ordering to choose the size that best suits you.",
        },
        {
          id: "oversized-fit",
          question: "Are the clothes oversized?",
          answer: "The brand focuses on streetwear aesthetics and oversized silhouettes. Check each product description and the size guide to choose your preferred fit.",
        },
        {
          id: "delivery-time",
          question: "How long does delivery take?",
          answer: "Delivery times vary according to the destination and selected shipping method. Please review the shipping policy on the website for more information.",
        },
        {
          id: "returns",
          question: "Can I return or exchange an item?",
          answer: "Please review the returns and exchanges policy on the website for eligibility details and instructions.",
        },
        {
          id: "contact",
          question: "How can I contact you?",
          answer: "For questions about orders, sizing, or products, contact us using the details on the website or through our official social-media pages.",
        },
      ],
    },
  ],
};
