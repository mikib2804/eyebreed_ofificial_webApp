"use client";

import { useState } from "react";

export function AdminProductForm({ categories }: { categories: { id: string; name: string }[] }) {
  const [message, setMessage] = useState("");

  async function submit(formData: FormData) {
    setMessage("Saving…");
    const response = await fetch("/api/admin/products", { method: "POST", body: formData });
    setMessage(response.ok ? "Product saved." : "Could not save product.");
    if (response.ok) window.location.reload();
  }

  return (
    <form action={submit} className="grid gap-5 border border-black/20 p-6 md:grid-cols-2">
      <label className="admin-field">Name<input name="name" required /></label>
      <label className="admin-field">Hebrew name<input name="nameHe" dir="rtl" /></label>
      <label className="admin-field">Slug<input name="slug" required /></label>
      <label className="admin-field">Category<select name="categoryId" required>{categories.map((c) => <option value={c.id} key={c.id}>{c.name}</option>)}</select></label>
      <label className="admin-field">USD price<input name="priceUsd" type="number" min="0" step=".01" required /></label>
      <label className="admin-field">ILS price<input name="priceIls" type="number" min="0" step=".01" required /></label>
      <label className="admin-field">EUR price<input name="priceEur" type="number" min="0" step=".01" required /></label>
      <label className="admin-field">Inventory<input name="inventory" type="number" min="0" required /></label>
      <label className="admin-field md:col-span-2">Image URL<input name="imageUrl" type="url" required /></label>
      <label className="admin-field md:col-span-2">Video URL<input name="videoUrl" type="url" /></label>
      <label className="admin-field md:col-span-2">Description<textarea name="description" required rows={4} /></label>
      <button className="bg-ink px-6 py-4 text-xs tracking-luxury text-white">ADD PRODUCT</button>
      <p className="self-center text-xs">{message}</p>
    </form>
  );
}
