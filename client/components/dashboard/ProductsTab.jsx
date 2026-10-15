import { useEffect, useState } from "react";
import { Plus, Edit3, Trash2, ImageIcon } from "lucide-react";
import { api } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "").replace("/api", "");

export default function ProductsTab() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ name: "", category: "Hair", price: "", stock: "", imageUrl: "" });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [toast, setToast] = useState("");

  function load() {
    // Admins (sellers) only ever see their own listings; Super Admins see everyone's
    const endpoint = user?.role === "superadmin" ? "/products" : "/products/mine";
    api(endpoint).then((d) => setProducts(d.products || []));
  }
  useEffect(load, [user]);

  function onFileChange(e) {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  }

  function startEdit(p) {
    setEditingId(p._id || p.id);
    setForm({
      name: p.name || "",
      category: p.category || "Hair",
      price: p.price !== undefined ? p.price : "",
      stock: p.stock !== undefined ? p.stock : "",
      imageUrl: p.imageUrl || "",
    });
    setPreview(p.imageUrl ? (p.imageUrl.startsWith("http") ? p.imageUrl : `${API_BASE}${p.imageUrl}`) : "");
    setFile(null);
    setShowForm(true);
  }

  function cancelForm() {
    setShowForm(false);
    setEditingId(null);
    setForm({ name: "", category: "Hair", price: "", stock: "", imageUrl: "" });
    setFile(null);
    setPreview("");
  }

  async function submit() {
    if (!form.name || form.price === "") {
      setToast("Name and price are required");
      return;
    }
    try {
      const fd = new FormData();
      fd.append("name", form.name);
      fd.append("category", form.category);
      fd.append("price", form.price);
      fd.append("stock", form.stock || 0);
      if (file) fd.append("image", file);
      else if (form.imageUrl) fd.append("imageUrl", form.imageUrl);

      if (editingId) {
        await api(`/products/${editingId}`, { method: "PATCH", body: fd, isFormData: true });
        setToast("Product updated");
      } else {
        await api("/products", { method: "POST", body: fd, isFormData: true });
        setToast("Product added");
      }

      cancelForm();
      load();
    } catch (err) {
      setToast(err.message);
    } finally {
      setTimeout(() => setToast(""), 2500);
    }
  }

  async function remove(id) {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await api(`/products/${id}`, { method: "DELETE" });
      setToast("Product deleted");
      load();
    } catch (err) {
      setToast(err.message);
    } finally {
      setTimeout(() => setToast(""), 2500);
    }
  }

  const currentUserId = user?._id || user?.id;

  return (
    <div>
      <div className="flex justify-between mb-3 items-center">
        <div className="text-sm text-gray-500">{products.length} products</div>
        <button
          onClick={() => {
            if (showForm && !editingId) {
              cancelForm();
            } else {
              setEditingId(null);
              setForm({ name: "", category: "Hair", price: "", stock: "", imageUrl: "" });
              setFile(null);
              setPreview("");
              setShowForm(true);
            }
          }}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-black text-white text-xs font-bold"
        >
          <Plus size={13} /> {showForm && !editingId ? "Close" : "Add product"}
        </button>
      </div>

      {toast && <div className="bg-purple-soft/30 text-purple-deep text-sm rounded-lg p-2.5 mb-3">{toast}</div>}

      {showForm && (
        <div className="bg-white border border-lavender-deep rounded-2xl p-4.5 p-[18px] mb-4 grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="md:col-span-2 text-sm font-bold text-gray-700">
            {editingId ? "Edit Product" : "New Product"}
          </div>
          <div className="md:col-span-2 flex gap-3 items-center">
            <div className="w-16 h-16 rounded-xl bg-lavender border border-dashed border-purple-soft flex items-center justify-center overflow-hidden shrink-0">
              {preview ? <img src={preview} alt="" className="w-full h-full object-cover" /> : <ImageIcon size={20} color="#7C3AED" />}
            </div>
            <div>
              <label className="text-xs font-bold text-purple cursor-pointer underline">
                Upload image file
                <input type="file" accept="image/*" onChange={onFileChange} className="hidden" />
              </label>
              <div className="text-[11px] text-gray-400 mt-0.5">Or paste a hosted URL below</div>
            </div>
          </div>
          <FormField label="Or Image URL">
            <input value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} placeholder="https://…" className="in" />
          </FormField>
          <FormField label="Product name">
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="in" />
          </FormField>
          <FormField label="Category">
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="in">
              <option>Hair</option><option>Skin</option><option>Tools</option>
            </select>
          </FormField>
          <FormField label="Price (Rs.)">
            <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="in" />
          </FormField>
          <FormField label="Stock">
            <input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} className="in" />
          </FormField>
          <div className="md:col-span-2 flex gap-2.5 mt-1">
            <button onClick={submit} className="px-4.5 px-[18px] py-2.5 rounded-full bg-purple text-white font-bold text-sm">
              {editingId ? "Save changes" : "Save product"}
            </button>
            <button onClick={cancelForm} className="px-4.5 px-[18px] py-2.5 rounded-full bg-lavender-deep font-bold text-sm">
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="bg-white border border-lavender-deep rounded-2xl overflow-hidden">
        <div className={`grid ${user?.role === "superadmin" ? "grid-cols-6" : "grid-cols-5"} px-4 py-2.5 bg-lavender-deep text-[11px] font-bold uppercase text-gray-500`}>
          <span>Product</span><span>Category</span><span>Price</span><span>Stock</span>
          {user?.role === "superadmin" && <span>Seller</span>}
          <span>Actions</span>
        </div>
        {products.map((p) => {
          const sellerId = typeof p.seller === "object" ? (p.seller?._id || p.seller?.id) : p.seller;
          const isOwner = sellerId && sellerId === currentUserId;
          const canManage = user?.role === "superadmin" || isOwner;

          return (
            <div key={p._id || p.id} className={`grid ${user?.role === "superadmin" ? "grid-cols-6" : "grid-cols-5"} px-4 py-2.5 items-center border-t border-lavender-deep text-sm hover:bg-lavender`}>
              <span className="flex items-center gap-2 font-semibold">
                <img src={p.imageUrl?.startsWith("http") ? p.imageUrl : `${API_BASE}${p.imageUrl}`} alt="" className="w-7 h-7 rounded-lg object-cover" /> {p.name}
              </span>
              <span className="text-gray-500">{p.category}</span>
              <span>Rs. {p.price?.toLocaleString()}</span>
              <span className={`font-bold ${p.stock === 0 ? "text-red-500" : p.stock < 10 ? "text-amber-600" : "text-green-600"}`}>{p.stock}</span>
              {user?.role === "superadmin" && <span className="text-gray-400 text-xs">{p.seller?.name || "Unknown"}</span>}
              <div className="flex gap-2">
                {/* Only the product owner (seller) or Super Admin can edit or delete this product */}
                {canManage ? (
                  <>
                    <button onClick={() => startEdit(p)} title="Edit product" className="hover:text-purple">
                      <Edit3 size={14} className="text-gray-500 hover:text-purple" />
                    </button>
                    <button onClick={() => remove(p._id || p.id)} title="Delete product" className="hover:text-red-700">
                      <Trash2 size={14} className="text-red-500" />
                    </button>
                  </>
                ) : (
                  <span className="text-xs text-gray-400 italic">Read-only</span>
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
