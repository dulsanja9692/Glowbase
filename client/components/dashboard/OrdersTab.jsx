import { useEffect, useState } from "react";
import { MapPin, Phone } from "lucide-react";
import { api } from "../../lib/api";

const CYCLE = ["Processing", "Shipped", "Delivered"];
const STATUS_STYLE = {
  Processing: "bg-amber-100 text-amber-700",
  Shipped: "bg-purple-soft/40 text-purple-deep",
  Delivered: "bg-green-100 text-green-700",
  Cancelled: "bg-red-100 text-red-600",
};

export default function OrdersTab() {
  const [orders, setOrders] = useState([]);

  function load() {
    api("/orders").then((d) => setOrders(d.orders || []));
  }
  useEffect(load, []);

  async function cycleStatus(order) {
    const next = CYCLE[(CYCLE.indexOf(order.status) + 1) % CYCLE.length];
    await api(`/orders/${order._id || order.id}/status`, { method: "PATCH", body: { status: next } });
    load();
  }

  return (
    <div className="bg-white border border-lavender-deep rounded-2xl overflow-hidden">
      <div className="grid grid-cols-6 px-4 py-2.5 bg-lavender-deep text-[11px] font-bold uppercase text-gray-500">
        <span>Order</span>
        <span>Customer</span>
        <span className="col-span-2">Delivery & Contact</span>
        <span>Total</span>
        <span>Status</span>
      </div>
      {orders.map((o) => {
        const address = o.shippingAddress || o.customer?.address || "Address not provided";
        const phone = o.phone || o.customer?.phone;

        return (
          <div key={o._id || o.id} className="grid grid-cols-6 px-4 py-3.5 items-center border-t border-lavender-deep text-sm hover:bg-lavender">
            <div>
              <span className="font-bold">#{(o._id || o.id).slice(-6).toUpperCase()}</span>
              <div className="text-xs text-gray-400">{o.items?.length || 0} items</div>
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
              <button onClick={() => cycleStatus(o)} className="text-left" title="Click to advance status">
                <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${STATUS_STYLE[o.status] || "bg-gray-100 text-gray-600"}`}>
                  {o.status}
                </span>
              </button>
            </div>
          </div>
        );
      })}
      {orders.length === 0 && (
        <div className="px-4 py-8 text-center text-sm text-gray-400">
          No orders received yet.
        </div>
      )}
      <div className="px-4 py-2.5 text-[11px] text-gray-400 border-t border-lavender-deep">
        Click a status pill to advance: Processing → Shipped → Delivered.
      </div>
    </div>
  );
}
