import { useState } from "react";
import { Star, ShoppingBag, RotateCcw } from "lucide-react";
import Layout from "../components/Layout";
import ProtectedRoute from "../components/ProtectedRoute";
import { useCart } from "../context/CartContext";
import { api } from "../lib/api";

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "").replace("/api", "");

// Each option carries the product category (or categories) it points
// toward. At the end, whichever category scored highest drives which
// real products get pulled from the catalog and recommended.
const QUIZ = [
  {
    q: "How would you describe your hair?",
    options: [
      { label: "Fine & flat", weight: { Hair: 2 } },
      { label: "Curly & dry", weight: { Hair: 2 } },
      { label: "Oily roots", weight: { Hair: 2 } },
      { label: "Color-treated", weight: { Hair: 2 } },
    ],
  },
  {
    q: "What's your main skin concern?",
    options: [
      { label: "Dullness", weight: { Skin: 2 } },
      { label: "Breakouts", weight: { Skin: 2 } },
      { label: "Fine lines", weight: { Skin: 2 } },
      { label: "Sensitivity", weight: { Skin: 2 } },
    ],
  },
  {
    q: "How often do you use heat styling tools?",
    options: [
      { label: "Daily", weight: { Tools: 2, Hair: 1 } },
      { label: "A few times a week", weight: { Tools: 1, Hair: 1 } },
      { label: "Rarely", weight: { Hair: 1 } },
      { label: "Never", weight: { Skin: 1 } },
    ],
  },
  {
    q: "How much time do you spend on your routine?",
    options: [
      { label: "Under 5 minutes", weight: { Skin: 1 } },
      { label: "5–15 minutes", weight: { Hair: 1, Skin: 1 } },
      { label: "15+ minutes, I enjoy it", weight: { Tools: 2 } },
    ],
  },
  {
    q: "What matters most to you right now?",
    options: [
      { label: "Repairing damage", weight: { Hair: 2 } },
      { label: "Glowing, healthy skin", weight: { Skin: 2 } },
      { label: "Leveling up my tools", weight: { Tools: 2 } },
      { label: "A bit of everything", weight: { Hair: 1, Skin: 1, Tools: 1 } },
    ],
  },
];

export default function Quiz() {
  const { count, addItem } = useCart();
  const [step, setStep] = useState(0);
  const [scores, setScores] = useState({ Hair: 0, Skin: 0, Tools: 0 });
  const [recommended, setRecommended] = useState(null); // null = not loaded yet
  const [loading, setLoading] = useState(false);
  const [addedId, setAddedId] = useState(null);
  const done = step >= QUIZ.length;

  function pick(option) {
    const nextScores = { ...scores };
    Object.entries(option.weight).forEach(([cat, w]) => { nextScores[cat] = (nextScores[cat] || 0) + w; });
    setScores(nextScores);

    const nextStep = step + 1;
    setStep(nextStep);

    if (nextStep >= QUIZ.length) {
      fetchRecommendations(nextScores);
    }
  }

  async function fetchRecommendations(finalScores) {
    setLoading(true);
    // Rank categories by score, then pull real products for the top
    // category (and a couple from the runner-up for variety).
    const ranked = Object.entries(finalScores).sort((a, b) => b[1] - a[1]).map(([cat]) => cat);
    try {
      const [top, second] = await Promise.all([
        api(`/products?category=${ranked[0]}`),
        api(`/products?category=${ranked[1]}`),
      ]);
      const byRating = (list) => [...list.products].filter((p) => p.stock > 0).sort((a, b) => b.rating - a.rating);
      const picks = [...byRating(top), ...byRating(second)].slice(0, 3);
      setRecommended({ category: ranked[0], products: picks });
    } catch {
      setRecommended({ category: ranked[0], products: [] });
    } finally {
      setLoading(false);
    }
  }

  function restart() {
    setStep(0);
    setScores({ Hair: 0, Skin: 0, Tools: 0 });
    setRecommended(null);
  }

  function handleAdd(id) {
    addItem(id);
    setAddedId(id);
    setTimeout(() => setAddedId(null), 1500);
  }

  return (
    <ProtectedRoute>
    <Layout cartCount={count}>
      <div className="max-w-[640px] mx-auto px-5 py-12 text-center">
        <div className="text-xs font-bold uppercase tracking-widest text-purple mb-1.5">Beauty quiz</div>
        <h1 className="font-serif text-3xl font-semibold mb-6">
          {done ? "Your matches are ready" : "Two minutes to your routine"}
        </h1>

        {!done ? (
          <div className="bg-white border border-lavender-deep rounded-2xl p-7">
            <div className="flex justify-center gap-1.5 mb-5">
              {QUIZ.map((_, i) => <div key={i} className={`w-[26px] h-1 rounded ${i <= step ? "bg-purple" : "bg-lavender-deep"}`} />)}
            </div>
            <div className="text-xs text-gray-400 mb-2">Question {step + 1} of {QUIZ.length}</div>
            <div className="font-serif text-xl mb-5">{QUIZ[step].q}</div>
            <div className="flex flex-col gap-2.5">
              {QUIZ[step].options.map((o) => (
                <button key={o.label} onClick={() => pick(o)}
                  className="px-4 py-3 rounded-xl border border-lavender-deep bg-lavender text-left text-sm font-semibold hover:border-purple hover:bg-purple-soft/20 transition-colors">
                  {o.label}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white border border-lavender-deep rounded-2xl p-7">
            <div className="text-4xl mb-2.5">✦</div>
            <p className="text-gray-500 mb-6">
              Based on your answers, we&apos;d start with our <span className="font-semibold text-purple">{recommended?.category}</span> picks:
            </p>

            {loading ? (
              <div className="text-sm text-gray-400 py-6">Finding your matches…</div>
            ) : recommended?.products?.length ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6 text-left">
                {recommended.products.map((p) => (
                  <div key={p._id} className="border border-lavender-deep rounded-2xl overflow-hidden">
                    <div className="h-24 overflow-hidden bg-lavender">
                      <img src={p.imageUrl.startsWith("http") ? p.imageUrl : `${API_BASE}${p.imageUrl}`}
                        alt={p.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="p-3">
                      <div className="font-bold text-sm leading-tight mb-1">{p.name}</div>
                      <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
                        <Star size={11} fill="#7C3AED" color="#7C3AED" /> {p.rating}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-serif text-sm font-semibold">${p.price}</span>
                        <button onClick={() => handleAdd(p._id)}
                          className="w-7 h-7 rounded-full bg-black text-white flex items-center justify-center">
                          <ShoppingBag size={12} />
                        </button>
                      </div>
                      {addedId === p._id && <div className="text-[11px] text-purple font-semibold mt-1">Added ✓</div>}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400 mb-6">No matching products in stock right now — check back soon.</p>
            )}

            <button onClick={restart} className="flex items-center gap-1.5 mx-auto px-[18px] py-2.5 rounded-full bg-black text-white font-bold text-sm">
              <RotateCcw size={13} /> Retake quiz
            </button>
          </div>
        )}
      </div>
    </Layout>
    </ProtectedRoute>
  );
}
