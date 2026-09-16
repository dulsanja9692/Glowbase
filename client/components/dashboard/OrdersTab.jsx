import { useEffect, useState } from "react";
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
    api("/orders").then((d) => setOrders(d.orders));
  }
  useEffect(load, []);

  async function cycleStatus(order) {
    const next = CYCLE[(CYCLE.indexOf(order.status) + 1) % CYCLE.length];
    await api(`/orders/${order._id}/status`, { method: "PATCH", body: { status: next } });
    load();
  }

  return (
    <div className="bg-white border border-lavender-deep rounded-2xl overflow-hidden">
      <div className="grid grid-cols-5 px-4 py-2.5 bg-lavender-deep text-[11px] font-bold uppercase text-gray-500">
        <span>Order</span><span>Customer</span><span>Items</span><span>Total</span><span>Status</span>
      </div>
      {orders.map((o) => (
        <div key={o._id} className="grid grid-cols-5 px-4 py-3 items-center border-t border-lavender-deep text-sm hover:bg-lavender">
          <span className="font-bold">#{o._id.slice(-6).toUpperCase()}</span>
          <span>{o.customer?.name}</span>
          <span>{o.items.length}</span>
          <span>${o.total}</span>
          <button onClick={() => cycleStatus(o)} className="text-left">
            <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${STATUS_STYLE[o.status]}`}>{o.status}</span>
          </button>
        </div>
      ))}
      <div className="px-4 py-2.5 text-[11px] text-gray-400">Click a status to advance it.</div>
    </div>
  );
}
