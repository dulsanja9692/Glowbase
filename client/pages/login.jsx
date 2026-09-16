import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Layout from "../components/Layout";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError(""); setBusy(true);
    try {
      await login(email, password);
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
        <h1 className="font-serif text-3xl font-semibold mb-1.5 text-center">Welcome back</h1>
        <p className="text-gray-500 text-sm text-center mb-8">Log in to your GlowBase account</p>

        <form onSubmit={onSubmit} className="bg-white border border-lavender-deep rounded-2xl p-6 flex flex-col gap-3.5">
          {error && <div className="bg-red-50 text-red-600 text-sm rounded-lg p-2.5">{error}</div>}
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase">Email</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full mt-1 px-3.5 py-2.5 rounded-lg border border-lavender-deep text-sm" />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase">Password</label>
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full mt-1 px-3.5 py-2.5 rounded-lg border border-lavender-deep text-sm" />
          </div>
          <button disabled={busy} type="submit" className="mt-2 py-3 rounded-full bg-black text-white font-bold text-sm">
            {busy ? "Logging in…" : "Log in"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-5">
          New here? <Link href="/register" className="text-purple font-semibold">Create an account</Link>
        </p>
        <p className="text-center text-sm text-gray-500 mt-2">
          Want to sell on GlowBase? <Link href="/sell" className="text-purple font-semibold">Apply here</Link>
        </p>
        <p className="text-center text-sm text-gray-500 mt-2"></p>
      </div>
    </Layout>
  );
}
