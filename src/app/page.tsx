import { Metadata } from "next";
import { Homepage } from "@/components/home/homepage";
import { getHomeData } from "@/lib/server-data";

export const metadata: Metadata = {
  title: "Bismillah Accessories | Premium Mobile Tech & Gear",
  description: "Shop the finest selection of premium phone cases, charging solutions, and tech accessories at Bismillah Accessories. Nationwide delivery in Bangladesh.",
  openGraph: {
    title: "Bismillah Accessories | Premium Mobile Tech & Gear",
    description: "Your one-stop shop for world-class tech protection and charging.",
    type: "website",
    url: "https://bismillahaccessories.com", // Adjust to your real domain
  }
};

export default async function Home() {
  const { products, banners } = await getHomeData();
  
  return <Homepage initialProducts={products} initialBanners={banners} />;
}
