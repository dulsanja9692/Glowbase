import { useEffect, useState } from "react";
import { Check, X, Trash2, Mail } from "lucide-react";
import Layout from "../../components/Layout";
import ProtectedRoute from "../../components/ProtectedRoute";
import RoleBadge from "../../components/RoleBadge";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../lib/api";

// Superadmin-only. Sellers no longer get their credentials typed in by
// a Super Admin — they apply themselves at /sell with their own email
// and password, and a Super Admin just approves or rejects the request.
export default function TeamAccess() {
  const { count } = useCart();
  const { user: me } = useAuth();
  const [staff, setStaff] = useState([]);
  const [requests, setRequests] = useState([]);
  const [toast, setToast] = useState("");

  function load() {
    api("/users").then((d) => setStaff(d.users));
    api("/seller-requests").then((d) => setRequests(d.requests));
  }
  useEffect(load, []);

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(""), 2000);
  }

  async function approve(id) {
    try {
      await api(`/seller-requests/${id}/approve`, { method: "PATCH" });
      showToast("Seller approved — they can now log in");
      load();
    } catch (err) {
      showToast(err.message);
    }
  }

  async function decline(id) {
    try {
      await api(`/seller-requests/${id}/reject`, { method: "PATCH" });
      showToast("Application rejected");
      load();
    } catch (err) {
      showToast(err.message);
    }
  }

  async function promote(u) {
    const role = u.role === "admin" ? "superadmin" : "admin";
    await api(`/users/${u.id}/role`, { method: "PATCH", body: { role } });
    load();
  }

  async function remove(id) {
    await api(`/users/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <ProtectedRoute roles={["superadmin"]}>
      <Layout cartCount={count}>
        <div className="px-5 py-8">
          <div className="text-xs font-bold uppercase tracking-widest text-purple mb-1.5">Super admin console</div>
          <h1 className="font-serif text-3xl font-semibold mb-5">Team &amp; access</h1>

          {toast && <div className="bg-purple-soft/30 text-purple-deep text-sm rounded-lg p-2.5 mb-4">{toast}</div>}

          {/* --- Pending seller applications --- */}
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-serif text-lg font-semibold">Seller applications</h2>
            <span className="text-xs text-gray-500">{requests.length} pending</span>
          </div>

          {requests.length === 0 ? (
            <div className="bg-white border border-lavender-deep rounded-2xl p-6 text-center text-sm text-gray-400 mb-8">
              No pending applications. Prospective sellers apply at <span className="font-semibold text-purple">/sell</span>.
            </div>
          ) : (
            <div className="flex flex-col gap-3 mb-8">
              {requests.map((r) => (
                <div key={r._id} className="bg-white border border-lavender-deep rounded-2xl p-4">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                      <div className="font-bold text-sm">{r.businessName}</div>
                      <div className="text-sm text-gray-600">{r.name}</div>
                      <div className="text-xs text-gray-400 flex items-center gap-1 mt-0.5"><Mail size={11} /> {r.email}</div>
                      {r.message && <p className="text-xs text-gray-500 mt-2 max-w-[480px]">{r.message}</p>}
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button onClick={() => approve(r._id)}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-black text-white text-xs font-bold">
                        <Check size={13} /> Approve
                      </button>
                      <button onClick={() => decline(r._id)}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-lavender-deep text-xs font-bold">
                        <X size={13} /> Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* --- Current team --- */}
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-serif text-lg font-semibold">Current team</h2>
          </div>
          <div className="bg-white border border-lavender-deep rounded-2xl overflow-hidden">
            <div className="grid grid-cols-4 px-4 py-2.5 bg-lavender-deep text-[11px] font-bold uppercase text-gray-500">
              <span>Name</span><span>Email</span><span>Role</span><span></span>
            </div>
            {staff.map((m) => (
              <div key={m.id} className="grid grid-cols-4 px-4 py-3 items-center border-t border-lavender-deep text-sm hover:bg-lavender">
                <span className="font-semibold">{m.name}</span>
                <span className="text-gray-500">{m.email}</span>
                <RoleBadge role={m.role} />
                <div className="flex gap-2.5">
                  {m.id !== me?.id && (
                    <>
                      <button onClick={() => promote(m)} className="text-xs font-bold text-purple">
                        Make {m.role === "admin" ? "Super Admin" : "Admin"}
                      </button>
                      <button onClick={() => remove(m.id)}><Trash2 size={14} className="text-red-500" /></button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
