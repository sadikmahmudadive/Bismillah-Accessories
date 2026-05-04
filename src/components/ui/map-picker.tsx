"use client";

import { useEffect, useState, useMemo } from "react";
import { Crosshair, MapPin, Loader2, Navigation, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

// Leaflet icons need special handling in Next.js
import L from "leaflet";

// Dynamically import Leaflet components to avoid SSR issues
import { 
  MapContainer, 
  TileLayer, 
  Marker, 
  useMap, 
  useMapEvents 
} from "react-leaflet";

type MapPickerProps = {
  onAddressSelect: (address: string) => void;
  className?: string;
};

// Component to handle map centering
function ChangeView({ center }: { center: [number, number] }) {
  const map = (useMap as any)();
  useEffect(() => {
    if (center) map.setView(center, 16);
  }, [center, map]);
  return null;
}

// Component to handle click events
function LocationMarker({ position, setPosition }: { position: [number, number], setPosition: (p: [number, number]) => void }) {
  (useMapEvents as any)({
    click(e: any) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });
  
  const icon = useMemo(() => L.divIcon({
    className: "custom-div-icon",
    html: `<div class="grid size-10 place-items-center rounded-full bg-neutral-950 text-white shadow-2xl ring-4 ring-white"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-map-pin"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg></div>`,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
  }), []);

  return position ? <Marker position={position} icon={icon} /> : null;
}

export function MapPicker({ onAddressSelect, className }: MapPickerProps) {
  const [position, setPosition] = useState<[number, number]>([23.8103, 90.4125]); // Dhaka default
  const [address, setAddress] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Reverse geocoding
  useEffect(() => {
    const fetchAddress = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${position[0]}&lon=${position[1]}`);
        const data = await res.json();
        const fullAddress = data.display_name || "";
        setAddress(fullAddress);
        onAddressSelect(fullAddress);
      } catch (err) {
        console.error("Geocoding error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    if (mounted) fetchAddress();
  }, [position, mounted]);

  const handleGps = () => {
    if (!navigator.geolocation) return;
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPosition([pos.coords.latitude, pos.coords.longitude]);
        setIsLocating(false);
      },
      (err) => {
        console.error(err);
        setIsLocating(false);
        alert("Could not get your location. Please check your browser permissions.");
      }
    );
  };

  if (!mounted) return null;

  return (
    <div className={cn("relative overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-xl", className)}>
      <div className="h-[300px] w-full">
        <MapContainer 
          center={position} 
          zoom={13} 
          scrollWheelZoom={true} 
          className="h-full w-full z-0"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker position={position} setPosition={setPosition} />
          <ChangeView center={position} />
        </MapContainer>
      </div>

      <div className="absolute right-4 top-4 z-[400] flex flex-col gap-2">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleGps}
          disabled={isLocating}
          className="grid size-12 place-items-center rounded-2xl bg-white text-neutral-900 shadow-xl ring-1 ring-neutral-200 transition-colors hover:bg-neutral-50 disabled:opacity-50"
          title="Use my location"
        >
          {isLocating ? <Loader2 className="size-5 animate-spin text-[#2f9e74]" /> : <Navigation className="size-5" />}
        </motion.button>
      </div>

      <div className="p-4 bg-white/80 backdrop-blur-md">
        <div className="flex items-start gap-3">
          <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#f6f4ee] text-neutral-950">
            {isLoading ? <Loader2 className="size-5 animate-spin" /> : <MapPin className="size-5" />}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Selected Location</p>
            <p className="mt-1 line-clamp-2 text-xs font-bold leading-relaxed text-neutral-950">
              {isLoading ? "Fetching address..." : address || "Select a point on the map"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
