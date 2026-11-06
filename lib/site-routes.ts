export type SiteLocale = "en" | "he";

export type PublicSiteRoute = {
  id: string;
  href: string;
  label: Record<SiteLocale, string>;
  footerGroup: "shop" | "help";
  showInNavigation: boolean;
};

export const publicSiteRoutes = [
  {
    id: "home",
    href: "/",
    label: { en: "Home", he: "עמוד הבית" },
    footerGroup: "shop",
    showInNavigation: false,
  },
  {
    id: "collection",
    href: "/#products",
    label: { en: "Collection", he: "הקולקציה" },
    footerGroup: "shop",
    showInNavigation: true,
  },
  {
    id: "our-story",
    href: "/our-story",
    label: { en: "Our Story", he: "הסיפור שלנו" },
    footerGroup: "shop",
    showInNavigation: true,
  },
  {
    id: "vision",
    href: "/vision",
    label: { en: "Vision Pre-order", he: "הזמנה מוקדמת" },
    footerGroup: "shop",
    showInNavigation: true,
  },
  {
    id: "faq",
    href: "/faq",
    label: { en: "FAQ", he: "שאלות ותשובות" },
    footerGroup: "help",
    showInNavigation: true,
  },
  {
    id: "size-guide",
    href: "/size-guide",
    label: { en: "Size Guide", he: "מדריך מידות" },
    footerGroup: "help",
    showInNavigation: true,
  },
  {
    id: "terms",
    href: "/terms",
    label: { en: "Terms", he: "תקנון ותנאים" },
    footerGroup: "help",
    showInNavigation: true,
  },
] as const satisfies readonly PublicSiteRoute[];

export const primaryNavigationRoutes = publicSiteRoutes.filter(
  (route) => route.showInNavigation,
);

export const footerShopRoutes = publicSiteRoutes.filter(
  (route) => route.footerGroup === "shop",
);

export const footerHelpRoutes = publicSiteRoutes.filter(
  (route) => route.footerGroup === "help",
);
