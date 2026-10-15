import { useEffect, useState } from "react";
import { CheckCircle2, Truck, Clock, PackageCheck, AlertCircle, MapPin, Phone } from "lucide-react";
import Layout from "../components/Layout";
import ProtectedRoute from "../components/ProtectedRoute";
import { useCart } from "../context/CartContext";
import { api } from "../lib/api";

const STEPS = [
  "Processing",
  "Ready to Ship",
  "In Transit",
  "Out for Delivery",
  "Delivered",
];

const STATUS_STYLE = {
  Processing: "bg-amber-100 text-amber-800 border border-amber-300",
  "Ready to Ship": "bg-blue-100 text-blue-800 border border-blue-300",
  "In Transit": "bg-indigo-100 text-indigo-800 border border-indigo-300",
  "Out for Delivery": "bg-purple-100 text-purple-800 border border-purple-300",
  Delivered: "bg-green-100 text-green-800 border border-green-300",
  Shipped: "bg-purple-soft/40 text-purple-deep border border-purple-200",
  Cancelled: "bg-red-100 text-red-700 border border-red-300",
};

function getStepIndex(status) {
  if (status === "Delivered") return 4;
  if (status === "Out for Delivery" || status === "Shipped") return 3;
  if (status === "In Transit") return 2;
  if (status === "Ready to Ship") return 1;
  if (status === "Processing") return 0;
  return -1;
}

