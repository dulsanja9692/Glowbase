import { useState } from "react";
import { useRouter } from "next/router";
import { Package, ShoppingBag, Users, BarChart3 } from "lucide-react";
import Layout from "../../components/Layout";
import ProtectedRoute from "../../components/ProtectedRoute";
import RoleBadge from "../../components/RoleBadge";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import ProductsTab from "../../components/dashboard/ProductsTab";
import OrdersTab from "../../components/dashboard/OrdersTab";

export default function Dashboard() {
  const { user } = useAuth();
  const { count } = useCart();
  const router = useRouter();
  const [tab, setTab] = useState("products");

  const tabs = [
    { id: "products", label: "Products", icon: Package },
    { id: "orders", label: "Orders", icon: ShoppingBag },
  ];

  return (
    <ProtectedRoute roles={["admin", "superadmin"]}>
      <Layout cartCount={count}>
        <div className="px-5 py-8">
          <div className="text-xs font-bold uppercase tracking-widest text-purple mb-1.5">
            {user?.role === "superadmin" ? "Super admin console" : "Admin console · Seller"}
          </div>
          <div className="flex items-center justify-between mb-5">
            <h1 className="font-serif text-3xl font-semibold">Dashboard</h1>
            {user && <RoleBadge role={user.role} size="md" />}
          </div>

          <div className="flex gap-1.5 mb-5 border-b border-lavender-deep pb-2.5 flex-wrap">
            {tabs.map((t) => {
              const Icon = t.icon;
              return (
                <button key={t.id} onClick={() => setTab(t.id)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-bold ${tab === t.id ? "bg-black text-white" : "text-black"}`}>
                  <Icon size={14} /> {t.label}
                </button>
              );
            })}
            {user?.role === "superadmin" && (
              <>
                <button onClick={() => router.push("/dashboard/users")} className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-bold text-black">
                  <Users size={14} /> Team & Access
                </button>
                <button onClick={() => router.push("/dashboard/analytics")} className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-bold text-black">
                  <BarChart3 size={14} /> Analytics
                </button>
              </>
            )}
          </div>

          {tab === "products" && <ProductsTab />}
          {tab === "orders" && <OrdersTab />}
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
