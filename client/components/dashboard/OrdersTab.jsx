import { useEffect, useState } from "react";
import { MapPin, Phone, CheckCircle, Truck, Package, Clock, XCircle, RefreshCw } from "lucide-react";
import { api } from "../../lib/api";

const ORDER_STATUSES = [
  "Processing",
  "Ready to Ship",
  "In Transit",
  "Out for Delivery",
  "Delivered",
];

const STATUS_CONFIG = {
  Processing: {
    cls: "bg-amber-50 text-amber-800 border-amber-200",
    icon: Clock,
  },
  "Ready to Ship": {
    cls: "bg-blue-50 text-blue-800 border-blue-200",
    icon: Package,
  },
  "In Transit": {
    cls: "bg-indigo-50 text-indigo-800 border-indigo-200",
    icon: Truck,
  },
  "Out for Delivery": {
    cls: "bg-purple-50 text-purple-deep border-purple-200",
    icon: Truck,
  },
  Delivered: {
    cls: "bg-green-50 text-green-800 border-green-200",
    icon: CheckCircle,
  },
  Cancelled: {
    cls: "bg-red-50 text-red-800 border-red-200",
    icon: XCircle,
  },
};

export default function OrdersTab() {
  const [orders, setOrders] = useState([]);
  const [toast, setToast] = useState("");
  const [updatingId, setUpdatingId] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  function load() {
    setRefreshing(true);
    api("/orders")
      .then((d) => setOrders(d.orders || []))
      .catch((err) => console.error(err))
      .finally(() => setRefreshing(false));
  }

  useEffect(() => {
    load();
    const timer = setInterval(load, 15000);
    return () => clearInterval(timer);
  }, []);

  async function handleStatusChange(order, newStatus) {
    if (order.status === newStatus) return;
    setUpdatingId(order._id || order.id);
    try {
      await api(`/orders/${order._id || order.id}/status`, {
        method: "PATCH",
        body: { status: newStatus },
      });
      setToast(`Order #${(order._id || order.id).slice(-6).toUpperCase()} updated to "${newStatus}"`);
      load();
    } catch (err) {
      setToast(err.message || "Failed to update status");
    } finally {
      setUpdatingId(null);
      setTimeout(() => setToast(""), 3000);
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-3">
        <div className="text-xs text-gray-500 font-medium">
          Manage fulfillment for {orders.length} order(s)
        </div>
        <button
          onClick={load}
          disabled={refreshing}
          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border border-lavender-deep bg-white hover:bg-lavender text-gray-700 transition"
        >
          <RefreshCw size={12} className={refreshing ? "animate-spin" : ""} />
          <span>{refreshing ? "Syncing..." : "Sync Orders"}</span>
        </button>
      </div>

      {toast && (
        <div className="bg-purple-soft/30 text-purple-deep text-sm rounded-lg p-2.5 mb-3 font-medium">
          {toast}
        </div>
      )}

      <div className="bg-white border border-lavender-deep rounded-2xl overflow-hidden shadow-sm">
        <div className="grid grid-cols-6 px-4 py-2.5 bg-lavender-deep text-[11px] font-bold uppercase text-gray-500">
          <span>Order</span>
          <span>Customer</span>
          <span className="col-span-2">Delivery & Contact</span>
          <span>Total</span>
          <span>Fulfillment Status</span>
        </div>

        {orders.map((o) => {
          const id = o._id || o.id;
          const address = o.shippingAddress || o.customer?.address || "Address not provided";
          const phone = o.phone || o.customer?.phone;
          const cfg = STATUS_CONFIG[o.status] || STATUS_CONFIG.Processing;
          const Icon = cfg.icon;

          return (
            <div
              key={id}
              className="grid grid-cols-6 px-4 py-3.5 items-center border-t border-lavender-deep text-sm hover:bg-lavender transition-colors"
            >
              <div>
                <span className="font-bold text-gray-900">#{id.slice(-6).toUpperCase()}</span>
                <div className="text-xs text-gray-400">{o.items?.length || 0} item(s)</div>
              </div>

              <div>
                <div className="font-semibold text-gray-800">{o.customer?.name || "Customer"}</div>
                <div className="text-xs text-gray-400 truncate max-w-[140px]">{o.customer?.email}</div>
              </div>

              <div className="col-span-2 text-xs text-gray-600 pr-2">
                <div className="flex items-center gap-1 font-medium text-gray-800">
                  <MapPin size={13} className="text-purple shrink-0" />
                  <span className="truncate">{address}</span>
                </div>
                {phone && (
                  <div className="flex items-center gap-1 text-gray-500 mt-1">
                    <Phone size={12} className="text-gray-400 shrink-0" />
                    <span>{phone}</span>
                  </div>
                )}
              </div>

              <span className="font-semibold text-gray-800">Rs. {o.total?.toLocaleString()}</span>

              <div>
                <div className="relative inline-block w-full max-w-[170px]">
                  <select
                    disabled={updatingId === id}
                    value={o.status}
                    onChange={(e) => handleStatusChange(o, e.target.value)}
                    className={`w-full text-xs font-bold px-2.5 py-1.5 rounded-full border cursor-pointer outline-none transition appearance-none pr-6 ${cfg.cls}`}
                  >
                    {ORDER_STATUSES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                  <span className="absolute right-2.5 top-2 pointer-events-none text-xs opacity-60">
                    ▼
                  </span>
                </div>
              </div>
            </div>
          );
        })}

        {orders.length === 0 && (
          <div className="px-4 py-10 text-center text-sm text-gray-400">
            No orders found yet.
          </div>
        )}

        <div className="px-4 py-2.5 text-[11px] text-gray-400 border-t border-lavender-deep bg-lavender/30">
          💡 Select any status from the dropdown to advance and complete order fulfillment: <strong>Processing</strong> → <strong>Ready to Ship</strong> → <strong>In Transit</strong> → <strong>Out for Delivery</strong> → <strong>Delivered</strong>.
        </div>
      </div>
    </div>
  );
}
