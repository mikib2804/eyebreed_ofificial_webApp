"use client";

import Image from "next/image";
import { ChevronDown, Plus } from "lucide-react";
import { FormEvent, useState } from "react";
import { adminStatus, adminText, type AdminLocale } from "@/lib/admin-i18n";
import { useSubmitGuard } from "@/lib/use-submit-guard";

type Product = {
  id: string;
  name: string;
  nameHe: string | null;
  slug: string;
  categoryId: string;
  description: string;
  descriptionHe: string | null;
  story: string | null;
  storyHe: string | null;
  material: string | null;
  priceUsd: number;
  priceIls: number;
  priceEur: number;
  status: "DRAFT" | "ACTIVE" | "ARCHIVED";
  featured: boolean;
  bestSeller: boolean;
  isNew: boolean;
  lowStockThreshold: number;
  images: string[];
  previewImage: string;
  videoUrl: string | null;
  variants: Array<{ size: string; color: string; inventory: number }>;
};
type Category = { id: string; name: string };

function lines(value: FormDataEntryValue | null) {
  return String(value ?? "")
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean);
}
function variants(value: FormDataEntryValue | null) {
  return lines(value).map((line) => {
    const [size, color = "", inventory = "0"] = line
      .split("|")
      .map((item) => item.trim());
    return { size, color, inventory: Number(inventory) };
  });
}

