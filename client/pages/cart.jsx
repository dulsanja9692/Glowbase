import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { ShoppingBag, Minus, Plus, Trash2, ArrowRight } from "lucide-react";
import Layout from "../components/Layout";
import ProtectedRoute from "../components/ProtectedRoute";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api";

export default function Cart() {
  const { items, changeQty, clearCart, count } = useCart();
  const { user } = useAuth();
  const router = useRouter();
  const [products, setProducts] = useState({});
  const [cardNumber, setCardNumber] = useState("4242 4242 4242 4242");
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api("/products").then((d) => {
      const map = {};
      d.products.forEach((p) => (map[p._id] = p));
      setProducts(map);
    });
  }, []);

  const cartItems = Object.entries(items)
    .map(([id, qty]) => ({ ...products[id], qty }))
    .filter((i) => i._id);
  const total = cartItems.reduce((s, i) => s + i.price * i.qty, 0);

  async function checkout() {
    if (!user) { router.push("/login"); return; }
    setError(""); setPlacing(true);
    try {
      // 1. Mock payment charge
      const charge = await api("/payments/mock-charge", { method: "POST", body: { amount: total, cardNumber } });
      // 2. Create the order using the mock payment reference
      await api("/orders", {
        method: "POST",
        body: {
          items: cartItems.map((i) => ({ productId: i._id, quantity: i.qty })),
          shippingAddress: "Provided at checkout",
          paymentReference: charge.reference,
        },
      });
      clearCart();
      router.push("/orders");
    } catch (err) {
      setError(err.message);
    } finally {
      setPlacing(false);
    }
  }

  return (
    <ProtectedRoute>
    <Layout cartCount={count}>
      <div className="max-w-[640px] mx-auto px-5 py-8">
        <div className="text-xs font-bold uppercase tracking-widest text-purple mb-1.5">Your bag</div>
        <h1 className="font-serif text-3xl font-semibold mb-5">Cart</h1>

        {cartItems.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <ShoppingBag size={30} className="mx-auto mb-2.5" />
            <div>Your bag is empty.</div>
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-2.5 mb-5">
              {cartItems.map((i) => (
                <div key={i._id} className="flex items-center justify-between bg-white border border-lavender-deep rounded-2xl p-3">
                  <div className="flex items-center gap-2.5">
                    <img src={i.imageUrl} alt={i.name} className="w-11 h-11 rounded-lg object-cover" />
                    <div>
                      <div className="font-bold text-sm">{i.name}</div>
                      <div className="text-xs text-gray-500">${i.price} each</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <button onClick={() => changeQty(i._id, -1)} className="w-6.5 h-6.5 w-[26px] h-[26px] rounded-full bg-lavender-deep flex items-center justify-center"><Minus size={13} /></button>
                    <span className="font-bold w-4 text-center">{i.qty}</span>
                    <button onClick={() => changeQty(i._id, 1)} className="w-[26px] h-[26px] rounded-full bg-lavender-deep flex items-center justify-center"><Plus size={13} /></button>
                    <button onClick={() => changeQty(i._id, -i.qty)} className="text-red-500"><Trash2 size={15} /></button>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white border border-lavender-deep rounded-2xl p-4 mb-4">
              <label className="text-xs font-bold text-gray-500 uppercase">Mock card number</label>
              <input value={cardNumber} onChange={(e) => setCardNumber(e.target.value)}
                className="w-full mt-1 px-3.5 py-2.5 rounded-lg border border-lavender-deep text-sm" />
              <p className="text-xs text-gray-400 mt-1.5">No real charge is made. A number ending in 0000 simulates a declined card.</p>
            </div>

            {error && <div className="bg-red-50 text-red-600 text-sm rounded-lg p-2.5 mb-4">{error}</div>}

            <div className="flex justify-between text-base font-bold mb-4"><span>Total</span><span>${total}</span></div>
            <button onClick={checkout} disabled={placing} className="w-full py-3.5 rounded-full bg-black text-white font-bold flex items-center justify-center gap-2">
              {placing ? "Processing…" : <>Checkout <ArrowRight size={14} /></>}
            </button>
          </>
        )}
      </div>
    </Layout>
    </ProtectedRoute>
  );
}
