import { getActiveProducts } from "@/lib/products";
import { ProductBrowser } from "@/components/product/product-browser";
import * as motion from "framer-motion/client";

export const metadata = {
  title: "Products | Bismillah Accessories",
  description: "Browse our premium mobile accessories and tech essentials.",
};

export default async function ProductsPage() {
  const products = await getActiveProducts();

  return (
    <main className="relative isolate overflow-hidden bg-white text-neutral-950">
      {/* ─── Collections Hero ────────────────────────────────────────── */}
      <section className="relative h-[60svh] min-h-[400px] w-full overflow-hidden bg-neutral-900 sm:h-[70svh]">
        {/* Background Image with Ken Burns */}
        <motion.div 
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.4 }}
          transition={{ duration: 10, ease: "linear" }}
          className="absolute inset-0"
        >
          <img 
            src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1999&auto=format&fit=crop" 
            alt="Collection"
            className="h-full w-full object-cover"
          />
        </motion.div>
        
        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-neutral-950/20 via-transparent to-white" />
        <div className="absolute inset-0 bg-gradient-to-r from-neutral-950/40 to-transparent" />

        {/* Content */}
        <div className="relative flex h-full flex-col justify-center px-6 sm:px-12 lg:px-24">
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs font-black uppercase tracking-[0.4em] text-[#2f9e74]"
          >
            The Collection
          </motion.p>
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-8 text-6xl font-[900] leading-[0.9] tracking-tighter text-white sm:text-8xl lg:text-9xl"
          >
            Precision <br /> 
            <span className="text-white/30">Crafted.</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-10 max-w-2xl text-lg font-medium text-white/60 lg:text-2xl"
          >
            Discover premium mobile accessories, everyday tech essentials, and
            gift-ready add-ons designed for quality and style.
          </motion.p>
        </div>
      </section>

      <div className="px-6 py-12 sm:px-12 lg:px-24">
        <ProductBrowser products={products} />
      </div>
    </main>
  );
}