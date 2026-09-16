import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { ShoppingBag, Menu, X, ChevronDown, LogOut, Sparkles, Check } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import RoleBadge from "./RoleBadge";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
  { href: "/quiz", label: "Beauty Quiz" },
  { href: "/orders", label: "Orders" },
];

export default function Navbar({ cartCount = 0 }) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const items = [...NAV];
  if (user && (user.role === "admin" || user.role === "superadmin")) {
    items.push({ href: "/dashboard", label: "Dashboard" });
  }

  return (
    <header className="sticky top-0 z-40 bg-black border-b border-black-soft">
      <div className="max-w-[1180px] mx-auto px-5 py-3.5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <button className="md:hidden text-white" onClick={() => setMobileOpen((v) => !v)} aria-label="Toggle menu">
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8.5 h-8.5 w-[34px] h-[34px] rounded-[10px] bg-gradient-to-br from-purple to-purple-deep flex items-center justify-center">
              <Sparkles size={17} color="#fff" />
            </div>
            <span className="font-serif text-xl font-semibold text-white">GlowBase</span>
          </Link>
        </div>

        <nav className="hidden md:flex gap-1 flex-1 justify-center">
          {items.map((n) => (
            <Link key={n.href} href={n.href}
              className={`px-4 py-2 rounded-full text-sm font-semibold text-white transition ${router.pathname === n.href ? "bg-purple" : "hover:bg-black-soft"}`}>
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2.5">
          <Link href="/cart" className="relative bg-black-soft rounded-full w-9 h-9 flex items-center justify-center">
            <ShoppingBag size={17} color="#fff" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-purple text-white text-[10px] font-bold rounded-full min-w-[17px] h-[17px] flex items-center justify-center px-1">
                {cartCount}
              </span>
            )}
          </Link>

          {user ? (
            <div className="relative">
              <button onClick={() => setOpen((v) => !v)} className="flex items-center gap-2 bg-black-soft rounded-full pl-1 pr-2 py-1">
                <div className="w-7 h-7 rounded-full bg-purple flex items-center justify-center text-xs font-bold text-white">
                  {user.name.split(" ").map((s) => s[0]).join("")}
                </div>
                <ChevronDown size={15} color="#fff" className={`transition-transform ${open ? "rotate-180" : ""}`} />
              </button>
              {open && (
                <div className="absolute right-0 top-11 w-[280px] bg-white rounded-2xl shadow-2xl border border-lavender-deep p-4 z-50">
                  <div className="flex items-center gap-2.5 mb-3">
                    <div className="w-11 h-11 rounded-full bg-purple flex items-center justify-center text-sm font-bold text-white">
                      {user.name.split(" ").map((s) => s[0]).join("")}
                    </div>
                    <div>
                      <div className="font-bold text-sm">{user.name}</div>
                      <div className="text-xs text-gray-500">{user.email}</div>
                    </div>
                  </div>
                  <RoleBadge role={user.role} size="md" />
                  <div className="border-t border-lavender-deep my-3" />
                  <button onClick={logout} className="flex items-center gap-2 w-full px-2.5 py-2 rounded-lg text-sm font-semibold text-gray-500 hover:bg-lavender">
                    <LogOut size={15} /> Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link href="/login" className="px-4 py-2 rounded-full bg-purple text-white text-sm font-semibold">
              Log in
            </Link>
          )}
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden flex flex-col px-5 pb-4 gap-1">
          {items.map((n) => (
            <Link key={n.href} href={n.href} onClick={() => setMobileOpen(false)}
              className={`px-3 py-2.5 rounded-lg text-sm font-semibold text-white ${router.pathname === n.href ? "bg-purple" : ""}`}>
              {n.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