export default function Orders() {
  const { count } = useCart();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [toast, setToast] = useState("");
  const [errorToast, setErrorToast] = useState("");

  function loadOrders() {
    api("/orders/mine")
      .then((d) => setOrders(d.orders || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadOrders();
  }, []);

  async function handleConfirmDelivered(order) {
    const id = order._id || order.id;
    setUpdatingId(id);
    setErrorToast("");
    try {
      await api(`/orders/${id}/status`, {
        method: "PATCH",
        body: { status: "Delivered" },
      });
      setToast(`Order #${id.slice(-6).toUpperCase()} confirmed as Delivered! Thank you.`);
      // Update local state instantly
      setOrders((prev) =>
        prev.map((o) => ((o._id || o.id) === id ? { ...o, status: "Delivered" } : o))
      );
    } catch (err) {
      setErrorToast(err.message || "Failed to update order status.");
    } finally {
      setUpdatingId(null);
      setTimeout(() => {
        setToast("");
        setErrorToast("");
      }, 4000);
    }
  }

  return (
    <ProtectedRoute>
      <Layout cartCount={count}>
        <div className="max-w-[680px] mx-auto px-5 py-8">
          <div className="text-xs font-bold uppercase tracking-widest text-purple mb-1.5">Track & review</div>
          <h1 className="font-serif text-3xl font-semibold mb-5">My orders</h1>

          {toast && (
            <div className="mb-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm rounded-xl p-3 flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
              <span>{toast}</span>
            </div>
          )}

          {errorToast && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl p-3 flex items-center gap-2">
              <AlertCircle size={16} className="text-red-500 shrink-0" />
              <span>{errorToast}</span>
            </div>
          )}

          {loading ? (
            <div className="text-gray-400 text-center py-10">Loading orders…</div>
          ) : orders.length === 0 ? (
            <div className="text-gray-400 text-center py-10">No orders placed yet.</div>
          ) : (
            <div className="flex flex-col gap-4">
              {orders.map((o) => {
                const id = o._id || o.id;
                const currentIdx = getStepIndex(o.status);
                const isCancelled = o.status === "Cancelled";
                const isDelivered = o.status === "Delivered";
                const canConfirmDelivered = o.status === "Out for Delivery" || o.status === "Shipped";

                return (
                  <div key={id} className="bg-white border border-lavender-deep rounded-2xl p-4 shadow-sm hover:shadow-md transition">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-2 pb-2 border-b border-lavender-deep">
                      <div>
                        <span className="font-bold text-sm text-gray-900">#{id.slice(-6).toUpperCase()}</span>
                        <span className="text-xs text-gray-400 ml-2">
                          {new Date(o.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${STATUS_STYLE[o.status] || "bg-gray-100 text-gray-700"}`}>
                        {o.status}
                      </span>
                    </div>

                    {/* Items */}
                    <div className="text-sm font-medium text-gray-800 mb-1">
                      {o.items?.map((i) => `${i.name} (x${i.quantity || 1})`).join(", ")}
                    </div>
                    <div className="text-xs text-gray-500 mb-2">
                      Total: <span className="font-semibold text-gray-900">Rs. {o.total?.toLocaleString()}</span>
                    </div>

                    {/* Delivery & Phone */}
                    {o.shippingAddress && (
                      <div className="text-xs text-gray-600 bg-lavender/40 rounded-xl px-3 py-2 mb-3 flex flex-wrap items-center gap-x-3 gap-y-1">
                        <div className="flex items-center gap-1">
                          <MapPin size={13} className="text-purple shrink-0" />
                          <span>{o.shippingAddress}</span>
                        </div>
                        {o.phone && (
                          <div className="flex items-center gap-1 text-gray-500">
                            <Phone size={12} className="text-gray-400 shrink-0" />
                            <span>{o.phone}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Step Tracker (Fulfillment stages) */}
                    {!isCancelled && (
                      <div className="my-3 px-1">
                        <div className="grid grid-cols-5 gap-1 items-center">
                          {STEPS.map((step, idx) => {
                            const isDone = currentIdx >= idx;
                            const isCurrent = currentIdx === idx;
                            return (
                              <div key={step} className="flex flex-col items-center text-center">
                                <div
                                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition ${
                                    isDone
                                      ? "bg-purple text-white"
                                      : "bg-gray-100 text-gray-400 border border-gray-200"
                                  }`}
                                >
                                  {isDone ? "✓" : idx + 1}
                                </div>
                                <span
                                  className={`text-[10px] mt-1 leading-tight ${
                                    isCurrent
                                      ? "font-bold text-purple"
                                      : isDone
                                      ? "font-medium text-gray-700"
                                      : "text-gray-400"
                                  }`}
                                >
                                  {step}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Customer Action Area */}
                    {isDelivered && (
                      <div className="mt-3 bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center justify-between text-xs text-emerald-800">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                          <span className="font-semibold">Order Delivered & Received</span>
                        </div>
                        <span className="text-[11px] text-emerald-700 bg-white/80 px-2 py-0.5 rounded-full font-bold">
                          Completed
                        </span>
                      </div>
                    )}

                    {canConfirmDelivered && (
                      <div className="mt-3 bg-purple-soft/30 border border-purple/30 rounded-xl p-3 text-xs">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
                          <div>
                            <div className="font-bold text-gray-900 flex items-center gap-1.5">
                              <Truck size={15} className="text-purple" />
                              <span>Out for Delivery! All seller steps completed</span>
                            </div>
                            <p className="text-gray-600 text-[11px] mt-0.5">
                              Have you received this package? Confirm below to mark it as Delivered.
                            </p>
                          </div>
                          <button
                            onClick={() => handleConfirmDelivered(o)}
                            disabled={updatingId === id}
                            className="shrink-0 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-full shadow transition flex items-center justify-center gap-1.5 disabled:opacity-50"
                          >
                            <PackageCheck size={14} />
                            <span>{updatingId === id ? "Updating..." : "Mark as Delivered"}</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {!isDelivered && !canConfirmDelivered && !isCancelled && (
                      <div className="mt-3 bg-gray-50 border border-gray-200 rounded-xl p-2.5 flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center gap-2">
                          <Clock size={13} className="text-gray-400 shrink-0" />
                          <span>
                            Fulfillment in progress: <strong>{o.status}</strong> (Steps 1–3)
                          </span>
                        </div>
                        <span
                          className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-gray-200 text-gray-500 cursor-not-allowed"
                          title="Customer can only confirm Delivered once seller updates order to Out for Delivery"
                        >
                          Delivered (Pending)
                        </span>
                      </div>
                    )}

                    {isCancelled && (
                      <div className="mt-3 bg-red-50 border border-red-200 rounded-xl p-2.5 text-xs text-red-700">
                        This order was cancelled.
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
