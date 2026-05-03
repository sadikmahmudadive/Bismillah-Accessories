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
  Plus,
  X,
} from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";

import { useAuth } from "@/components/auth/auth-provider";
import { Button } from "@/components/ui/button";
import { productCategories, createProductSlug } from "@/lib/products";

// Simplified admin operations using client-side Firestore
import { collection, addDoc, doc, getDoc, updateDoc, deleteDoc, getDocs, serverTimestamp } from "firebase/firestore";
import { getFirestore } from "firebase/firestore";
import { getFirebaseClientApp } from "@/lib/firebase/client";
import { cn } from "@/lib/utils";
import type { Product, ProductInput, ProductStatus } from "@/types/domain";

const emptyProductForm: ProductInput = {
  name: "",
  description: "",
  category: productCategories[0],
  price: 0,
  stock: 0,
  imageUrl: "",
  gallery: [],
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

  // Variant form state
  const [vName, setVName] = useState("");
  const [vPrice, setVPrice] = useState<number | "">("");
  const [vStock, setVStock] = useState<number>(0);

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
      if (!user) throw new Error("Please sign in to access admin panel");

      console.log("Loading all products for admin...");
      const db = getFirestore(getFirebaseClientApp());
      const productsRef = collection(db, "products");

      const snapshot = await getDocs(productsRef);
      const products = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Product[];

      console.log("Successfully loaded", products.length, "products");
      setProducts(products);
    } catch (loadError) {
      console.error("Load products error:", loadError);
      setError(`Failed to load products: ${loadError instanceof Error ? loadError.message : 'Unknown error'}`);
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
      gallery: product.gallery || [],
      cloudinaryPublicId: product.cloudinaryPublicId || "",
      tags: product.tags,
      status: product.status,
    });
    setTagText(product.tags.join(", "));
    setMessage(null);
    setError(null);
  }

  function addVariant() {
    if (!vName.trim()) return;
    const newVariant = {
      id: Math.random().toString(36).substr(2, 9),
      name: vName.trim(),
      price: vPrice === "" ? undefined : Number(vPrice),
      stock: Number(vStock),
    };
    setForm(prev => ({
      ...prev,
      variants: [...(prev.variants || []), newVariant]
    }));
    setVName("");
    setVPrice("");
    setVStock(0);
  }

  function removeVariant(id: string) {
    setForm(prev => ({
      ...prev,
      variants: (prev.variants || []).filter(v => v.id !== id)
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    setMessage(null);

    if (!user) {
      setError("Not authenticated");
      setIsLoading(false);
      return;
    }

    const productInput = normalizeProductInput(form, tagText);

    try {
      console.log("Submitting product form via API...", { editingId, productInput });
      const token = await user.getIdToken();
      const slug = createProductSlug(productInput.name);
      
      const payloadBody = {
        ...productInput,
        slug,
      };

      let response: Response;

      if (editingId) {
        console.log("Updating product", editingId);
        response = await fetch(`/api/products/${editingId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payloadBody),
        });
      } else {
        console.log("Creating new product");
        response = await fetch("/api/products", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payloadBody),
        });
      }

      const payload = await response.json();

      if (!response.ok || !payload.success) {
        throw new Error(payload.error || "Failed to save product.");
      }

      console.log("Product saved successfully via API");
      setMessage(editingId ? "Product updated." : "Product created.");

      resetForm();
      await loadProducts();
    } catch (submitError) {
      console.error("Submit error:", submitError);
      setError(getErrorMessage(submitError));
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDelete(product: Product) {
    if (!product.id) {
      console.error("❌ Cannot delete product: Missing ID", product);
      setError("Cannot delete product: Missing ID");
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete "${product.name}"? This action cannot be undone.`
    );
    if (!confirmed) return;

    setIsLoading(true);
    setError(null);
    setMessage(null);

    try {
      console.log("🗑️ Attempting to delete product via API:", product.id, product.name);
      
      if (!user) {
        throw new Error("You must be signed in to perform this action.");
      }

      const token = await user.getIdToken();
      const response = await fetch(`/api/products/${product.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const payload = await response.json();
      
      if (!response.ok || !payload.success) {
        throw new Error(payload.error || "Failed to delete product.");
      }
      
      console.log("✅ Product deleted successfully via API:", product.id);
      setMessage(`"${product.name}" has been deleted.`);
      
      // Refresh the list
      await loadProducts();
    } catch (err: any) {
      console.error("❌ Delete error:", err);
      
      let friendlyError = "Failed to delete product.";
      if (err?.code === "permission-denied") {
        friendlyError = "Permission denied. You don't have rights to delete products.";
      } else if (err?.message) {
        friendlyError = err.message;
      }
      
      setError(friendlyError);
    } finally {
      setIsLoading(false);
    }
  }

  async function healProductData() {
    if (!isAdmin || !user) return;
    const confirmed = window.confirm("This will generate missing slugs for all products. Proceed?");
    if (!confirmed) return;

    setIsLoading(true);
    setError(null);
    setMessage(null);

    try {
      const db = getFirestore(getFirebaseClientApp());
      const productsRef = collection(db, "products");
      const snapshot = await getDocs(productsRef);
      
      let fixedCount = 0;
      for (const docSnap of snapshot.docs) {
        const data = docSnap.data();
        if (!data.slug) {
          const newSlug = createProductSlug(data.name || "unnamed-product");
          await updateDoc(doc(db, "products", docSnap.id), {
            slug: newSlug,
            updatedAt: serverTimestamp()
          });
          fixedCount++;
        }
      }
      
      setMessage(`Healed ${fixedCount} products.`);
      await loadProducts();
    } catch (err) {
      console.error("Heal error:", err);
      setError("Failed to heal data.");
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

  async function handleGalleryUpload(files: FileList | null) {
    if (!files || files.length === 0 || !user) return;
    setIsUploading(true);
    setError(null);
    setMessage(null);

    try {
      const token = await user.getIdToken();
      const newUrls: string[] = [];

      for (let i = 0; i < files.length; i++) {
        const uploadData = new FormData();
        uploadData.append("file", files[i]);

        const response = await fetch("/api/cloudinary/upload", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: uploadData,
        });
        const payload = await response.json();
        if (response.ok && payload.imageUrl) {
          newUrls.push(payload.imageUrl);
        }
      }

      setForm((current) => ({
        ...current,
        gallery: [...(current.gallery || []), ...newUrls],
      }));
      setMessage(`${newUrls.length} gallery images uploaded.`);
    } catch (uploadError) {
      setError(getErrorMessage(uploadError));
    } finally {
      setIsUploading(false);
    }
  }

  function removeGalleryImage(index: number) {
    setForm((current) => {
      const newGallery = [...(current.gallery || [])];
      newGallery.splice(index, 1);
      return { ...current, gallery: newGallery };
    });
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

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-[1.5rem] border border-neutral-200 bg-[#fafaf8] p-4">
              <label className="grid gap-2 text-sm font-semibold text-neutral-700">
                Main Image
                <input
                  type="file"
                  accept="image/*"
                  onChange={(event) =>
                    void handleImageUpload(event.target.files?.[0] || null)
                  }
                  className="block w-full rounded-2xl border border-neutral-200 bg-white p-3 text-sm text-neutral-600"
                />
              </label>
              <div className="mt-3 flex flex-col gap-3">
                <TextField
                  label="Image URL"
                  value={form.imageUrl}
                  onChange={(value) => setFormField("imageUrl", value, setForm)}
                  placeholder="https://res.cloudinary.com/..."
                />
                {form.imageUrl && (
                  <div className="relative h-20 w-20 overflow-hidden rounded-xl border border-neutral-200">
                    <Image src={form.imageUrl} alt="Main" fill sizes="80px" className="object-cover" />
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-[1.5rem] border border-neutral-200 bg-[#fafaf8] p-4">
              <label className="grid gap-2 text-sm font-semibold text-neutral-700">
                Gallery Images
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(event) =>
                    void handleGalleryUpload(event.target.files)
                  }
                  className="block w-full rounded-2xl border border-neutral-200 bg-white p-3 text-sm text-neutral-600"
                />
              </label>
              <div className="mt-3">
                {form.gallery && form.gallery.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {form.gallery.map((url, i) => (
                      <div key={i} className="group relative h-16 w-16 overflow-hidden rounded-xl border border-neutral-200">
                        <Image src={url} alt={`Gallery ${i}`} fill sizes="64px" className="object-cover" />
                        <button
                          type="button"
                          onClick={() => removeGalleryImage(i)}
                          className="absolute inset-0 bg-black/40 opacity-0 flex items-center justify-center text-white transition group-hover:opacity-100"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-neutral-500">No gallery images</p>
                )}
              </div>
            </div>
          </div>

          {/* Variants Management */}
          <div className="rounded-[1.5rem] border border-neutral-200 bg-[#fafaf8] p-4">
            <h3 className="text-sm font-semibold text-neutral-700">Product Variants</h3>
            <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_auto_auto_auto] sm:items-end">
              <TextField
                label="Variant Name"
                value={vName}
                onChange={setVName}
                placeholder="iPhone 15 Pro"
              />
              <NumberField
                label="Price Override (Optional)"
                value={vPrice === "" ? 0 : vPrice}
                onChange={(val) => setVPrice(val || "")}
              />
              <NumberField
                label="Stock"
                value={vStock}
                onChange={setVStock}
              />
              <Button type="button" onClick={addVariant} className="h-12 w-12 rounded-2xl p-0">
                <Plus className="size-5" />
              </Button>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {form.variants && form.variants.length > 0 ? (
                form.variants.map((v) => (
                  <div key={v.id} className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs font-semibold shadow-sm">
                    <span className="text-neutral-900">{v.name}</span>
                    <span className="text-neutral-500">
                      {v.price ? `৳${v.price}` : "Base Price"} · Qty: {v.stock}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeVariant(v.id)}
                      className="text-neutral-400 hover:text-red-500"
                    >
                      <X className="size-3.5" />
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-xs text-neutral-500">No variants added.</p>
              )}
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
          <div className="flex gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => void loadProducts()}
              disabled={isLoading}
            >
              <RefreshCw className={cn("size-4", isLoading && "animate-spin")} />
              Refresh
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => void healProductData()}
              disabled={isLoading}
              className="text-amber-600 hover:bg-amber-50"
              title="Fix missing slugs for all products"
            >
              <RefreshCw className={cn("size-4", isLoading && "animate-spin")} />
              Heal Data
            </Button>
          </div>
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
                    {product.stock < 5 && (
                      <span className={cn(
                        "ml-2 rounded-md px-1.5 py-0.5 text-[10px] font-black uppercase tracking-tighter",
                        product.stock === 0 ? "bg-red-100 text-red-600" : "bg-amber-100 text-amber-600"
                      )}>
                        {product.stock === 0 ? "Sold Out" : "Low Stock"}
                      </span>
                    )}
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
                    onClick={() => handleDelete(product)}
                    disabled={isLoading}
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
    gallery: form.gallery || [],
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
