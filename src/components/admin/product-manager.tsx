"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import {
  CloudUpload,
  Loader2,
  PackagePlus,
  Pencil,
  RefreshCw,
  Save,
  Trash2,
} from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";

import { useAuth } from "@/components/auth/auth-provider";
import { Button } from "@/components/ui/button";
import {
  createProduct,
  deleteProduct,
  getAdminProducts,
  productCategories,
  updateProduct,
} from "@/lib/products";
import { cn } from "@/lib/utils";
import type { Product, ProductInput, ProductStatus } from "@/types/domain";

const emptyProductForm: ProductInput = {
  name: "",
  description: "",
  category: productCategories[0],
  price: 0,
  stock: 0,
  imageUrl: "",
  cloudinaryPublicId: "",
  tags: [],
  status: "draft",
};

export function ProductManager() {
  const { isAdmin, user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState<ProductInput>(emptyProductForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tagText, setTagText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const activeCount = useMemo(
    () => products.filter((product) => product.status === "active").length,
    [products],
  );

  useEffect(() => {
    if (!isAdmin) return;
    void loadProducts();
  }, [isAdmin]);

  async function loadProducts() {
    setIsLoading(true);
    setError(null);

    try {
      setProducts(await getAdminProducts());
    } catch (loadError) {
      setError(getErrorMessage(loadError));
    } finally {
      setIsLoading(false);
    }
  }

  function resetForm() {
    setForm(emptyProductForm);
    setTagText("");
    setEditingId(null);
    setMessage(null);
    setError(null);
  }

  function editProduct(product: Product) {
    setEditingId(product.id);
    setForm({
      name: product.name,
      description: product.description,
      category: product.category,
      price: product.price,
      stock: product.stock,
      imageUrl: product.imageUrl,
      cloudinaryPublicId: product.cloudinaryPublicId || "",
      tags: product.tags,
      status: product.status,
    });
    setTagText(product.tags.join(", "));
    setMessage(null);
    setError(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    setMessage(null);

    const productInput = normalizeProductInput(form, tagText);

    try {
      if (editingId) {
        await updateProduct(editingId, productInput);
        setMessage("Product updated.");
      } else {
        await createProduct(productInput);
        setMessage("Product created.");
      }

      resetForm();
      await loadProducts();
    } catch (submitError) {
      setError(getErrorMessage(submitError));
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDelete(product: Product) {
    const confirmed = window.confirm(`Delete ${product.name}? This cannot be undone.`);
    if (!confirmed) return;

    setIsLoading(true);
    setError(null);
    setMessage(null);

    try {
      await deleteProduct(product.id);
      setMessage("Product deleted.");
      await loadProducts();
    } catch (deleteError) {
      setError(getErrorMessage(deleteError));
    } finally {
      setIsLoading(false);
    }
  }

  async function handleImageUpload(file: File | null) {
    if (!file || !user) return;
    setIsUploading(true);
    setError(null);
    setMessage(null);

    try {
      const token = await user.getIdToken();
      const uploadData = new FormData();
      uploadData.append("file", file);

      const response = await fetch("/api/cloudinary/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: uploadData,
      });

      const payload = (await response.json()) as {
        imageUrl?: string;
        publicId?: string;
        error?: string;
      };

      if (!response.ok || !payload.imageUrl) {
        throw new Error(payload.error || "Cloudinary upload failed.");
      }

      setForm((current) => ({
        ...current,
        imageUrl: payload.imageUrl || "",
        cloudinaryPublicId: payload.publicId || "",
      }));
      setMessage("Image uploaded.");
    } catch (uploadError) {
      setError(getErrorMessage(uploadError));
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
      <motion.form
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSubmit}
        className="rounded-[2rem] border border-neutral-200 bg-white p-5 shadow-sm"
      >
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-[#f6f4ee] px-3 py-1 text-sm font-semibold text-neutral-700">
              <PackagePlus className="size-4 text-[#2f9e74]" />
              {editingId ? "Edit product" : "Create product"}
            </div>
            <h2 className="mt-4 text-2xl font-semibold text-neutral-950">
              Product details
            </h2>
          </div>
          <Button type="button" variant="secondary" onClick={resetForm}>
            New
          </Button>
        </div>

        <div className="mt-5 grid gap-4">
          <TextField
            label="Name"
            value={form.name}
            onChange={(value) => setFormField("name", value, setForm)}
            placeholder="MagSafe Clear Case"
            required
          />
          <TextAreaField
            label="Description"
            value={form.description}
            onChange={(value) => setFormField("description", value, setForm)}
            placeholder="Short product description for the storefront."
            required
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <SelectField
              label="Category"
              value={form.category}
              onChange={(value) => setFormField("category", value, setForm)}
              options={productCategories}
            />
            <SelectField
              label="Status"
              value={form.status}
              onChange={(value) =>
                setFormField("status", value as ProductStatus, setForm)
              }
              options={["draft", "active", "archived"]}
            />
            <NumberField
              label="Price"
              value={form.price}
              onChange={(value) => setFormField("price", value, setForm)}
            />
            <NumberField
              label="Stock"
              value={form.stock}
              onChange={(value) => setFormField("stock", value, setForm)}
            />
          </div>

          <TextField
            label="Tags"
            value={tagText}
            onChange={setTagText}
            placeholder="case, magsafe, iphone"
          />

          <div className="rounded-[1.5rem] border border-neutral-200 bg-[#fafaf8] p-4">
            <label className="grid gap-2 text-sm font-semibold text-neutral-700">
              Cloudinary image
              <input
                type="file"
                accept="image/*"
                onChange={(event) =>
                  void handleImageUpload(event.target.files?.[0] || null)
                }
                className="block w-full rounded-2xl border border-neutral-200 bg-white p-3 text-sm text-neutral-600"
              />
            </label>
            <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button
                type="button"
                variant="secondary"
                disabled={isUploading}
                className="pointer-events-none"
              >
                {isUploading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <CloudUpload className="size-4" />
                )}
                {isUploading ? "Uploading" : "Upload ready"}
              </Button>
              <TextField
                label="Image URL"
                value={form.imageUrl}
                onChange={(value) => setFormField("imageUrl", value, setForm)}
                placeholder="https://res.cloudinary.com/..."
              />
            </div>
          </div>
        </div>

        {message ? (
          <p className="mt-4 rounded-2xl bg-[#2f9e74]/10 px-4 py-3 text-sm font-semibold text-[#257a5a]">
            {message}
          </p>
        ) : null}
        {error ? (
          <p className="mt-4 rounded-2xl bg-[#d65f5f]/10 px-4 py-3 text-sm font-semibold text-[#8f3434]">
            {error}
          </p>
        ) : null}

        <Button type="submit" className="mt-5 w-full" disabled={isLoading}>
          {isLoading ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
          {editingId ? "Save changes" : "Create product"}
        </Button>
      </motion.form>

      <section className="rounded-[2rem] border border-neutral-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-2xl font-semibold text-neutral-950">
              Products
            </h2>
            <p className="mt-1 text-sm text-neutral-600">
              {products.length} total, {activeCount} published
            </p>
          </div>
          <Button
            type="button"
            variant="secondary"
            onClick={() => void loadProducts()}
            disabled={isLoading}
          >
            <RefreshCw className={cn("size-4", isLoading && "animate-spin")} />
            Refresh
          </Button>
        </div>

        <div className="mt-5 grid gap-3">
          {products.length > 0 ? (
            products.map((product) => (
              <article
                key={product.id}
                className="grid gap-4 rounded-[1.5rem] border border-neutral-200 p-3 sm:grid-cols-[5rem_1fr_auto] sm:items-center"
              >
                <div className="relative aspect-square overflow-hidden rounded-2xl bg-[#f6f4ee]">
                  {product.imageUrl ? (
                    <Image
                      src={product.imageUrl}
                      alt={product.name}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  ) : null}
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-neutral-950">
                      {product.name}
                    </h3>
                    <span className="rounded-full bg-[#f6f4ee] px-2 py-1 text-xs font-semibold text-neutral-600">
                      {product.status}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-neutral-600">
                    {product.category} · ৳{product.price.toLocaleString("en-BD")} · Stock {product.stock}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    className="size-10 px-0"
                    onClick={() => editProduct(product)}
                  >
                    <Pencil className="size-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    className="size-10 px-0 text-[#8f3434]"
                    onClick={() => void handleDelete(product)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </article>
            ))
          ) : (
            <div className="rounded-[1.5rem] border border-dashed border-neutral-300 bg-[#fafaf8] p-8 text-center">
              <p className="text-sm font-semibold text-neutral-600">
                No products yet. Create the first item to populate the catalog.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function normalizeProductInput(form: ProductInput, tagText: string): ProductInput {
  return {
    ...form,
    name: form.name.trim(),
    description: form.description.trim(),
    category: form.category.trim(),
    imageUrl: form.imageUrl.trim(),
    cloudinaryPublicId: form.cloudinaryPublicId?.trim() || "",
    tags: tagText
      .split(",")
      .map((tag) => tag.trim().toLowerCase())
      .filter(Boolean),
    price: Number(form.price) || 0,
    stock: Number(form.stock) || 0,
  };
}

function setFormField<K extends keyof ProductInput>(
  key: K,
  value: ProductInput[K],
  setForm: React.Dispatch<React.SetStateAction<ProductInput>>,
) {
  setForm((current) => ({ ...current, [key]: value }));
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Something went wrong.";
}

function TextField({
  label,
  value,
  onChange,
  placeholder,
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  required?: boolean;
}) {
  return (
    <label className="grid flex-1 gap-2 text-sm font-semibold text-neutral-700">
      {label}
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        required={required}
        className="min-h-12 rounded-2xl border border-neutral-200 bg-white px-4 text-sm font-medium text-neutral-950 outline-none transition focus:border-neutral-950"
      />
    </label>
  );
}

function TextAreaField({
  label,
  value,
  onChange,
  placeholder,
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  required?: boolean;
}) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-neutral-700">
      {label}
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        required={required}
        rows={4}
        className="rounded-2xl border border-neutral-200 bg-white p-4 text-sm font-medium text-neutral-950 outline-none transition focus:border-neutral-950"
      />
    </label>
  );
}

function NumberField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-neutral-700">
      {label}
      <input
        type="number"
        min="0"
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="min-h-12 rounded-2xl border border-neutral-200 bg-white px-4 text-sm font-medium text-neutral-950 outline-none transition focus:border-neutral-950"
      />
    </label>
  );
}

function SelectField<T extends string>({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: T) => void;
  options: readonly T[];
}) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-neutral-700">
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as T)}
        className="min-h-12 rounded-2xl border border-neutral-200 bg-white px-4 text-sm font-medium text-neutral-950 outline-none transition focus:border-neutral-950"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}
