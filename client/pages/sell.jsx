import { useState } from "react";
import Link from "next/link";
import Layout from "../components/Layout";
import { api } from "../lib/api";

// Public page — anyone can apply to become a seller (Admin). They set
// their own email and password here; nothing is typed on their behalf
// by a Super Admin. A Super Admin reviews and approves/rejects from
// Dashboard → Team & Access.
export default function Sell() {
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "", businessName: "", message: "" });
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirmPassword) {
      setError("Passwords don't match.");
      return;
    }
    setBusy(true);
    try {
      const { confirmPassword, ...payload } = form;
      await api("/seller-requests", { method: "POST", body: payload });
      setSubmitted(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  if (submitted) {
    return (
      <Layout>
        <div className="max-w-[480px] mx-auto px-5 py-20 text-center">
          <div className="text-4xl mb-3">✦</div>
          <h1 className="font-serif text-2xl font-semibold mb-2">Application submitted</h1>
          <p className="text-gray-500 text-sm mb-6">
            A Super Admin will review your details and get back to you. Once approved, log in with the
            email and password you just set — your seller dashboard will be ready.
          </p>
          <Link href="/login" className="px-5 py-2.5 rounded-full bg-black text-white font-bold text-sm">Back to login</Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-[480px] mx-auto px-5 py-14">
        <div className="text-xs font-bold uppercase tracking-widest text-purple mb-1.5 text-center">Sellers program</div>
        <h1 className="font-serif text-3xl font-semibold mb-1.5 text-center">Become a GlowBase seller</h1>
        <p className="text-gray-500 text-sm text-center mb-8">
          Tell us about your brand. Choose the email and password you&apos;ll log in with — a Super Admin
          reviews every application before it goes live.
        </p>

        <form onSubmit={onSubmit} className="bg-white border border-lavender-deep rounded-2xl p-6 flex flex-col gap-3.5">
          {error && <div className="bg-red-50 text-red-600 text-sm rounded-lg p-2.5">{error}</div>}
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase">Your name</label>
            <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full mt-1 px-3.5 py-2.5 rounded-lg border border-lavender-deep text-sm" />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase">Business / brand name</label>
            <input required value={form.businessName} onChange={(e) => setForm({ ...form, businessName: e.target.value })}
              placeholder="e.g. Bandara Hair Studio"
              className="w-full mt-1 px-3.5 py-2.5 rounded-lg border border-lavender-deep text-sm" />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase">Email (this is how you&apos;ll log in)</label>
            <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full mt-1 px-3.5 py-2.5 rounded-lg border border-lavender-deep text-sm" />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase">Choose a password</label>
            <input type="password" required minLength={6} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full mt-1 px-3.5 py-2.5 rounded-lg border border-lavender-deep text-sm" />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase">Confirm password</label>
            <input type="password" required minLength={6} value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              className="w-full mt-1 px-3.5 py-2.5 rounded-lg border border-lavender-deep text-sm" />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase">Tell us about what you&apos;d sell (optional)</label>
            <textarea rows={3} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })}
              className="w-full mt-1 px-3.5 py-2.5 rounded-lg border border-lavender-deep text-sm resize-none" />
          </div>
          <button disabled={busy} type="submit" className="mt-2 py-3 rounded-full bg-black text-white font-bold text-sm">
            {busy ? "Submitting…" : "Submit application"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-5">
          Already approved? <Link href="/login" className="text-purple font-semibold">Log in</Link>
        </p>
      </div>
    </Layout>
  );
}
