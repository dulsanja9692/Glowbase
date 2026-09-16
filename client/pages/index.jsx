import Link from "next/link";
import { useEffect, useState } from "react";
import { Sparkles, ArrowRight, Scissors, Droplet, Wand2 } from "lucide-react";
import Layout from "../components/Layout";
import ProtectedRoute from "../components/ProtectedRoute";
import { useCart } from "../context/CartContext";
import { api } from "../lib/api";

const CATS = [
  { name: "Hair", icon: Scissors },
  { name: "Skin", icon: Droplet },
  { name: "Tools", icon: Wand2 },
];

export default function Home() {
  const { count } = useCart();
  const [products, setProducts] = useState([]);

  useEffect(() => {
    api("/products").then((d) => setProducts(d.products)).catch(() => setProducts([]));
  }, []);

  return (
    <ProtectedRoute>
    <Layout cartCount={count}>
      {/* Hero — bleeds full viewport width regardless of the page's
          max-width container, so the purple background reaches both
          edges of the screen instead of sitting boxed in the middle. */}
      <section className="relative left-1/2 -translate-x-1/2 w-screen bg-gradient-to-br from-black via-purple-deep to-purple text-white overflow-hidden">
        {/* Watermark pattern — echoes the site's side-rail motif (circles,
            dotted path, small dots) but in light tones so it reads against
            the dark gradient instead of disappearing into it. */}
        <div className="hidden md:block absolute inset-y-0 left-0 w-[260px] opacity-[0.14] pointer-events-none" aria-hidden="true">
          <svg width="260" height="100%" viewBox="0 0 260 700" preserveAspectRatio="xMidYMid slice" className="absolute inset-0">
            <circle cx="30" cy="70" r="90" fill="#fff" />
            <circle cx="60" cy="320" r="4" fill="#fff" />
            <circle cx="90" cy="360" r="7" fill="#fff" />
            <path d="M 20 420 Q 100 480 30 560" stroke="#fff" strokeWidth="2" fill="none" strokeDasharray="4 10" />
            <circle cx="140" cy="610" r="50" fill="#fff" opacity="0.6" />
          </svg>
        </div>
        <div className="hidden md:block absolute inset-y-0 right-0 w-[260px] opacity-[0.14] pointer-events-none" aria-hidden="true">
          <svg width="260" height="100%" viewBox="0 0 260 700" preserveAspectRatio="xMidYMid slice" className="absolute inset-0">
            <circle cx="230" cy="90" r="90" fill="#fff" />
            <circle cx="200" cy="340" r="4" fill="#fff" />
            <circle cx="170" cy="380" r="7" fill="#fff" />
            <path d="M 240 430 Q 160 490 230 570" stroke="#fff" strokeWidth="2" fill="none" strokeDasharray="4 10" />
            <circle cx="120" cy="620" r="50" fill="#fff" opacity="0.6" />
          </svg>
        </div>

        <div className="max-w-[1180px] mx-auto px-5 pt-24 pb-28 relative text-center">
          <div className="inline-flex items-center gap-1.5 bg-white/10 px-3.5 py-1.5 rounded-full text-xs font-bold mb-5 tracking-wide">
            <Sparkles size={13} /> SRI LANKA&apos;S SALON MARKETPLACE
          </div>
          <h1 className="font-serif text-4xl md:text-6xl font-semibold leading-tight mb-4">
            Salon-grade beauty,<br />delivered to your door.
          </h1>
          <p className="text-base text-purple-soft max-w-xl mx-auto mb-8 leading-relaxed">
            GlowBase connects independent hair &amp; skin sellers with customers who want the real thing —
            no more guessing at the drugstore.
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link href="/shop" className="px-6 py-3.5 rounded-full bg-white text-black font-bold text-sm flex items-center gap-2">
              Shop now <ArrowRight size={15} />
            </Link>
            <Link href="/quiz" className="px-6 py-3.5 rounded-full border border-white/40 text-white font-bold text-sm">
              Take the beauty quiz
            </Link>
          </div>
          <div className="flex gap-10 justify-center mt-14 flex-wrap">
            {[["120+", "Independent sellers"], ["8,400+", "Products delivered"], ["4.8★", "Average rating"]].map(([n, l]) => (
              <div key={l}>
                <div className="font-serif text-2xl font-semibold">{n}</div>
                <div className="text-xs text-gray-300">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About */}
      <section className="max-w-[1180px] mx-auto px-5 py-16 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <div className="text-xs font-bold uppercase tracking-widest text-purple mb-1.5">Who we are</div>
          <h2 className="font-serif text-3xl font-semibold mb-3.5">A marketplace built for real salon products</h2>
          <p className="text-gray-500 leading-relaxed mb-4">
            GlowBase Retail launched in 2023 to close the gap between professional salons and home routines.
            Every seller on our platform is a verified stylist, salon, or beauty brand — meaning what you buy
            is exactly what your stylist would recommend.
          </p>
          <div className="grid grid-cols-2 gap-3.5">
            {[["Verified sellers", "Every admin account is approved by our team"], ["Fast delivery", "Island-wide shipping in 2–4 days"], ["Real reviews", "Only verified buyers can rate a product"], ["Fair pricing", "No markup beyond the seller's own price"]].map(([t, d]) => (
              <div key={t} className="bg-white border border-lavender-deep rounded-2xl p-3.5">
                <div className="font-bold text-sm mb-1">{t}</div>
                <div className="text-xs text-gray-500">{d}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-3xl overflow-hidden shadow-2xl">
          <img src="https://images.unsplash.com/photo-1560066984-138dadb4c035?w=700&q=70" alt="Salon products" className="w-full h-[380px] object-cover" />
        </div>
      </section>

      {/* Categories */}
      <section className="bg-lavender-deep py-16 px-5">
        <div className="max-w-[1180px] mx-auto">
          <div className="text-xs font-bold uppercase tracking-widest text-purple mb-1.5">Explore</div>
          <h2 className="font-serif text-2xl font-semibold mb-6">Shop by category</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {CATS.map(({ name, icon: Icon }) => (
              <Link key={name} href="/shop" className="bg-white rounded-3xl p-7 text-left hover:shadow-xl transition-shadow hover:-translate-y-0.5">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-purple to-purple-deep flex items-center justify-center mb-3.5">
                  <Icon size={20} color="#fff" />
                </div>
                <div className="font-bold text-base mb-1">{name} care</div>
                <div className="text-xs text-gray-500">{products.filter((p) => p.category === name).length} products available</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-[1180px] mx-auto px-5 py-16">
        <div className="bg-gradient-to-r from-purple-deep to-black rounded-[28px] p-10 md:p-12 text-white flex items-center justify-between flex-wrap gap-6">
          <div>
            <h3 className="font-serif text-2xl font-semibold mb-1.5">Not sure where to start?</h3>
            <p className="text-gray-300 text-sm">Take our 2-minute beauty quiz for a routine matched to you.</p>
          </div>
          <Link href="/quiz" className="px-6 py-3.5 rounded-full bg-white text-black font-bold text-sm whitespace-nowrap">
            Start the quiz
          </Link>
        </div>
      </section>
    </Layout>
    </ProtectedRoute>
  );
}
