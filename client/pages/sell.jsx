import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import Layout from "../components/Layout";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api";

// Public page — only prospective sellers (guests) can apply.
// Logged-in sellers and customers do not have access to this page.
export default function Sell() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "", businessName: "", message: "" });
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      if (user.role === "admin" || user.role === "superadmin") {
        router.replace("/dashboard");
      } else {
        router.replace("/shop");
      }
    }
  }, [user, loading, router]);

  if (user) {
    return (
      <Layout>
        <div className="max-w-[480px] mx-auto px-5 py-20 text-center">
          <div className="text-4xl mb-3">✦</div>
          <h1 className="font-serif text-2xl font-semibold mb-2">Access Restricted</h1>
          <p className="text-gray-500 text-sm mb-6">
            You are already signed in as <strong>{user.name}</strong> ({user.role === "admin" ? "Seller" : user.role === "superadmin" ? "Super Admin" : "Customer"}).
            The Sellers Program application page is only accessible to new applicants.
          </p>
          <Link
            href={user.role === "admin" || user.role === "superadmin" ? "/dashboard" : "/shop"}
            className="px-5 py-2.5 rounded-full bg-black text-white font-bold text-sm"
          >
            Go to {user.role === "admin" || user.role === "superadmin" ? "Dashboard" : "Shop"}
          </Link>
        </div>
      </Layout>
    );
  }

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

        <form onSubmit={onSubmit} className="bg-white border border-lavender-deep rounded-3xl p-6.5 p-[26px] flex flex-col gap-3.5">
          <Field label="Your name">
            <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="in" />
          </Field>
          <Field label="Business / brand name">
            <input required placeholder="e.g. Bandara Hair Studio" value={form.businessName} onChange={(e) => setForm({ ...form, businessName: e.target.value })} className="in" />
          </Field>
          <Field label="Email (this is how you'll log in)">
            <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="in" />
          </Field>
          <Field label="Choose a password">
            <input required type="password" minLength={6} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="in" />
          </Field>
          <Field label="Confirm password">
            <input required type="password" minLength={6} value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} className="in" />
          </Field>
          <Field label="Tell us about what you'd sell (optional)">
            <textarea rows={3} placeholder="A sentence or two about your product range" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="in" />
          </Field>

          {error && <div className="bg-red-50 text-red-600 text-xs font-semibold rounded-lg p-2.5">{error}</div>}

          <button disabled={busy} type="submit" className="w-full py-3 rounded-full bg-purple text-white font-bold text-sm mt-2">
            {busy ? "Submitting…" : "Submit application"}
          </button>
        </form>
      </div>
    </Layout>
  );
}

function Field({ label, children }) {
  return <div><label className="text-[11px] font-bold text-gray-500 uppercase">{label}</label>{children}</div>;
}
