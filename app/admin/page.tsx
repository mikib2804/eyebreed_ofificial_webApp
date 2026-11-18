import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getAdminAccess } from "@/lib/admin-auth";
import { campaignProducts } from "@/lib/campaign-catalog";
import { AdminProductForm } from "@/components/admin-product-form";
import { AdminDiscountManager } from "@/components/admin-discount-manager";
import { AdminMobileNavigation } from "@/components/admin-navigation";
import { AdminMaintenanceManager } from "@/components/admin-maintenance-manager";
import {
  AdminCustomers,
  AdminPreOrderCustomers,
  AdminInventory,
  AdminMessages,
  AdminOrders,
  AdminPreOrderModeToggle,
  AdminPreOrders,
  AdminSettings,
} from "@/components/admin-operations";
import {
  adminStatus,
  adminText,
  type AdminLocale,
  type AdminTextKey,
} from "@/lib/admin-i18n";

type ProductRow = {
  id: string;
  name: string;
  status: string;
  inventory: number;
  priceUsd: unknown;
  categoryName: string;
};
type MessageRow = {
  id: string;
  fullName: string;
  email: string;
  message: string;
  createdAt: Date;
  status: string;
  replyBody?: string | null;
};
const sections = [
  ["Overview", "overview"],
  ["Products", "products"],
  ["Discounts", "discounts"],
  ["Orders", "orders"],
  ["Messages", "messages"],
  ["Customers", "customers"],
  ["Inventory", "inventory"],
  ["Maintenance", "websiteMaintenance"],
  ["Settings", "settings"],
] as const satisfies ReadonlyArray<readonly [string, AdminTextKey]>;

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ section?: string; lang?: string }>;
}) {
  const access = await getAdminAccess();
  if (access.status === "unauthenticated")
    redirect("/login?callbackUrl=/admin");
  if (access.status === "forbidden") redirect("/");
  const params = await searchParams;
  const locale: AdminLocale = params.lang === "en" ? "en" : "he";
  const t = (key: AdminTextKey) => adminText(locale, key);
  const requestedSection = params.section ?? "Overview";
  const active = sections.some(([section]) => section === requestedSection) ? requestedSection : "Overview";
  const [
    categories,
    productRecords,
    messages,
    customers,
    preorderWaitlist,
    waitlist,
    discounts,
    discountRedemptions,
    orders,
    preOrders,
    settings,
    maintenanceNotices,
    inventoryAdjustments,
  ] = await Promise.all([
    prisma.category.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.product.findMany({
      include: {
        category: { select: { name: true } },
        variants: {
          select: { id: true, size: true, color: true, inventory: true },
          orderBy: [{ size: "asc" }, { color: "asc" }],
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.contactMessage.findMany({
      select: {
        id: true,
        fullName: true,
        email: true,
        message: true,
        createdAt: true,
        status: true,
        replyBody: true,
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    prisma.user.findMany({
      where: { role: "CUSTOMER" },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        emailVerified: true,
        createdAt: true,
        _count: {
          select: {
            orders: true,
            preOrders: true,
            addresses: true,
            wishlist: true,
          },
        },
        orders: {
          select: {
            orderNumber: true,
            total: true,
            currency: true,
            status: true,
            createdAt: true,
          },
          orderBy: { createdAt: "desc" },
          take: 5,
        },
      },
      orderBy: { createdAt: "desc" },
      take: 250,
    }),
    prisma.$queryRaw<Array<{ id: string; email: string; createdAt: Date }>>`
      SELECT "id", "email", "createdAt"
      FROM "PreorderWaitlistEntry"
      ORDER BY "createdAt" DESC
      LIMIT 500
    `,
    prisma.visionWaitlistEntry.findMany({
      select: { id: true, email: true, createdAt: true },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    prisma.discount.findMany({
      include: {
        products: { select: { id: true } },
        categories: { select: { id: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.discountRedemption.findMany({
      include: {
        discount: { select: { name: true, code: true } },
        order: { select: { orderNumber: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    prisma.order.findMany({
      select: {
        id: true,
        orderNumber: true,
        customerName: true,
        customerEmail: true,
        subtotal: true,
        discountAmount: true,
        shippingAmount: true,
        taxAmount: true,
        total: true,
        currency: true,
        status: true,
        paymentStatus: true,
        shippingStatus: true,
        trackingNumber: true,
        shippingProvider: true,
        stripeCheckoutSessionId: true,
        stripePaymentIntentId: true,
        createdAt: true,
        items: {
          select: {
            id: true,
            productName: true,
            size: true,
            color: true,
            quantity: true,
            unitPrice: true,
          },
        },
        history: {
          select: { id: true, action: true, note: true, createdAt: true },
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 250,
    }),
    prisma.preOrder.findMany({
      select: {
        id: true,
        customerName: true,
        email: true,
        phone: true,
        status: true,
        createdAt: true,
        product: { select: { name: true } },
        convertedOrder: { select: { orderNumber: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    prisma.storeSettings.findUnique({ where: { id: "store" } }),
    prisma.maintenanceNotice.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.inventoryAdjustment.findMany({
      include: { product: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
  ]);
  const products: ProductRow[] = productRecords.map((product) => ({
    ...product,
    categoryName: product.category.name,
  }));
  const variantLabels = new Map(
    productRecords.flatMap((product) =>
      product.variants.map(
        (variant) =>
          [
            variant.id,
            `${variant.size}${variant.color ? ` · ${variant.color}` : ""}`,
          ] as const,
      ),
    ),
  );
  const now = new Date();
  const [
    salesByCurrency,
    totalOrders,
    pendingOrders,
    shippedOrders,
    activeDiscounts,
    unreadMessages,
  ] = await Promise.all([
    prisma.order.groupBy({
      by: ["currency"],
      where: { paymentStatus: "PAID" },
      _sum: { total: true },
    }),
    prisma.order.count(),
    prisma.order.count({
      where: { status: { notIn: ["DELIVERED", "CANCELLED", "REFUNDED"] } },
    }),
    prisma.order.count({ where: { shippingStatus: "SHIPPED" } }),
    prisma.discount.count({
      where: {
        active: true,
        AND: [
          { OR: [{ startsAt: null }, { startsAt: { lte: now } }] },
          { OR: [{ endsAt: null }, { endsAt: { gte: now } }] },
        ],
      },
    }),
    prisma.contactMessage.count({ where: { status: "NEW" } }),
  ]);
  const lowStock = products.filter((p) => p.inventory <= 5);
  const totalSales = salesByCurrency.length
    ? salesByCurrency
        .map((row) =>
          new Intl.NumberFormat("en", {
            style: "currency",
            currency: row.currency,
            maximumFractionDigits: 2,
          }).format(Number(row._sum.total ?? 0)),
        )
        .join(" · ")
    : "—";
  const cards = [
    [t("totalSales"), totalSales],
    [t("totalOrders"), String(totalOrders)],
    [t("pendingOrders"), String(pendingOrders)],
    [t("shipped"), String(shippedOrders)],
    [t("products"), String(products.length)],
    [t("lowStock"), String(lowStock.length)],
    [t("activeDiscounts"), String(activeDiscounts)],
    [t("unreadMessages"), String(unreadMessages)],
  ];
  const storedNotifications =
    settings?.notificationPreferences &&
    typeof settings.notificationPreferences === "object" &&
    !Array.isArray(settings.notificationPreferences)
      ? (settings.notificationPreferences as Record<string, unknown>)
      : {};
  const notificationPreferences = {
    newOrder: storedNotifications.newOrder !== false,
    lowStock: storedNotifications.lowStock !== false,
    contactMessage: storedNotifications.contactMessage !== false,
    preOrder: storedNotifications.preOrder !== false,
  };
  return (
    <main
      dir={locale === "he" ? "rtl" : "ltr"}
      className="min-h-screen w-full max-w-full overflow-x-hidden bg-[#f1eee8] text-[#171412]"
    >
      <AdminMobileNavigation active={active} locale={locale} managerLabel={t("manager")} storeLabel={t("store")} sections={sections.map(([id, key]) => ({ id, label: t(key) }))} />
      <div className="grid min-h-screen w-full max-w-full lg:grid-cols-[250px_minmax(0,1fr)]">
        <aside className="hidden bg-[#211b17] p-6 text-white lg:sticky lg:top-0 lg:block lg:h-screen">
          <div>
            <div>
              <p className="text-[9px] tracking-[.35em] text-white/55 sm:text-[10px]">
                EYEBREED
              </p>
              <h1 className="mt-2 font-display text-2xl sm:mt-3 sm:text-3xl">
                {t("manager")}
              </h1>
            </div>
          </div>
          <div className="mt-4 flex w-fit rounded border border-white/20 p-1 text-[10px]">
            <Link
              href={`/admin?section=${encodeURIComponent(active)}&lang=he`}
              aria-current={locale === "he" ? "page" : undefined}
              className={`rounded px-3 py-2 ${locale === "he" ? "bg-white text-black" : "text-white/65"}`}
            >
              עברית
            </Link>
            <Link
              href={`/admin?section=${encodeURIComponent(active)}&lang=en`}
              aria-current={locale === "en" ? "page" : undefined}
              className={`rounded px-3 py-2 ${locale === "en" ? "bg-white text-black" : "text-white/65"}`}
            >
              EN
            </Link>
          </div>
          <nav
            aria-label={locale === "he" ? "חלקי ניהול" : "Admin sections"}
            className="mt-8 space-y-1"
          >
            {sections.map(([section, key]) => (
              <Link
                key={section}
                href={`/admin?section=${encodeURIComponent(section)}&lang=${locale}`}
                aria-current={active === section ? "page" : undefined}
                className={`block min-h-11 whitespace-nowrap rounded px-3 py-3 text-[10px] uppercase tracking-[.12em] sm:text-xs sm:tracking-[.14em] ${active === section ? "bg-white text-black" : "text-white/60 hover:bg-white/10 hover:text-white"}`}
              >
                {t(key)}
              </Link>
            ))}
            <Link
              href="/#products"
              className="mt-5 flex whitespace-nowrap border-t border-white/10 px-3 py-4 text-xs uppercase tracking-[.14em] text-white/75 transition hover:bg-white/10 hover:text-white"
              aria-label={t("collection")}
            >
              {t("collection")}{" "}
              <span className="ms-auto" aria-hidden="true">
                ↗
              </span>
            </Link>
          </nav>
        </aside>
        <section className="w-full max-w-full min-w-0 overflow-hidden px-4 py-6 sm:px-6 sm:py-8 lg:p-10">
          <header className="mb-6 flex min-w-0 flex-col gap-3 sm:mb-10 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between sm:gap-4">
            <div className="min-w-0">
              <p className="text-[9px] uppercase tracking-[.24em] text-black/45 sm:text-[10px] sm:tracking-[.3em]">
                {t("console")}
              </p>
              <h2 className="mt-2 break-words font-display text-4xl sm:text-5xl md:text-7xl">
                {t(
                  sections.find(([section]) => section === active)?.[1] ??
                    "overview",
                )}
              </h2>
            </div>
            <p
              dir="ltr"
              className="max-w-full break-all text-[10px] text-black/50 sm:text-xs"
            >
              {access.user.email}
            </p>
          </header>
          {active === "Overview" && (
            <>
              <AdminPreOrderModeToggle enabled={settings?.globalPreOrderMode ?? false} locale={locale} />
              <div className="grid grid-cols-2 gap-2 sm:gap-3 xl:grid-cols-4">
                {cards.map(([label, value]) => (
                  <article
                    key={label}
                    className="min-w-0 border border-black/10 bg-white p-3 sm:p-5"
                  >
                    <p className="text-[8px] uppercase tracking-[.12em] text-black/45 sm:text-[10px] sm:tracking-[.18em]">
                      {label}
                    </p>
                    <p className="mt-4 break-all font-display text-xl leading-tight sm:mt-5 sm:text-4xl">
                      {value}
                    </p>
                  </article>
                ))}
              </div>
              <Panel title={t("recentInquiries")}>
                <Messages rows={messages.slice(0, 5)} locale={locale} />
              </Panel>
              <Panel title={t("inventoryAttention")}>
                <Products rows={lowStock.slice(0, 8)} locale={locale} />
              </Panel>
            </>
          )}
          {active === "Products" && (
            <>
              <div className="flex justify-end">
                <Link href={`/admin/print/products?lang=${locale}`} className="inline-flex min-h-11 items-center justify-center rounded-md border border-black bg-white px-5 text-[10px] font-semibold tracking-wider transition hover:bg-black hover:text-white">{t("printAllProducts")}</Link>
              </div>
              <AdminProductForm
              locale={locale}
              categories={categories}
              products={productRecords.map((product) => ({
                id: product.id,
                name: product.name,
                nameHe: product.nameHe,
                slug: product.slug,
                categoryId: product.categoryId,
                description: product.description,
                descriptionHe: product.descriptionHe,
                story: product.story,
                storyHe: product.storyHe,
                material: product.material,
                priceUsd: Number(product.priceUsd),
                priceIls: Number(product.priceIls),
                priceEur: Number(product.priceEur),
                status: product.status,
                featured: product.featured,
                bestSeller: product.bestSeller,
                isNew: product.isNew,
                lowStockThreshold: product.lowStockThreshold,
                inventory: product.inventory,
                images: product.images,
                previewImage:
                  campaignProducts.find((item) => item.slug === product.slug)
                    ?.displayImage ??
                  product.images[0] ??
                  "",
                videoUrl: product.videoUrl,
                variants: product.variants,
              }))}
              />
            </>
          )}
          {active === "Discounts" && (
            <AdminDiscountManager
              locale={locale}
              categories={categories}
              products={products.map(({ id, name }) => ({ id, name }))}
              discounts={discounts.map((discount) => ({
                id: discount.id,
                name: discount.name,
                code: discount.code,
                type: discount.type,
                scope: discount.scope,
                value: Number(discount.value),
                active: discount.active,
                startsAt: discount.startsAt?.toISOString() ?? null,
                endsAt: discount.endsAt?.toISOString() ?? null,
                minimumPurchase:
                  discount.minimumPurchase === null
                    ? null
                    : Number(discount.minimumPurchase),
                usageLimit: discount.usageLimit,
                perCustomerLimit: discount.perCustomerLimit,
                usageCount: discount.usageCount,
                productIds: discount.products.map((product) => product.id),
                categoryIds: discount.categories.map((category) => category.id),
              }))}
              redemptions={discountRedemptions.map((redemption) => ({
                id: redemption.id,
                discountName: redemption.discount.name,
                code: redemption.discount.code,
                orderNumber: redemption.order.orderNumber,
                email: redemption.email,
                amount: Number(redemption.amount),
                currency: redemption.currency,
                createdAt: redemption.createdAt.toISOString(),
              }))}
            />
          )}
          {active === "Inventory" && (
            <>
              <AdminInventory
                locale={locale}
                products={productRecords.map(
                  ({ id, name, inventory, variants }) => ({
                    id,
                    name,
                    inventory,
                    variants,
                  }),
                )}
                history={inventoryAdjustments.map((item) => ({
                  id: item.id,
                  productName: item.product.name,
                  variantLabel: item.variantId
                    ? (variantLabels.get(item.variantId) ??
                      (locale === "he" ? "וריאציה שנמחקה" : "deleted variant"))
                    : null,
                  delta: item.delta,
                  reason: item.reason,
                  actorId: item.actorId,
                  createdAt: item.createdAt.toISOString(),
                }))}
              />
              <Panel title={t("stockByProduct")}>
                <Products rows={products} locale={locale} />
              </Panel>
            </>
          )}
          {active === "Messages" && (
            <Panel title={t("contactInbox")}>
              <AdminMessages
                locale={locale}
                messages={messages.map((message) => ({
                  ...message,
                  status: String(message.status),
                  createdAt: message.createdAt.toISOString(),
                  replyBody: message.replyBody ?? null,
                }))}
              />
            </Panel>
          )}
          {active === "Customers" && (
            <>
              <Panel title={t("registeredCustomers")}>
                <AdminCustomers
                  locale={locale}
                  customers={customers.map((customer) => ({
                    id: customer.id,
                    name: customer.name,
                    email: customer.email,
                    phone: customer.phone,
                    emailVerified: customer.emailVerified?.toISOString() ?? null,
                    createdAt: customer.createdAt.toISOString(),
                    counts: customer._count,
                    orders: customer.orders.map((order) => ({
                      ...order,
                      total: Number(order.total),
                      createdAt: order.createdAt.toISOString(),
                    })),
                  }))}
                />
              </Panel>
              <Panel title={t("preOrderCustomers")}>
                <AdminPreOrderCustomers
                  locale={locale}
                  items={preOrders.map((item) => ({
                    id: item.id,
                    customerName: item.customerName,
                    email: item.email,
                    phone: item.phone,
                    productName: item.product.name,
                    status: item.status,
                    createdAt: item.createdAt.toISOString(),
                  }))}
                  waitlistItems={preorderWaitlist.map((item) => ({
                    id: item.id,
                    email: item.email,
                    createdAt: item.createdAt.toISOString(),
                  }))}
                />
              </Panel>
            </>
          )}
          {active === "Pre-orders" && (
            <>
              <Panel title={t("productPreOrders")}>
                <AdminPreOrders
                  locale={locale}
                  items={preOrders.map((item) => ({
                    id: item.id,
                    email: item.email,
                    productName: item.product.name,
                    status: item.status,
                    createdAt: item.createdAt.toISOString(),
                    convertedOrderNumber:
                      item.convertedOrder?.orderNumber ?? null,
                  }))}
                />
              </Panel>
              <Panel title={t("visionWaitlist")}>
                <div className="max-h-[min(68dvh,42rem)] divide-y divide-black/10 overflow-y-auto overscroll-contain pe-1 [scrollbar-gutter:stable]">
                  {waitlist.map((w) => (
                    <div
                      className="flex min-w-0 flex-col gap-1 py-4 text-sm sm:flex-row sm:justify-between sm:gap-4"
                      key={w.id}
                    >
                      <a
                        dir="ltr"
                        className="break-all underline"
                        href={`mailto:${w.email}`}
                      >
                        {w.email}
                      </a>
                      <time className="shrink-0 text-xs text-black/55 sm:text-sm">
                        {w.createdAt.toLocaleDateString(
                          locale === "he" ? "he-IL" : "en-US",
                        )}
                      </time>
                    </div>
                  ))}
                </div>
              </Panel>
            </>
          )}
          {active === "Orders" && (
            <>
              <div className="flex justify-end">
                <Link href={`/admin/print/orders?lang=${locale}`} className="inline-flex min-h-11 items-center justify-center rounded-md border border-black bg-white px-5 text-[10px] font-semibold tracking-wider transition hover:bg-black hover:text-white">{t("printAllOrders")}</Link>
              </div>
              <Panel title={t("orderFulfilment")}>
                <AdminOrders
                locale={locale}
                orders={orders.map((order) => ({
                  ...order,
                  subtotal: Number(order.subtotal),
                  discountAmount: Number(order.discountAmount),
                  shippingAmount: Number(order.shippingAmount),
                  taxAmount: Number(order.taxAmount),
                  total: Number(order.total),
                  status: order.status,
                  paymentStatus: order.paymentStatus,
                  shippingStatus: order.shippingStatus,
                  createdAt: order.createdAt.toISOString(),
                  items: order.items.map((item) => ({
                    ...item,
                    unitPrice: Number(item.unitPrice),
                  })),
                  history: order.history.map((item) => ({
                    ...item,
                    createdAt: item.createdAt.toISOString(),
                  })),
                }))}
                />
              </Panel>
            </>
          )}
          {active === "Settings" && (
            <Panel title={t("storeSettings")}>
              <AdminSettings
                locale={locale}
                settings={{
                  contactEmail: settings?.contactEmail ?? "",
                  contactPhone: settings?.contactPhone ?? "",
                  shippingInfo: settings?.shippingInfo ?? "",
                  shippingEnabled: settings?.shippingEnabled ?? false,
                  shippingPriceIls: Number(settings?.shippingPriceIls ?? 0),
                  shippingPriceUsd: Number(settings?.shippingPriceUsd ?? 0),
                  shippingPriceEur: Number(settings?.shippingPriceEur ?? 0),
                  freeShippingEnabled: settings?.freeShippingEnabled ?? false,
                  freeShippingThresholdIls: settings?.freeShippingThresholdIls === null || settings?.freeShippingThresholdIls === undefined ? null : Number(settings.freeShippingThresholdIls),
                  freeShippingThresholdUsd: settings?.freeShippingThresholdUsd === null || settings?.freeShippingThresholdUsd === undefined ? null : Number(settings.freeShippingThresholdUsd),
                  freeShippingThresholdEur: settings?.freeShippingThresholdEur === null || settings?.freeShippingThresholdEur === undefined ? null : Number(settings.freeShippingThresholdEur),
                  defaultLowStockThreshold:
                    settings?.defaultLowStockThreshold ?? 5,
                  announcement: settings?.announcement ?? "",
                  announcementActive: settings?.announcementActive ?? false,
                  globalPreOrderMode: settings?.globalPreOrderMode ?? false,
                  notificationPreferences,
                }}
              />
            </Panel>
          )}
          {active === "Maintenance" && (
            <AdminMaintenanceManager
              locale={locale}
              notices={maintenanceNotices.map((notice) => ({
                ...notice,
                startsAt: notice.startsAt.toISOString(),
                endsAt: notice.endsAt.toISOString(),
                createdAt: notice.createdAt.toISOString(),
                updatedAt: notice.updatedAt.toISOString(),
              }))}
            />
          )}
        </section>
      </div>
    </main>
  );
}
function Panel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-5 w-full max-w-full min-w-0 overflow-hidden border border-black/10 bg-white p-3 sm:mt-8 sm:p-5 md:p-7">
      <h3 className="break-words font-display text-2xl sm:text-3xl">{title}</h3>
      <div className="mt-4 min-w-0 sm:mt-5">{children}</div>
    </section>
  );
}
function Products({
  rows,
  locale,
}: {
  rows: ProductRow[];
  locale: AdminLocale;
}) {
  const t = (key: AdminTextKey) => adminText(locale, key);
  return (
    <div>
      {rows.length > 0 && (
        <>
          <div className="max-h-[min(68dvh,42rem)] space-y-2 overflow-y-auto overscroll-contain pe-1 [scrollbar-gutter:stable] sm:hidden">
            {rows.map((p) => (
              <article
                key={p.id}
                className="border border-black/10 p-3 text-xs"
              >
                <div className="flex items-start justify-between gap-3">
                  <strong className="min-w-0 break-words">{p.name}</strong>
                  <span className="shrink-0 text-[9px] uppercase tracking-wider">
                    {adminStatus(locale, p.status)}
                  </span>
                </div>
                <dl className="mt-3 grid grid-cols-3 gap-2 text-[10px]">
                  <div>
                    <dt className="text-black/45">{t("stock")}</dt>
                    <dd
                      className={`mt-1 text-sm ${p.inventory <= 5 ? "text-red-700" : ""}`}
                    >
                      {p.inventory}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-black/45">USD</dt>
                    <dd className="mt-1 text-sm">${String(p.priceUsd)}</dd>
                  </div>
                  <div className="min-w-0">
                    <dt className="text-black/45">{t("category")}</dt>
                    <dd className="mt-1 break-words text-sm">
                      {p.categoryName}
                    </dd>
                  </div>
                </dl>
              </article>
            ))}
          </div>
          <div className="hidden max-h-[min(68dvh,42rem)] overflow-auto overscroll-contain [scrollbar-gutter:stable] sm:block">
            <table className="w-full min-w-[650px] text-start text-xs">
              <thead className="sticky top-0 z-10 bg-white">
                <tr className="border-b border-black">
                  <th className="py-3">{t("product")}</th>
                  <th>{t("status")}</th>
                  <th>{t("stock")}</th>
                  <th>USD</th>
                  <th>{t("category")}</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((p) => (
                  <tr key={p.id} className="border-b border-black/10">
                    <td className="py-4 font-medium">{p.name}</td>
                    <td>{adminStatus(locale, p.status)}</td>
                    <td className={p.inventory <= 5 ? "text-red-700" : ""}>
                      {p.inventory}
                    </td>
                    <td>${String(p.priceUsd)}</td>
                    <td>{p.categoryName}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
      {!rows.length && (
        <p className="py-8 text-black/50">
          {locale === "he" ? "לא נמצאו מוצרים." : "No products found."}
        </p>
      )}
    </div>
  );
}
function Messages({
  rows,
  locale,
}: {
  rows: MessageRow[];
  locale: AdminLocale;
}) {
  return (
    <div className="divide-y divide-black/10">
      {rows.map((m) => (
        <article key={m.id} className="min-w-0 py-4 sm:py-5">
          <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-between">
            <p className="min-w-0 break-words text-sm font-medium sm:text-base">
              {m.fullName} ·{" "}
              <a
                dir="ltr"
                className="break-all underline"
                href={`mailto:${m.email}`}
              >
                {m.email}
              </a>
            </p>
            <span className="w-fit shrink-0 text-[9px] uppercase tracking-wider sm:text-[10px]">
              {adminStatus(locale, m.status)}
            </span>
          </div>
          <p className="mt-2 line-clamp-3 break-words text-sm leading-6 text-black/60">
            {m.message}
          </p>
        </article>
      ))}
      {!rows.length && (
        <p className="py-8 text-black/50">
          {locale === "he" ? "תיבת הפניות ריקה." : "Inbox is empty."}
        </p>
      )}
    </div>
  );
}
