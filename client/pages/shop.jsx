import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import Layout from "../components/Layout";
import ProtectedRoute from "../components/ProtectedRoute";
import { useCart } from "../context/CartContext";
import { api } from "../lib/api";

const CATS = ["All", "Hair", "Skin", "Tools"];

export default function Shop() {
  const { addItem, count } = useCart();
  const [products, setProducts] = useState([]);
  const [cat, setCat] = useState("All");
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    setLoading(true);
    api(`/products${cat !== "All" ? `?category=${cat}` : ""}`)
      .then((d) => setProducts(d.products))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [cat]);

  function handleAdd(id) {
    addItem(id);
    setToast("Added to cart");
    setTimeout(() => setToast(null), 1500);
  }

  return (
    <ProtectedRoute>
    <Layout cartCount={count}>
      <div className="px-5 py-8">
        <div className="text-xs font-bold uppercase tracking-widest text-purple mb-1.5">Shop the range</div>
        <h1 className="font-serif text-3xl font-semibold mb-1.5">All products</h1>
        <p className="text-gray-500 mb-6">Listed directly by our verified sellers.</p>

        <div className="flex gap-2 mb-6">
          {CATS.map((c) => (
            <button key={c} onClick={() => setCat(c)}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold border ${cat === c ? "bg-black text-white border-black" : "bg-white border-lavender-deep"}`}>
              {c}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-gray-400 py-12 text-center">Loading products…</div>
        ) : products.length === 0 ? (
          <div className="text-gray-400 py-12 text-center">No products yet — check back soon.</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((p) => (
              <div key={p._id} className="bg-white rounded-2xl overflow-hidden border border-lavender-deep hover:shadow-xl hover:-translate-y-0.5 transition-all">
                <div className="h-36 overflow-hidden bg-lavender">
                  <img src={p.imageUrl.startsWith("http") ? p.imageUrl : `${(process.env.NEXT_PUBLIC_API_URL || "").replace("/api", "")}${p.imageUrl}`}
                    alt={p.name} className="w-full h-full object-cover" />
                </div>
                <div className="p-3.5">
                  <div className="text-[11px] font-bold uppercase tracking-wide text-purple">{p.category}</div>
                  <div className="font-bold text-sm my-0.5">{p.name}</div>
                  {p.seller?.name && <div className="text-[11px] text-gray-400 mb-1.5">Sold by {p.seller.name}</div>}
                  <div className="flex items-center gap-1 text-xs text-gray-500 mb-2.5">
                    <Star size={12} fill="#7C3AED" color="#7C3AED" /> {p.rating}
                    {p.stock === 0 && <span className="text-red-500 font-bold ml-1.5">Out of stock</span>}
                    {p.stock > 0 && p.stock < 10 && <span className="text-amber-600 font-bold ml-1.5">Only {p.stock} left</span>}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-serif text-lg font-semibold">${p.price}</span>
                    <button disabled={p.stock === 0} onClick={() => handleAdd(p._id)}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold ${p.stock === 0 ? "bg-lavender-deep text-gray-400" : "bg-black text-white"}`}>
                      Add
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-black text-white px-5 py-2.5 rounded-full text-sm font-semibold shadow-xl z-50">
          {toast}
        </div>
      )}
    </Layout>
    </ProtectedRoute>
  );
}
