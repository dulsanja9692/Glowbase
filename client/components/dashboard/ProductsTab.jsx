import { useEffect, useState } from "react";
import { Plus, Edit3, Trash2, ImageIcon } from "lucide-react";
import { api } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "").replace("/api", "");

export default function ProductsTab() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", category: "Hair", price: "", stock: "", imageUrl: "" });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [toast, setToast] = useState("");

  function load() {
    // Admins only ever see their own listings; Super Admins see everyone's
    // so they can moderate the whole catalog. This is enforced again on
    // the server (see GET /api/products/mine), not just hidden in the UI.
    const endpoint = user?.role === "superadmin" ? "/products" : "/products/mine";
    api(endpoint).then((d) => setProducts(d.products));
  }
  useEffect(load, [user]);

  function onFileChange(e) {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  }

  async function submit() {
    if (!form.name || !form.price) { setToast("Name and price are required"); return; }
    try {
      const fd = new FormData();
      fd.append("name", form.name);
      fd.append("category", form.category);
      fd.append("price", form.price);
      fd.append("stock", form.stock || 0);
      if (file) fd.append("image", file);
      else if (form.imageUrl) fd.append("imageUrl", form.imageUrl);

      await api("/products", { method: "POST", body: fd, isFormData: true });
      setForm({ name: "", category: "Hair", price: "", stock: "", imageUrl: "" });
      setFile(null); setPreview(""); setShowForm(false);
      setToast("Product added"); load();
    } catch (err) {
      setToast(err.message);
    } finally {
      setTimeout(() => setToast(""), 2000);
    }
  }

  async function remove(id) {
    await api(`/products/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div>
      <div className="flex justify-between mb-3">
        <div className="text-sm text-gray-500">{products.length} products</div>
        <button onClick={() => setShowForm((v) => !v)} className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-black text-white text-xs font-bold">
          <Plus size={13} /> Add product
        </button>
      </div>

      {toast && <div className="bg-purple-soft/30 text-purple-deep text-sm rounded-lg p-2.5 mb-3">{toast}</div>}

      {showForm && (
        <div className="bg-white border border-lavender-deep rounded-2xl p-4.5 p-[18px] mb-4 grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="md:col-span-2 flex gap-3 items-center">
            <div className="w-16 h-16 rounded-xl bg-lavender border border-dashed border-purple-soft flex items-center justify-center overflow-hidden shrink-0">
              {preview ? <img src={preview} alt="" className="w-full h-full object-cover" /> : <ImageIcon size={20} color="#7C3AED" />}
            </div>
            <div className="flex-1">
              <label className="text-[11px] font-bold text-gray-500 uppercase">Product image (upload)</label>
              <input type="file" accept="image/*" onChange={onFileChange} className="w-full mt-1 text-sm" />
              <div className="text-[11px] text-gray-400 mt-1">or paste an image URL below instead</div>
              <input value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} placeholder="https://…"
                className="w-full mt-1 px-3 py-2 rounded-lg border border-lavender-deep text-sm" />
            </div>
          </div>
          <FormField label="Product name"><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="in" /></FormField>
          <FormField label="Category">
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="in">
              <option>Hair</option><option>Skin</option><option>Tools</option>
            </select>
          </FormField>
          <FormField label="Price ($)"><input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="in" /></FormField>
          <FormField label="Stock"><input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} className="in" /></FormField>
          <div className="md:col-span-2 flex gap-2.5 mt-1">
            <button onClick={submit} className="px-4.5 px-[18px] py-2.5 rounded-full bg-purple text-white font-bold text-sm">Save product</button>
            <button onClick={() => setShowForm(false)} className="px-4.5 px-[18px] py-2.5 rounded-full bg-lavender-deep font-bold text-sm">Cancel</button>
          </div>
        </div>
      )}

      <div className="bg-white border border-lavender-deep rounded-2xl overflow-hidden">
        <div className={`grid ${user?.role === "superadmin" ? "grid-cols-6" : "grid-cols-5"} px-4 py-2.5 bg-lavender-deep text-[11px] font-bold uppercase text-gray-500`}>
          <span>Product</span><span>Category</span><span>Price</span><span>Stock</span>
          {user?.role === "superadmin" && <span>Seller</span>}
          <span></span>
        </div>
        {products.map((p) => {
          const canEdit = user?.role === "superadmin" || p.seller?._id === user?.id;
          return (
            <div key={p._id} className={`grid ${user?.role === "superadmin" ? "grid-cols-6" : "grid-cols-5"} px-4 py-2.5 items-center border-t border-lavender-deep text-sm hover:bg-lavender`}>
              <span className="flex items-center gap-2 font-semibold">
                <img src={p.imageUrl.startsWith("http") ? p.imageUrl : `${API_BASE}${p.imageUrl}`} alt="" className="w-7 h-7 rounded-lg object-cover" /> {p.name}
              </span>
              <span className="text-gray-500">{p.category}</span>
              <span>${p.price}</span>
              <span className={`font-bold ${p.stock === 0 ? "text-red-500" : p.stock < 10 ? "text-amber-600" : "text-green-600"}`}>{p.stock}</span>
              {user?.role === "superadmin" && <span className="text-gray-400 text-xs">{p.seller?.name}</span>}
              <div className="flex gap-2">
                {/* Edit/delete only ever shown for products this account is allowed
                    to touch — admins can't reach another seller's row here since
                    /products/mine already filters to their own products, and this
                    ownership check is a second layer of defense for the shared
                    Super Admin view. */}
                {canEdit && (
                  <>
                    <button><Edit3 size={14} className="text-gray-400" /></button>
                    <button onClick={() => remove(p._id)}><Trash2 size={14} className="text-red-500" /></button>
                  </>
                )}
              </div>
            </div>
          );
        })}
        {products.length === 0 && (
          <div className="px-4 py-8 text-center text-sm text-gray-400">
            {user?.role === "superadmin" ? "No products listed yet." : "You haven't listed any products yet."}
          </div>
        )}
      </div>
    </div>
  );
}

function FormField({ label, children }) {
  return <div><label className="text-[11px] font-bold text-gray-500 uppercase">{label}</label>{children}</div>;
}
