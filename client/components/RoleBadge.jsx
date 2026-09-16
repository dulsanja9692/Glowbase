import { User, ShieldCheck, Crown } from "lucide-react";

const ROLES = {
  user: { label: "Customer", icon: User, cls: "bg-purple-soft/50 text-purple-deep border border-purple/40" },
  admin: { label: "Admin · Seller", icon: ShieldCheck, cls: "bg-purple text-white" },
  superadmin: { label: "Super Admin", icon: Crown, cls: "bg-gradient-to-br from-black to-purple text-white" },
};

export default function RoleBadge({ role, size = "sm" }) {
  const cfg = ROLES[role] || ROLES.user;
  const Icon = cfg.icon;
  const padding = size === "sm" ? "px-2.5 py-1 text-[11px]" : "px-3.5 py-1.5 text-[13px]";
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-semibold ${padding} ${cfg.cls}`}>
      <Icon size={size === "sm" ? 12 : 14} /> {cfg.label}
    </span>
  );
}
