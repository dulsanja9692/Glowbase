import { useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../context/AuthContext";

// Guards a page behind login + optional role check.
// Usage: <ProtectedRoute>...</ProtectedRoute>                    -> any logged-in user
//        <ProtectedRoute roles={["admin","superadmin"]}>...</ProtectedRoute> -> role-restricted
export default function ProtectedRoute({ children, roles }) {
  const { user, loading, verifySession } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) { router.replace("/login"); return; }
    if (roles && !roles.includes(user.role)) { router.replace("/login"); }
  }, [user, loading, roles, router]);

  useEffect(() => {
    // Guards against the browser back/forward-cache (bfcache) showing a
    // stale authenticated page after logout. When a page is restored from
    // bfcache instead of freshly rendered, re-check the session and bounce
    // to /login immediately if it's no longer valid.
    function onPageShow(event) {
      if (event.persisted) {
        verifySession().then((stillValid) => {
          if (!stillValid) router.replace("/login");
        });
      }
    }
    window.addEventListener("pageshow", onPageShow);
    return () => window.removeEventListener("pageshow", onPageShow);
  }, [router, verifySession]);

  if (loading || !user || (roles && !roles.includes(user.role))) {
    return <div className="py-24 text-center text-gray-400">Loading…</div>;
  }
  return children;
}
