"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  User, 
  ShoppingBag, 
  MapPin, 
  LogOut, 
  ChevronRight, 
  Clock, 
  Package, 
  CheckCircle2, 
  Truck, 
  XCircle,
  Phone,
  Save,
  Loader2,
  Navigation,
  CloudUpload,
  Camera
} from "lucide-react";
import dynamic from "next/dynamic";
const MapPicker = dynamic(() => import("@/components/ui/map-picker").then((mod) => mod.MapPicker), { 
  ssr: false,
  loading: () => <div className="h-[300px] w-full animate-pulse rounded-3xl bg-neutral-100 flex items-center justify-center text-neutral-400 text-xs font-bold">Loading Map...</div>
});
import { useAuth } from "@/components/auth/auth-provider";
import { AuthGate } from "@/components/auth/auth-gate";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { Order } from "@/types/domain";

type ProfileTab = "general" | "orders" | "addresses";

export function ProfileShell() {
  const { user, profile, isAdmin, signOut, refreshProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<ProfileTab>("general");
  const [orders, setOrders] = useState<Order[]>([]);
  const [isOrdersLoading, setIsOrdersLoading] = useState(false);

  // Form state
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [form, setForm] = useState({
    displayName: "",
    phone: "",
    address: "",
    photoUrl: ""
  });
  const [isUploading, setIsUploading] = useState(false);

  // Location states
  const [showMap, setShowMap] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  useEffect(() => {
    if (profile) {
      setForm({
        displayName: profile.displayName || "",
        phone: profile.phone || "",
        address: profile.addresses?.[0] || "",
        photoUrl: profile.photoUrl || ""
      });
    }
  }, [profile]);

  useEffect(() => {
    if (activeTab === "orders" && user) {
      loadUserOrders();
    }
  }, [activeTab, user]);

  async function loadUserOrders() {
    setIsOrdersLoading(true);
    try {
      const token = await user?.getIdToken();
      const res = await fetch("/api/orders/user", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const payload = await res.json();
      if (res.ok) setOrders(payload.data || []);
    } catch (err) {
      console.error("Failed to load orders", err);
    } finally {
      setIsOrdersLoading(false);
    }
  }

  async function handleUpdateProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      const token = await user.getIdToken();
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          displayName: form.displayName,
          phone: form.phone,
          addresses: form.address ? [form.address] : [],
          photoUrl: form.photoUrl
        })
      });
      if (res.ok) {
        await refreshProfile();
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (err) {
      console.error("Update error", err);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleImageUpload(file: File | null) {
    if (!file || !user) return;
    setIsUploading(true);
    try {
      const token = await user.getIdToken();
      const uploadData = new FormData();
      uploadData.append("file", file);

      const response = await fetch("/api/cloudinary/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: uploadData,
      });

      const payload = await response.json();
      if (response.ok && payload.imageUrl) {
        setForm(prev => ({ ...prev, photoUrl: payload.imageUrl }));
        // Auto-save the new photo URL immediately for better UX
        await fetch("/api/profile", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ photoUrl: payload.imageUrl })
        });
        await refreshProfile();
      } else {
        alert(payload.error || "Upload failed");
      }
    } catch (err) {
      console.error("Upload error", err);
      alert("Something went wrong during upload");
    } finally {
      setIsUploading(false);
    }
  }

  const handleGps = async () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${pos.coords.latitude}&lon=${pos.coords.longitude}`);
          const data = await res.json();
          const addr = data.display_name || "";
          setForm(prev => ({ ...prev, address: addr }));
        } catch (err) {
          console.error("Geocoding failed", err);
          alert("Could not determine your address. Please enter it manually.");
        } finally {
          setIsLocating(false);
        }
      },
      (err) => {
        console.error(err);
        setIsLocating(false);
        alert("Permission denied or location unavailable.");
      }
    );
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <AuthGate>
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid gap-8 lg:grid-cols-[280px_1fr]"
        >
          {/* Sidebar */}
          <aside className="space-y-6">
            <div className="rounded-[2.5rem] border border-neutral-200 bg-white p-8 shadow-sm">
              <div className="flex flex-col items-center text-center">
                <div className="relative group">
                  <div className="grid size-24 place-items-center rounded-full bg-gradient-to-br from-neutral-900 to-neutral-700 text-3xl font-black text-white shadow-xl shadow-neutral-950/20 overflow-hidden border-4 border-white">
                    {form.photoUrl ? (
                      <img src={form.photoUrl} alt="Profile" className="h-full w-full object-cover" />
                    ) : (
                      profile?.displayName?.[0] || user?.email?.[0] || "?"
                    )}
                  </div>
                  <label className="absolute bottom-0 right-0 grid size-8 place-items-center rounded-full bg-white text-neutral-950 shadow-lg cursor-pointer hover:scale-110 transition active:scale-95 border border-neutral-100">
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={(e) => handleImageUpload(e.target.files?.[0] || null)}
                    />
                    {isUploading ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Camera className="size-4" />
                    )}
                  </label>
                </div>
                <h1 className="mt-5 text-xl font-bold text-neutral-950 truncate w-full">
                  {profile?.displayName || "Guest User"}
                </h1>
                <p className="mt-1 text-sm font-medium text-neutral-500 truncate w-full">
                  {user?.email}
                </p>
                <div className={cn(
                  "mt-4 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest",
                  isAdmin ? "bg-[#2f9e74]/10 text-[#2f9e74]" : "bg-[#f6f4ee] text-neutral-600"
                )}>
                  {isAdmin ? "Admin" : (profile?.role || "customer")} Account
                </div>
              </div>

              <nav className="mt-10 space-y-1">
                <TabButton 
                  active={activeTab === "general"} 
                  onClick={() => setActiveTab("general")}
                  icon={User}
                  label="General Info"
                />
                <TabButton 
                  active={activeTab === "orders"} 
                  onClick={() => setActiveTab("orders")}
                  icon={ShoppingBag}
                  label="Order History"
                />
                <TabButton 
                  active={activeTab === "addresses"} 
                  onClick={() => setActiveTab("addresses")}
                  icon={MapPin}
                  label="Addresses"
                />
                <div className="my-4 h-px bg-neutral-100" />
                <button 
                  onClick={() => void signOut()}
                  className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold text-[#d65f5f] transition hover:bg-[#d65f5f]/5"
                >
                  <LogOut className="size-4" />
                  Sign Out
                </button>
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <main className="min-w-0">
            <AnimatePresence mode="wait">
              {activeTab === "general" && (
                <motion.section
                  key="general"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="rounded-[2.5rem] border border-neutral-200 bg-white p-8 shadow-sm"
                >
                  <h2 className="text-2xl font-bold text-neutral-950">Account Settings</h2>
                  <p className="mt-2 text-sm text-neutral-500">Update your profile information and contact details.</p>

                  <form onSubmit={handleUpdateProfile} className="mt-10 grid gap-6 max-w-xl">
                    <div className="grid gap-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-neutral-400">Display Name</label>
                      <input 
                        value={form.displayName}
                        onChange={e => setForm({...form, displayName: e.target.value})}
                        className="h-12 rounded-2xl border border-neutral-200 bg-neutral-50 px-5 text-sm font-bold outline-none focus:border-neutral-950 focus:bg-white transition"
                      />
                    </div>
                    <div className="grid gap-2 text-neutral-400">
                      <label className="text-xs font-bold uppercase tracking-widest text-neutral-400">Email Address (Read-only)</label>
                      <div className="flex h-12 items-center rounded-2xl border border-neutral-200 bg-neutral-100 px-5 text-sm font-bold">
                        {user?.email}
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-neutral-400">Phone Number</label>
                      <input 
                        value={form.phone}
                        onChange={e => setForm({...form, phone: e.target.value})}
                        placeholder="01XXXXXXXXX"
                        className="h-12 rounded-2xl border border-neutral-200 bg-neutral-50 px-5 text-sm font-bold outline-none focus:border-neutral-950 focus:bg-white transition"
                      />
                    </div>

                    <div className="flex items-center gap-4 pt-4">
                      <Button disabled={isSaving} className="h-12 px-8">
                        {isSaving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                        {isSaving ? "Saving..." : "Save Changes"}
                      </Button>
                      {saveSuccess && (
                        <motion.span 
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="flex items-center gap-2 text-sm font-bold text-[#2f9e74]"
                        >
                          <CheckCircle2 className="size-4" /> Changes saved!
                        </motion.span>
                      )}
                    </div>
                  </form>
                </motion.section>
              )}

              {activeTab === "orders" && (
                <motion.section
                  key="orders"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="space-y-6"
                >
                  <div className="rounded-[2.5rem] border border-neutral-200 bg-white p-8 shadow-sm">
                    <h2 className="text-2xl font-bold text-neutral-950">Purchase History</h2>
                    <p className="mt-2 text-sm text-neutral-500">Review your past orders and track current shipments.</p>
                  </div>

                  <div className="grid gap-4">
                    {isOrdersLoading ? (
                      [1, 2].map(i => <div key={i} className="h-32 w-full animate-pulse rounded-[2rem] bg-neutral-100" />)
                    ) : orders.length === 0 ? (
                      <div className="rounded-[2.5rem] border border-dashed border-neutral-300 bg-white p-20 text-center">
                        <ShoppingBag className="mx-auto size-12 text-neutral-200" />
                        <h3 className="mt-6 text-lg font-bold text-neutral-950">No orders yet</h3>
                        <p className="mt-2 text-sm text-neutral-500">Start shopping to see your history here.</p>
                      </div>
                    ) : (
                      orders.map(order => (
                        <OrderRow key={order.id} order={order} />
                      ))
                    )}
                  </div>
                </motion.section>
              )}

              {activeTab === "addresses" && (
                <motion.section
                  key="addresses"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="rounded-[2.5rem] border border-neutral-200 bg-white p-8 shadow-sm"
                >
                  <h2 className="text-2xl font-bold text-neutral-950">Saved Addresses</h2>
                  <p className="mt-2 text-sm text-neutral-500">Manage your delivery locations for faster checkout.</p>

                  <div className="mt-10 grid gap-6 max-w-xl">
                    <div className="grid gap-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold uppercase tracking-widest text-neutral-400">Default Shipping Address</label>
                        <button
                          type="button"
                          onClick={() => setShowMap(!showMap)}
                          className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.1em] text-[#2f9e74] hover:underline"
                        >
                          <MapPin className="size-3" />
                          {showMap ? "Hide Map" : "Open Map Picker"}
                        </button>
                      </div>

                      <AnimatePresence>
                        {showMap && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden"
                          >
                            <MapPicker 
                              onAddressSelect={(addr) => setForm({...form, address: addr})}
                              className="mb-4"
                            />
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <div className="relative group">
                        <textarea 
                          rows={4}
                          value={form.address}
                          onChange={e => setForm({...form, address: e.target.value})}
                          placeholder="Enter your primary delivery address..."
                          className="w-full rounded-2xl border border-neutral-200 bg-neutral-50 p-5 pr-12 text-sm font-bold outline-none focus:border-neutral-950 focus:bg-white transition"
                        />
                        <button
                          type="button"
                          title="Use my current location"
                          onClick={handleGps}
                          disabled={isLocating}
                          className="absolute right-4 top-4 text-neutral-400 hover:text-[#2f9e74] disabled:opacity-50 transition-colors"
                        >
                          {isLocating ? <Loader2 className="size-4 animate-spin" /> : <Navigation className="size-4" />}
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <Button onClick={handleUpdateProfile} disabled={isSaving} className="h-12 px-8 w-fit">
                        {isSaving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                        {isSaving ? "Saving..." : "Update Address"}
                      </Button>
                      {saveSuccess && (
                        <motion.span 
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="flex items-center gap-2 text-sm font-bold text-[#2f9e74]"
                        >
                          <CheckCircle2 className="size-4" /> Address updated!
                        </motion.span>
                      )}
                    </div>
                  </div>
                </motion.section>
              )}
            </AnimatePresence>
          </main>
        </motion.div>
      </div>
    </AuthGate>
  );
}

function TabButton({ active, onClick, icon: Icon, label }: any) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition-all",
        active 
          ? "bg-neutral-950 text-white shadow-lg shadow-neutral-950/15" 
          : "text-neutral-500 hover:bg-neutral-100 hover:text-neutral-950"
      )}
    >
      <Icon className="size-4" />
      {label}
      <ChevronRight className={cn("ml-auto size-3.5 opacity-0 transition-opacity", active && "opacity-100")} />
    </button>
  );
}

function OrderRow({ order }: { order: Order }) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const statusConfig = {
    pending: { color: "bg-amber-100 text-amber-700", icon: Clock, label: "Pending" },
    confirmed: { color: "bg-blue-100 text-blue-700", icon: CheckCircle2, label: "Confirmed" },
    processing: { color: "bg-indigo-100 text-indigo-700", icon: Package, label: "Processing" },
    shipped: { color: "bg-purple-100 text-purple-700", icon: Truck, label: "Shipped" },
    delivered: { color: "bg-emerald-100 text-emerald-700", icon: CheckCircle2, label: "Delivered" },
    cancelled: { color: "bg-red-100 text-red-700", icon: XCircle, label: "Cancelled" },
  };

  const config = statusConfig[order.status as keyof typeof statusConfig] || statusConfig.pending;

  return (
    <article className={cn(
      "group overflow-hidden rounded-[2rem] border transition-all duration-300",
      isExpanded ? "border-neutral-300 bg-neutral-50/30 shadow-lg" : "border-neutral-200 bg-white hover:border-neutral-300"
    )}>
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex cursor-pointer flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="flex items-center gap-4">
          <div className={cn(
            "grid size-12 place-items-center rounded-2xl transition-colors duration-300",
            isExpanded ? "bg-neutral-950 text-white" : "bg-neutral-100 text-neutral-950 group-hover:bg-neutral-950 group-hover:text-white"
          )}>
            <Package className="size-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-neutral-950">Order #{order.id.slice(-6).toUpperCase()}</h4>
            <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-wide mt-0.5">
              {new Date(order.createdAt as any).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between sm:gap-10">
          <div className="text-right">
            <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Total</p>
            <p className="mt-1 text-sm font-black text-neutral-950">৳{order.total.toLocaleString()}</p>
          </div>
          
          <div className={cn(
            "flex items-center gap-2 rounded-full px-4 py-1.5 text-[10px] font-black uppercase tracking-widest",
            config.color
          )}>
            <config.icon className="size-3" />
            {config.label}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-neutral-100 bg-white"
          >
            <div className="grid gap-8 p-8 md:grid-cols-2">
              {/* Items Detail */}
              <div className="space-y-4">
                <h5 className="text-[10px] font-black uppercase tracking-widest text-neutral-400 flex items-center gap-2">
                  <ShoppingBag className="size-3" /> Order Items
                </h5>
                <div className="space-y-2">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between rounded-2xl bg-neutral-50 p-4 text-sm font-medium">
                      <div className="flex items-center gap-3">
                        <span className="grid size-6 place-items-center rounded-full bg-neutral-200 text-[10px] font-bold">
                          {item.quantity}
                        </span>
                        <span>{item.name}</span>
                        {item.variantName && (
                          <span className="text-[10px] font-bold text-neutral-400 uppercase">
                            ({item.variantName})
                          </span>
                        )}
                      </div>
                      <span className="font-bold text-neutral-900">৳{(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                  
                  <div className="mt-4 space-y-1.5 border-t border-neutral-100 pt-4 text-sm">
                    <div className="flex justify-between text-neutral-500">
                      <span>Subtotal</span>
                      <span>৳{(order.subtotal || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-neutral-500">
                      <span>Delivery Fee</span>
                      <span>৳{(order.deliveryFee || 0).toLocaleString()}</span>
                    </div>
                    {order.discountAmount && order.discountAmount > 0 && (
                      <div className="flex justify-between text-emerald-600 font-bold">
                        <span>Discount ({order.promoCode})</span>
                        <span>-৳{order.discountAmount.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between pt-2 text-base font-black text-neutral-950">
                      <span>Grand Total</span>
                      <span>৳{order.total.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Delivery & Payment Info */}
              <div className="space-y-6">
                <div className="space-y-4">
                  <h5 className="text-[10px] font-black uppercase tracking-widest text-neutral-400 flex items-center gap-2">
                    <MapPin className="size-3" /> Delivery Details
                  </h5>
                  <div className="space-y-3 rounded-2xl border border-neutral-100 p-5 text-sm">
                    <div className="flex items-center gap-3 font-bold text-neutral-900">
                      <User className="size-4 text-neutral-400" />
                      {order.customerName}
                    </div>
                    <div className="flex items-center gap-3 font-medium text-neutral-600">
                      <Phone className="size-4 text-neutral-400" />
                      {order.phone}
                    </div>
                    <div className="flex items-start gap-3 leading-relaxed text-neutral-600">
                      <MapPin className="size-4 shrink-0 mt-1 text-neutral-400" />
                      {order.address}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h5 className="text-[10px] font-black uppercase tracking-widest text-neutral-400 flex items-center gap-2">
                    <Truck className="size-3" /> Payment Method
                  </h5>
                  <div className="flex items-center gap-3 rounded-2xl bg-neutral-50 p-4 text-sm font-bold text-neutral-950">
                    <div className="grid size-8 place-items-center rounded-lg bg-white shadow-sm">
                      <ShoppingBag className="size-4 text-[#2f9e74]" />
                    </div>
                    {order.paymentMethod === "bkash_mock" ? (
                      <div className="flex items-center gap-2">
                        <span className="text-[#e2136e]">bKash</span>
                        {order.bkashTransactionId && (
                          <span className="rounded bg-neutral-200 px-1.5 py-0.5 font-mono text-[10px] uppercase">
                            {order.bkashTransactionId}
                          </span>
                        )}
                      </div>
                    ) : (
                      "Cash on Delivery"
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </article>
  );
}
