import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import ProtectedRoute from "../components/ProtectedRoute";
import { useCart } from "../context/CartContext";
import { api } from "../lib/api";

const STATUS_STYLE = {
  Processing: "bg-amber-100 text-amber-700",
  Shipped: "bg-purple-soft/40 text-purple-deep",
  Delivered: "bg-green-100 text-green-700",
  Cancelled: "bg-red-100 text-red-600",
};

export default function Orders() {
  const { count } = useCart();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api("/orders/mine").then((d) => setOrders(d.orders)).finally(() => setLoading(false));
  }, []);

  return (
    <ProtectedRoute>
      <Layout cartCount={count}>
        <div className="max-w-[640px] mx-auto px-5 py-8">
          <div className="text-xs font-bold uppercase tracking-widest text-purple mb-1.5">Track & review</div>
          <h1 className="font-serif text-3xl font-semibold mb-5">My orders</h1>

          {loading ? (
            <div className="text-gray-400 text-center py-10">Loading…</div>
          ) : orders.length === 0 ? (
            <div className="text-gray-400 text-center py-10">No orders yet.</div>
          ) : (
            <div className="flex flex-col gap-2.5">
              {orders.map((o) => (
                <div key={o._id} className="bg-white border border-lavender-deep rounded-2xl p-3.5">
                  <div className="flex justify-between mb-1">
                    <span className="font-bold text-sm">#{o._id.slice(-6).toUpperCase()}</span>
                    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${STATUS_STYLE[o.status]}`}>{o.status}</span>
                  </div>
                  <div className="text-sm text-gray-500 mb-1">{o.items.map((i) => i.name).join(", ")}</div>
                  <div className="text-xs text-gray-400">{new Date(o.createdAt).toLocaleDateString()} · ${o.total}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