export function AdminProductForm({
  categories,
  products,
  locale,
}: {
  categories: Category[];
  products: Product[];
  locale: AdminLocale;
}) {
  const [message, setMessage] = useState("");
  const { blocked, run } = useSubmitGuard();
  async function submit(event: FormEvent<HTMLFormElement>, productId?: string) {
    event.preventDefault();
    const formElement = event.currentTarget;
    await run(async () => {
      setMessage(adminText(locale, "saving"));
      const form = new FormData(formElement);
      const payload = {
        name: form.get("name"),
        nameHe: form.get("nameHe"),
        slug: form.get("slug"),
        categoryId: form.get("categoryId"),
        description: form.get("description"),
        descriptionHe: form.get("descriptionHe"),
        story: form.get("story"),
        storyHe: form.get("storyHe"),
        material: form.get("material"),
        priceUsd: form.get("priceUsd"),
        priceIls: form.get("priceIls"),
        priceEur: form.get("priceEur"),
        status: form.get("status"),
        featured: form.get("featured") === "on",
        bestSeller: form.get("bestSeller") === "on",
        isNew: form.get("isNew") === "on",
        lowStockThreshold: form.get("lowStockThreshold"),
        images: lines(form.get("images")),
        videoUrl: String(form.get("videoUrl") ?? "").trim(),
        variants: variants(form.get("variants")),
      };
      const response = await fetch(
        productId ? `/api/admin/products/${productId}` : "/api/admin/products",
        {
          method: productId ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      const result = (await response.json().catch(() => ({}))) as {
        error?: string;
      };
      setMessage(
        response.ok
          ? adminText(locale, "productSaved")
          : (result.error ?? adminText(locale, "productSaveFailed")),
      );
      if (response.ok) window.location.reload();
    });
  }
  const empty: Product = {
    id: "",
    name: "",
    nameHe: "",
    slug: "",
    categoryId: categories[0]?.id ?? "",
    description: "",
    descriptionHe: "",
    story: "",
    storyHe: "",
    material: "",
    priceUsd: 0,
    priceIls: 0,
    priceEur: 0,
    status: "DRAFT",
    featured: false,
    bestSeller: false,
    isNew: false,
    lowStockThreshold: 5,
    images: [],
    previewImage: "",
    videoUrl: "",
    variants: ["XS", "S", "M", "L", "XL"].map((size) => ({
      size,
      color: "",
      inventory: 0,
    })),
  };
  return (
    <div className="space-y-4">
      <p role="status" className="min-h-5 text-sm">
        {message}
      </p>
      <ProductEditor
        product={empty}
        categories={categories}
        locale={locale}
        title={adminText(locale, "createProduct")}
        onSubmit={(event) => submit(event)}
        submitDisabled={blocked}
      />
      <div className="max-h-[min(68dvh,42rem)] space-y-4 overflow-y-auto overscroll-contain pe-1 [scrollbar-gutter:stable]">
        {products.map((product) => (
          <ProductEditor
            key={product.id}
            product={product}
            categories={categories}
            locale={locale}
            title={product.name}
            onSubmit={(event) => submit(event, product.id)}
            submitDisabled={blocked}
          />
        ))}
      </div>
    </div>
  );
}

function ProductEditor({
  product,
  categories,
  locale,
  title,
  onSubmit,
  submitDisabled,
  open = false,
}: {
  product: Product;
  categories: Category[];
  locale: AdminLocale;
  title: string;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  submitDisabled: boolean;
  open?: boolean;
}) {
  const [expanded, setExpanded] = useState(open);
  return (
    <section
      className={`min-w-0 overflow-hidden border bg-white transition-[border-color,box-shadow] duration-300 ${expanded ? "border-black/35 shadow-[0_16px_45px_rgba(23,20,18,.08)]" : "border-black/15"}`}
    >
      <button
        type="button"
        onClick={() => setExpanded((value) => !value)}
        aria-expanded={expanded}
        className="group flex min-h-16 w-full cursor-pointer items-center gap-3 px-3 py-2 text-start font-medium transition-colors hover:bg-[#f7f4f0] sm:min-h-20 sm:px-5 sm:py-3"
      >
        {product.id && product.previewImage ? (
          <span className="relative h-14 w-12 shrink-0 overflow-hidden rounded-md border border-black/10 bg-white sm:h-16 sm:w-14">
            <Image
              src={product.previewImage}
              alt=""
              fill
              sizes="56px"
              className="object-contain"
            />
          </span>
        ) : (
          <span
            className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-[#171412] text-white shadow-[0_8px_24px_rgba(23,20,18,.24)] transition duration-300 group-hover:scale-105 `}
            aria-hidden="true"
          >
            <Plus size={22} strokeWidth={1.7} />
          </span>
        )}
        <span className="min-w-0 flex-1">
          <span className="block break-words text-sm sm:text-base">
            {title}
          </span>
          <span className="mt-1 block text-[10px] font-normal tracking-wider text-black/50">
            {product.id
              ? adminStatus(locale, product.status)
              : adminText(locale, "createProductHint")}
          </span>
        </span>
        <ChevronDown
          size={19}
          strokeWidth={1.5}
          aria-hidden="true"
          className={`shrink-0 transition-transform duration-300 ${expanded ? "rotate-180" : ""}`}
        />
      </button>
      <div
        className={`grid transition-[grid-template-rows,opacity] duration-500 ease-out motion-reduce:transition-none ${expanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
        aria-hidden={!expanded}
        inert={!expanded}
      >
        <div className="min-h-0 overflow-hidden">
          <form
            onSubmit={onSubmit}
            className="grid min-w-0 gap-4 border-t border-black/10 p-3 sm:p-5 md:grid-cols-2"
          >
            <Field label={adminText(locale, "name")}>
              <input name="name" defaultValue={product.name} required />
            </Field>
            <Field label={adminText(locale, "hebrewName")}>
              <input
                name="nameHe"
                dir="rtl"
                defaultValue={product.nameHe ?? ""}
              />
            </Field>
            <Field label={adminText(locale, "slug")}>
              <input
                name="slug"
                defaultValue={product.slug}
                pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
                required
              />
            </Field>
            <Field label={adminText(locale, "category")}>
              <select name="categoryId" defaultValue={product.categoryId}>
                {categories.map((category) => (
                  <option value={category.id} key={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label={adminText(locale, "priceUsd")}>
              <input
                name="priceUsd"
                type="number"
                min="0"
                step=".01"
                defaultValue={product.priceUsd}
                required
              />
            </Field>
            <Field label={adminText(locale, "priceIls")}>
              <input
                name="priceIls"
                type="number"
                min="0"
                step=".01"
                defaultValue={product.priceIls}
                required
              />
            </Field>
            <Field label={adminText(locale, "priceEur")}>
              <input
                name="priceEur"
                type="number"
                min="0"
                step=".01"
                defaultValue={product.priceEur}
                required
              />
            </Field>
            <Field label={adminText(locale, "status")}>
              <select name="status" defaultValue={product.status}>
                {["DRAFT", "ACTIVE", "ARCHIVED"].map((status) => (
                  <option key={status} value={status}>
                    {adminStatus(locale, status)}
                  </option>
                ))}
              </select>
            </Field>
            <Field label={adminText(locale, "englishDescription")} wide>
              <textarea
                className="resize-none"
                name="description"
                minLength={10}
                rows={4}
                defaultValue={product.description}
                required
              />
            </Field>
            <Field label={adminText(locale, "hebrewDescription")} wide>
              <textarea
                className="resize-none"
                name="descriptionHe"
                dir="rtl"
                rows={4}
                defaultValue={product.descriptionHe ?? ""}
              />
            </Field>
            <Field label={adminText(locale, "englishStory")}>
              <textarea
                className="resize-none"
                name="story"
                rows={3}
                defaultValue={product.story ?? ""}
              />
            </Field>
            <Field label={adminText(locale, "hebrewStory")}>
              <textarea
                name="storyHe"
                dir="rtl"
                rows={3}
                className="resize-none"
                defaultValue={product.storyHe ?? ""}
              />
            </Field>
            <Field label={adminText(locale, "material")}>
              <input name="material" defaultValue={product.material ?? ""} />
            </Field>
            <Field label={adminText(locale, "lowStockThreshold")}>
              <input
                name="lowStockThreshold"
                type="number"
                min="0"
                defaultValue={product.lowStockThreshold}
              />
            </Field>
            <Field label={adminText(locale, "imagesHelp")} wide>
              <textarea
                name="images"
                className="resize-none"
                rows={4}
                defaultValue={product.images.join("\n")}
                required
              />
            </Field>
            <Field label={adminText(locale, "videoUrl")}>
              <input name="videoUrl" defaultValue={product.videoUrl ?? ""} />
            </Field>
            <Field label={adminText(locale, "variantsHelp")} wide>
              <textarea
                className="resize-none"
                name="variants"
                rows={6}
                defaultValue={product.variants
                  .map(
                    (variant) =>
                      `${variant.size} | ${variant.color} | ${variant.inventory}`,
                  )
                  .join("\n")}
                required
              />
            </Field>
            <div className="grid gap-2 sm:flex sm:flex-wrap sm:gap-5 md:col-span-2">
              <Check
                name="featured"
                label={adminText(locale, "featured")}
                value={product.featured}
              />
              <Check
                name="bestSeller"
                label={adminText(locale, "bestSeller")}
                value={product.bestSeller}
              />
              <Check
                name="isNew"
                label={adminText(locale, "new")}
                value={product.isNew}
              />
            </div>
            <button
              disabled={submitDisabled}
              className="min-h-11 w-full bg-black px-6 py-3 text-xs tracking-wider text-white disabled:cursor-wait disabled:opacity-50 sm:w-auto"
            >
              {product.id
                ? adminText(locale, "saveProduct")
                : adminText(locale, "createProduct")}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
function Field({
  label,
  children,
  wide = false,
}: {
  label: string;
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <label className={`admin-field ${wide ? "md:col-span-2" : ""}`}>
      {label}
      {children}
    </label>
  );
}
function Check({
  name,
  label,
  value,
}: {
  name: string;
  label: string;
  value: boolean;
}) {
  return (
    <label className="flex min-h-11 items-center gap-2">
      <input name={name} type="checkbox" defaultChecked={value} /> {label}
    </label>
  );
}
