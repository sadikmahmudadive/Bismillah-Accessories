import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { FaFacebookF, FaInstagram } from "react-icons/fa6";

const footerLinks = [
  { href: "/products", label: "Products" },
  { href: "/checkout", label: "Checkout" },
  { href: "/admin", label: "Admin dashboard" },
  { href: "/auth", label: "Account" },
];

export function Footer() {
  return (
    <footer className="border-t border-neutral-200/60 bg-white/60 backdrop-blur-xl">
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.1fr_0.9fr_0.9fr] lg:px-8">
        <div>
          <Link href="/" className="flex items-center gap-3 font-semibold">
            <span className="grid size-10 place-items-center rounded-full bg-neutral-950 text-sm font-bold text-white">
              BA
            </span>
            Bismillah Accessories
          </Link>
          <p className="mt-4 max-w-sm text-sm leading-6 text-neutral-600">
            Premium mobile accessories, everyday tech essentials, and gift-ready
            add-ons designed for fast shopping and reliable delivery.
          </p>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-neutral-950">Explore</h2>
          <div className="mt-4 grid gap-3">
            {footerLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-sm text-neutral-600 transition hover:text-neutral-950"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-neutral-950">Contact</h2>
          <div className="mt-4 grid gap-3 text-sm text-neutral-600">
            <span className="flex items-center gap-2">
              <MapPin className="size-4 text-[#2f9e74]" />
              Dhaka, Bangladesh
            </span>
            <span className="flex items-center gap-2">
              <Phone className="size-4 text-[#d65f5f]" />
              Customer support ready
            </span>
            <span className="flex items-center gap-2">
              <Mail className="size-4 text-[#b8860b]" />
              hello@bismillahaccessories.com
            </span>
          </div>
          <div className="mt-5 flex gap-2">
            <SocialLink label="Instagram" href="https://instagram.com">
              <FaInstagram className="size-4" />
            </SocialLink>
            <SocialLink label="Facebook" href="https://facebook.com">
              <FaFacebookF className="size-4" />
            </SocialLink>
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
