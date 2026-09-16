// Purely decorative side rails that fill the empty margins on wide screens.
export default function SideRail({ side }) {
  const isLeft = side === "left";
  return (
    <div
      aria-hidden="true"
      className={`hidden xl:block fixed top-0 ${isLeft ? "left-0" : "right-0"} h-full w-[130px] pointer-events-none z-0 overflow-hidden`}
    >
      <svg width="130" height="100%" viewBox="0 0 130 900" preserveAspectRatio="xMidYMin slice" className="absolute top-0">
        <defs>
          <linearGradient id={`rail-grad-${side}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#7C3AED" stopOpacity="0.16" />
            <stop offset="100%" stopColor="#0E0812" stopOpacity="0.06" />
          </linearGradient>
        </defs>
        <circle cx={isLeft ? 40 : 90} cy="90" r="70" fill={`url(#rail-grad-${side})`} />
        <circle cx={isLeft ? 20 : 110} cy="340" r="46" fill="#D9C6F7" opacity="0.25" />
        <path
          d={`M ${isLeft ? 10 : 120} 460 Q ${isLeft ? 70 : 60} 560 ${isLeft ? 15 : 115} 660`}
          stroke="#7C3AED" strokeWidth="2" fill="none" opacity="0.3" strokeDasharray="4 8"
        />
        <circle cx={isLeft ? 55 : 75} cy="760" r="5" fill="#7C3AED" opacity="0.5" />
        <circle cx={isLeft ? 30 : 100} cy="800" r="3" fill="#9333EA" opacity="0.6" />
      </svg>
    </div>
  );
}
