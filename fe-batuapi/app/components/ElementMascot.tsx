import type { ElementKey } from "@/app/lib/elements";

type EyeSpec = {
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  /** offset pupil — bikin tatapan googly khas maskot game */
  px: number;
  py: number;
};

type MascotProps = {
  element: ElementKey;
  className?: string;
  /** Prefix unik untuk id gradient saat maskot yang sama dirender lebih dari sekali */
  idPrefix?: string;
};

function Eyes({ eyes }: { eyes: [EyeSpec, EyeSpec] }) {
  return (
    <g>
      {eyes.map((e, i) => (
        <g key={i}>
          <ellipse cx={e.cx} cy={e.cy} rx={e.rx} ry={e.ry} fill="#ffffff" />
          <circle
            cx={e.cx + e.px}
            cy={e.cy + e.py}
            r={Math.min(e.rx, e.ry) * 0.42}
            fill="#14181c"
          />
          <circle
            cx={e.cx + e.px - 1.6}
            cy={e.cy + e.py - 1.8}
            r={1.4}
            fill="#ffffff"
            opacity={0.9}
          />
        </g>
      ))}
    </g>
  );
}

function Mouth({ points, color }: { points: string; color: string }) {
  return (
    <polyline
      points={points}
      fill="none"
      stroke={color}
      strokeWidth={3.4}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  );
}

function Batu({ id }: { id: string }) {
  return (
    <>
      <defs>
        <linearGradient id={`${id}-g`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#cdd7dd" />
          <stop offset="55%" stopColor="#97a5ad" />
          <stop offset="100%" stopColor="#66747d" />
        </linearGradient>
      </defs>
      <path
        d="M60 12 C78 10 96 22 102 40 C108 58 106 80 92 94 C78 108 46 110 30 98 C14 86 10 64 16 44 C22 24 42 14 60 12 Z"
        fill={`url(#${id}-g)`}
