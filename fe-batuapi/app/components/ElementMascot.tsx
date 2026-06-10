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
