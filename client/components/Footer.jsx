import Link from "next/link";
import { Sparkles, Instagram, Facebook, Twitter, MapPin, Phone, Mail } from "lucide-react";

const COLS = [
  { title: "Shop", items: [{ label: "All products", href: "/shop" }, { label: "Hair care", href: "/shop" }, { label: "Skin care", href: "/shop" }, { label: "Tools", href: "/shop" }] },
  { title: "Company", items: [{ label: "About us", href: "/" }, { label: "Sellers program", href: "/sell" }, { label: "Careers", href: "/" }, { label: "Contact", href: "/" }] },
];

export default function Footer() {
  return (
    <footer className="bg-black text-white mt-16">
      <div className="max-w-[1180px] mx-auto px-5 pt-12 pb-6 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple to-purple-deep flex items-center justify-center">
              <Sparkles size={14} color="#fff" />
            </div>
            <span className="font-serif text-lg font-semibold">GlowBase</span>
          </div>
          <p className="text-sm text-gray-400 max-w-[260px] leading-relaxed">
            Salon-grade hair, skin & tool essentials — curated from independent sellers and delivered to your door.
          </p>
          <div className="flex gap-2.5 mt-3.5">
            {[Instagram, Facebook, Twitter].map((Icon, i) => (
              <div key={i} className="w-8 h-8 rounded-full bg-black-soft flex items-center justify-center">
                <Icon size={14} />
              </div>
            ))}
          </div>
        </div>
        {COLS.map((col) => (
          <div key={col.title}>
            <div className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">{col.title}</div>
            <div className="flex flex-col gap-2">
              {col.items.map((it) => (
                <Link key={it.label} href={it.href} className="text-sm text-gray-300 hover:text-white">{it.label}</Link>
              ))}
            </div>
          </div>
        ))}
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Get in touch</div>
          <div className="flex flex-col gap-2 text-sm text-gray-300">
            <span className="flex items-center gap-2"><MapPin size={13} /> 42 Lotus Road, Colombo</span>
            <span className="flex items-center gap-2"><Phone size={13} /> +94 11 234 5678</span>
            <span className="flex items-center gap-2"><Mail size={13} /> hello@glowbase.lk</span>
          </div>
        </div>
      </div>
      <div className="border-t border-black-soft text-center py-4 text-xs text-gray-500">
        © 2026 GlowBase Retail. All rights reserved.
      </div>
    </footer>
  );
}
