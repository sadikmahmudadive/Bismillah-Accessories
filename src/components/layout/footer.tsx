import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { FaFacebookF, FaInstagram } from "react-icons/fa6";

const footerLinks = [
  { href: "/products", label: "Products" },
  { href: "/cart", label: "Cart" },
  { href: "/checkout", label: "Checkout" },
  { href: "/auth", label: "Account" },
];

export function Footer() {
  return (
    <footer className="border-t border-black/5 bg-white py-24 text-neutral-950">
      <div className="mx-auto flex w-full flex-col gap-16 px-6 sm:px-12 lg:px-24 lg:flex-row lg:justify-between lg:gap-24">
        <div className="max-w-md">
          <Link href="/" className="group flex items-center gap-4 text-sm font-bold text-neutral-950">
            <div className="relative flex size-11 items-center justify-center rounded-2xl bg-neutral-950 text-xs font-black text-white shadow-2xl shadow-neutral-950/20">
              BA
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-lg font-[900] tracking-tighter sm:text-xl uppercase">
                BISMILLAH
              </span>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#257e5d]">
                Accessories
              </span>
            </div>
          </Link>
          <p className="mt-8 text-lg font-medium leading-relaxed text-neutral-500">
            Curating world-class tech essentials for those who demand excellence in every detail. 
            Designed for performance, crafted for style.
          </p>
          <div className="mt-10 flex gap-3">
            <SocialLink label="Instagram" href="https://instagram.com">
              <FaInstagram className="size-4" />
            </SocialLink>
            <SocialLink label="Facebook" href="https://facebook.com">
              <FaFacebookF className="size-4" />
            </SocialLink>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-12 sm:grid-cols-2 md:gap-24">
          <div>
            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-500">Navigate</h2>
            <div className="mt-8 grid gap-4">
              {footerLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-sm font-bold text-neutral-600 transition hover:text-[#2f9e74]"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-500">Connect</h2>
            <div className="mt-8 grid gap-6 text-sm font-bold text-neutral-600">
              <div className="flex items-center gap-4">
                <div className="grid size-10 place-items-center rounded-xl bg-neutral-50 text-[#2f9e74]">
                  <MapPin className="size-4" />
                </div>
                <span>Dhaka, BD</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="grid size-10 place-items-center rounded-xl bg-neutral-50 text-[#d65f5f]">
                  <Phone className="size-4" />
                </div>
                <span>Support Ready</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="grid size-10 place-items-center rounded-xl bg-neutral-50 text-[#b8860b]">
                  <Mail className="size-4" />
                </div>
                <span>hello@ba.com</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-24 w-full px-6 sm:px-12 lg:px-24">
        <div className="h-px w-full bg-neutral-100" />
        <div className="mt-12 flex flex-col items-center justify-between gap-6 sm:flex-row">
          <p className="text-[10px] font-black uppercase tracking-widest text-neutral-500">
            © {new Date().getFullYear()} Bismillah Accessories. All Rights Reserved.
          </p>
          <div className="flex gap-8">
            <Link href="/privacy" className="text-[10px] font-black uppercase tracking-widest text-neutral-500 hover:text-neutral-950">Privacy</Link>
            <Link href="/terms" className="text-[10px] font-black uppercase tracking-widest text-neutral-500 hover:text-neutral-950">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function SocialLink({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={label}
      title={label}
      className="grid size-10 place-items-center rounded-full border border-neutral-200 text-neutral-600 transition hover:-translate-y-0.5 hover:border-neutral-950 hover:text-neutral-950"
    >
      {children}
    </a>
  );
}
