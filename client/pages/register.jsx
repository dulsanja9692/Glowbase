import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Layout from "../components/Layout";
import { useAuth } from "../context/AuthContext";

// Public registration always creates a "user" (customer) account.
// Admin/superadmin accounts are provisioned from the Super Admin dashboard.
export default function Register() {
  const { register } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [error, setError] = useState("");
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
      await register(form.name, form.email, form.password);
      router.push("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Layout>
      <div className="max-w-[420px] mx-auto px-5 py-16">
        <h1 className="font-serif text-3xl font-semibold mb-1.5 text-center">Create your account</h1>
        <p className="text-gray-500 text-sm text-center mb-8">Join GlowBase as a customer</p>

        <form onSubmit={onSubmit} className="bg-white border border-lavender-deep rounded-2xl p-6 flex flex-col gap-3.5">
          {error && <div className="bg-red-50 text-red-600 text-sm rounded-lg p-2.5">{error}</div>}
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase">Name</label>
            <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full mt-1 px-3.5 py-2.5 rounded-lg border border-lavender-deep text-sm" />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase">Email</label>
            <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full mt-1 px-3.5 py-2.5 rounded-lg border border-lavender-deep text-sm" />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase">Password</label>
            <input type="password" required minLength={6} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full mt-1 px-3.5 py-2.5 rounded-lg border border-lavender-deep text-sm" />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase">Confirm password</label>
            <input type="password" required minLength={6} value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              className="w-full mt-1 px-3.5 py-2.5 rounded-lg border border-lavender-deep text-sm" />
          </div>
          <button disabled={busy} type="submit" className="mt-2 py-3 rounded-full bg-black text-white font-bold text-sm">
            {busy ? "Creating…" : "Create account"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-5">
          Already have an account? <Link href="/login" className="text-purple font-semibold">Log in</Link>
        </p>
      </div>
    </Layout>
  );
}
