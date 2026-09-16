import Navbar from "./Navbar";
import Footer from "./Footer";
import SideRail from "./SideRail";

// Wraps every page: header, footer, and the decorative side rails
// that keep wide viewports from feeling empty.
export default function Layout({ children, cartCount }) {
  return (
    <div className="min-h-screen bg-lavender text-black relative">
      <SideRail side="left" />
      <SideRail side="right" />
      <div className="relative z-10">
        <Navbar cartCount={cartCount} />
        <main className="max-w-[1180px] mx-auto">{children}</main>
        <Footer />
      </div>
    </div>
  );
}
