import { useEffect, useState } from "react";
import { TrendingUp, ShoppingBag, Users, AlertTriangle } from "lucide-react";
import Layout from "../../components/Layout";
import ProtectedRoute from "../../components/ProtectedRoute";
import { useCart } from "../../context/CartContext";
import { api } from "../../lib/api";

// Superadmin-only high-level metrics. Numbers are derived client-side
// from live orders/products/users so there's no separate analytics API.
export default function Analytics() {
  const { count } = useCart();
  const [stats, setStats] = useState(null);
  const [weekly, setWeekly] = useState([]);

  useEffect(() => {
    Promise.all([api("/orders"), api("/products"), api("/users")]).then(([o, p, u]) => {
      const revenue = o.orders.filter((x) => x.payment?.status === "paid").reduce((s, x) => s + x.total, 0);
      const lowStock = p.products.filter((x) => x.stock > 0 && x.stock < 10).length;
      setStats({
        revenue, orders: o.orders.length, accounts: u.users.length, lowStock,
      });
      // simple day-of-week bucket of order counts for the bar chart
      const buckets = [0, 0, 0, 0, 0, 0, 0];
      o.orders.forEach((ord) => { buckets[new Date(ord.createdAt).getDay()] += 1; });
      const max = Math.max(...buckets, 1);
      setWeekly(buckets.map((b) => Math.round((b / max) * 100)));
    });
  }, []);

  const cards = stats ? [
    { label: "Revenue (paid orders)", value: `$${stats.revenue}`, icon: TrendingUp, tone: "text-green-600 bg-green-50" },
    { label: "Total orders", value: stats.orders, icon: ShoppingBag, tone: "text-purple bg-purple-soft/20" },
    { label: "Team accounts", value: stats.accounts, icon: Users, tone: "text-purple-deep bg-purple-soft/20" },
    { label: "Low stock alerts", value: stats.lowStock, icon: AlertTriangle, tone: "text-red-600 bg-red-50" },
  ] : [];

  return (
    <ProtectedRoute roles={["superadmin"]}>
      <Layout cartCount={count}>
        <div className="px-5 py-8">
          <div className="text-xs font-bold uppercase tracking-widest text-purple mb-1.5">Super admin console</div>
          <h1 className="font-serif text-3xl font-semibold mb-5">Analytics</h1>

          {!stats ? (
            <div className="text-gray-400 py-10 text-center">Loading…</div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 mb-5">
                {cards.map((c) => {
                  const Icon = c.icon;
                  return (
                    <div key={c.label} className="bg-white border border-lavender-deep rounded-2xl p-4">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2.5 ${c.tone}`}><Icon size={15} /></div>
                      <div className="font-serif text-xl font-semibold">{c.value}</div>
                      <div className="text-xs text-gray-500">{c.label}</div>
                    </div>
                  );
                })}
              </div>
              <div className="bg-white border border-lavender-deep rounded-2xl p-5">
                <div className="font-bold text-sm mb-3.5">Orders by day of week</div>
                <div className="flex items-end gap-2.5 h-28">
                  {weekly.map((h, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                      <div className="w-full rounded bg-gradient-to-b from-purple to-black" style={{ height: `${h}%` }} />
                      <span className="text-[10px] text-gray-400">{["Su","Mo","Tu","We","Th","Fr","Sa"][i]}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
