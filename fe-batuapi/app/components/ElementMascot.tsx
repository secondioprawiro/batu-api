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
      />
      <ellipse
        cx="44"
        cy="27"
        rx="13"
        ry="6"
        fill="#e8eef2"
        opacity="0.5"
        transform="rotate(-16 44 27)"
      />
      <path
        d="M28 46 l10 6 -4 9"
        stroke="#55626b"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.55"
      />
      <path
        d="M88 70 l-9 6 3 9"
        stroke="#55626b"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.55"
      />
      <Eyes
        eyes={[
          { cx: 45, cy: 54, rx: 10.5, ry: 12.5, px: 3, py: 2 },
          { cx: 75, cy: 52, rx: 11.5, ry: 13.5, px: 1, py: -2 },
        ]}
      />
      <Mouth points="47,82 53,76 59,82 65,76 71,82" color="#3c474e" />
    </>
  );
}

function Api({ id }: { id: string }) {
  return (
    <>
      <defs>
        <linearGradient id={`${id}-g`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffc14d" />
          <stop offset="55%" stopColor="#ff8a1e" />
          <stop offset="100%" stopColor="#f4511e" />
        </linearGradient>
        <linearGradient id={`${id}-core`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fff7c2" />
          <stop offset="100%" stopColor="#ffd166" />
        </linearGradient>
      </defs>
      <path
        d="M60 6 C62 18 72 24 78 34 C86 46 90 54 90 66 C90 87 77 102 60 104 C43 102 30 87 30 66 C30 54 34 46 42 34 C48 26 58 18 60 6 Z"
        fill={`url(#${id}-g)`}
      />
      <path
        d="M60 36 C64 46 74 52 74 66 C74 80 67 89 60 90 C53 89 46 80 46 66 C46 52 56 46 60 36 Z"
        fill={`url(#${id}-core)`}
        opacity="0.95"
      />
      <Eyes
        eyes={[
          { cx: 51, cy: 63, rx: 8.5, ry: 10.5, px: -2, py: 2 },
          { cx: 69, cy: 61, rx: 9.5, ry: 11.5, px: 3, py: 1 },
        ]}
      />
      <Mouth points="50,81 55,76 60,81 65,76 70,81" color="#8a3413" />
    </>
  );
}

function Air({ id }: { id: string }) {
  return (
    <>
      <defs>
        <linearGradient id={`${id}-g`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#b9ecff" />
          <stop offset="55%" stopColor="#54c6ff" />
          <stop offset="100%" stopColor="#1f8fd1" />
        </linearGradient>
      </defs>
      <path
        d="M60 8 C70 28 94 48 94 72 C94 92 79 106 60 106 C41 106 26 92 26 72 C26 48 50 28 60 8 Z"
        fill={`url(#${id}-g)`}
      />
      <ellipse
        cx="42"
        cy="48"
        rx="6.5"
        ry="13"
        fill="#ffffff"
        opacity="0.45"
        transform="rotate(-22 42 48)"
      />
      <circle cx="78" cy="44" r="3.2" fill="#ffffff" opacity="0.5" />
      <Eyes
        eyes={[
          { cx: 48, cy: 66, rx: 9.5, ry: 11.5, px: -3, py: -2 },
          { cx: 72, cy: 64, rx: 10.5, ry: 12.5, px: -1, py: -3 },
        ]}
      />
      <Mouth points="48,87 54,82 60,87 66,82 72,87" color="#0e4d73" />
    </>
  );
}

function Daun({ id }: { id: string }) {
  return (
    <>
      <defs>
        <linearGradient id={`${id}-g`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#b4ef96" />
          <stop offset="55%" stopColor="#66cb6b" />
          <stop offset="100%" stopColor="#2f9148" />
        </linearGradient>
      </defs>
      <path
        d="M60 10 C57 4 52 1 46 3"
        stroke="#2f9148"
        strokeWidth="5"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M60 8 C86 26 98 54 92 78 C87 98 74 108 60 110 C46 108 33 98 28 78 C22 54 34 26 60 8 Z"
        fill={`url(#${id}-g)`}
      />
      <g stroke="#1f7a39" strokeWidth="3" opacity="0.5" strokeLinecap="round">
        <path d="M60 24 L60 98" />
        <path d="M60 44 L76 54" />
        <path d="M60 44 L44 54" />
        <path d="M60 66 L78 76" />
        <path d="M60 66 L42 76" />
      </g>
      <Eyes
        eyes={[
          { cx: 48, cy: 58, rx: 9.5, ry: 11.5, px: 2, py: -1 },
          { cx: 72, cy: 56, rx: 10.5, ry: 12.5, px: 2, py: 2 },
        ]}
      />
      <Mouth points="48,82 54,77 60,82 66,77 72,82" color="#1c5e31" />
    </>
  );
}

const BODIES: Record<ElementKey, (props: { id: string }) => React.ReactNode> = {
  batu: Batu,
  api: Api,
  air: Air,
  daun: Daun,
};

export default function ElementMascot({
  element,
  className,
  idPrefix,
}: MascotProps) {
  const id = idPrefix ?? element;
  const Body = BODIES[element];
  return (
    <svg
      viewBox="0 0 120 120"
      className={className}
      role="img"
      aria-label={`Maskot elemen ${element}`}
    >
      <Body id={id} />
    </svg>
  );
}
