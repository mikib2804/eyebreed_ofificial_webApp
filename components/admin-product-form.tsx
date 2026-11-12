"use client";

import { FormEvent, useState } from "react";

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
}: {
  categories: Category[];
  products: Product[];
}) {
  const [message, setMessage] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>, productId?: string) {
    event.preventDefault();
    setMessage("Saving…");
    const form = new FormData(event.currentTarget);
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
        ? "Product saved."
        : (result.error ?? "Could not save product."),
    );
    if (response.ok) window.location.reload();
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
        title="Create product"
        onSubmit={(event) => submit(event)}
        open
      />
      {products.map((product) => (
        <ProductEditor
          key={product.id}
          product={product}
          categories={categories}
          title={`${product.name} · ${product.status}`}
          onSubmit={(event) => submit(event, product.id)}
        />
      ))}
    </div>
  );
}

function ProductEditor({
  product,
  categories,
  title,
  onSubmit,
  open = false,
}: {
  product: Product;
  categories: Category[];
  title: string;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  open?: boolean;
}) {
  return (
    <details open={open} className="min-w-0 border border-black/15 bg-white">
      <summary className="cursor-pointer break-words px-3 py-4 font-medium sm:px-5">
        {title}
      </summary>
      <form
        onSubmit={onSubmit}
        className="grid min-w-0 gap-4 border-t border-black/10 p-3 sm:p-5 md:grid-cols-2"
      >
        <Field label="Name">
          <input name="name" defaultValue={product.name} required />
        </Field>
        <Field label="Hebrew name">
          <input name="nameHe" dir="rtl" defaultValue={product.nameHe ?? ""} />
        </Field>
        <Field label="Slug">
          <input
            name="slug"
            defaultValue={product.slug}
            pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
            required
          />
        </Field>
        <Field label="Category">
          <select name="categoryId" defaultValue={product.categoryId}>
            {categories.map((category) => (
              <option value={category.id} key={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="USD">
          <input
            name="priceUsd"
            type="number"
            min="0"
            step=".01"
            defaultValue={product.priceUsd}
            required
          />
        </Field>
        <Field label="ILS">
          <input
            name="priceIls"
            type="number"
            min="0"
            step=".01"
            defaultValue={product.priceIls}
            required
          />
        </Field>
        <Field label="EUR">
          <input
            name="priceEur"
            type="number"
            min="0"
            step=".01"
            defaultValue={product.priceEur}
            required
          />
        </Field>
        <Field label="Status">
          <select name="status" defaultValue={product.status}>
            <option>DRAFT</option>
            <option>ACTIVE</option>
            <option>ARCHIVED</option>
          </select>
        </Field>
        <Field label="English description" wide>
          <textarea
            className="resize-none"
            name="description"
            minLength={10}
            rows={4}
            defaultValue={product.description}
            required
          />
        </Field>
        <Field label="Hebrew description" wide>
          <textarea
            className="resize-none"
            name="descriptionHe"
            dir="rtl"
            rows={4}
            defaultValue={product.descriptionHe ?? ""}
          />
        </Field>
        <Field label="English story">
          <textarea
            className="resize-none"
            name="story"
            rows={3}
            defaultValue={product.story ?? ""}
          />
        </Field>
        <Field label="Hebrew story">
          <textarea
            name="storyHe"
            dir="rtl"
            rows={3}
            className="resize-none"
            defaultValue={product.storyHe ?? ""}
          />
        </Field>
        <Field label="Material">
          <input name="material" defaultValue={product.material ?? ""} />
        </Field>
        <Field label="Low-stock threshold">
          <input
            name="lowStockThreshold"
            type="number"
            min="0"
            defaultValue={product.lowStockThreshold}
          />
        </Field>
        <Field label="Images — one safe URL/path per line" wide>
          <textarea
            name="images"
            className="resize-none"
            rows={4}
            defaultValue={product.images.join("\n")}
            required
          />
        </Field>
        <Field label="Video URL">
          <input name="videoUrl" defaultValue={product.videoUrl ?? ""} />
        </Field>
        <Field label="Variants — size | color | inventory" wide>
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
          <Check name="featured" label="Featured" value={product.featured} />
          <Check
            name="bestSeller"
            label="Best seller"
            value={product.bestSeller}
          />
          <Check name="isNew" label="New" value={product.isNew} />
        </div>
        <button className="min-h-11 w-full bg-black px-6 py-3 text-xs tracking-wider text-white sm:w-auto">
          {product.id ? "SAVE PRODUCT" : "CREATE PRODUCT"}
        </button>
      </form>
    </details>
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
