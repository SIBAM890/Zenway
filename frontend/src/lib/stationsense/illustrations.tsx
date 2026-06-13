import type { CSSProperties } from "react";

export function TrainSilhouette({
  color = "#1a1a1a",
  delayed = false,
  width = 220,
  style,
}: {
  color?: string;
  delayed?: boolean;
  width?: number;
  style?: CSSProperties;
}) {
  return (
    <svg viewBox="0 0 220 56" width={width} style={style} aria-hidden>
      {/* nose */}
      <path
        d="M2 36 C 2 16, 22 6, 44 6 L 200 6 a 12 12 0 0 1 12 12 v 22 a 8 8 0 0 1 -8 8 H 10 a 8 8 0 0 1 -8 -8 z"
        fill={color}
      />
      {/* windshield */}
      <path d="M10 28 C 14 16, 28 12, 44 12 L 56 12 L 56 30 L 10 30 z" fill="#e8edf3" opacity="0.85" />
      {/* windows */}
      {Array.from({ length: 7 }).map((_, i) => (
        <rect key={i} x={66 + i * 20} y={14} width={14} height={14} rx={2} fill="#e8edf3" opacity="0.85" />
      ))}
      {/* door slits */}
      {Array.from({ length: 3 }).map((_, i) => (
        <rect key={i} x={70 + i * 50} y={30} width={1} height={10} fill="#0d0d0d" opacity="0.4" />
      ))}
      {/* wheels */}
      <circle cx="36" cy="50" r="6" fill="#0d0d0d" />
      <circle cx="84" cy="50" r="6" fill="#0d0d0d" />
      <circle cx="148" cy="50" r="6" fill="#0d0d0d" />
      <circle cx="190" cy="50" r="6" fill="#0d0d0d" />
      {delayed && (
        <>
          <circle cx="208" cy="14" r="6" fill="#dc2626">
            <animate attributeName="opacity" values="1;0.25;1" dur="1.2s" repeatCount="indefinite" />
          </circle>
        </>
      )}
    </svg>
  );
}

export function ClockIcon({ minutes }: { minutes: number }) {
  // angle: minute hand
  const angle = (minutes % 60) * 6;
  return (
    <svg viewBox="0 0 80 80" width={80} height={80} aria-hidden>
      <circle cx="40" cy="40" r="36" fill="#fff" stroke="#1a1a1a" strokeWidth="2" />
      {Array.from({ length: 12 }).map((_, i) => {
        const a = (i * 30 * Math.PI) / 180;
        const x1 = 40 + Math.sin(a) * 30;
        const y1 = 40 - Math.cos(a) * 30;
        const x2 = 40 + Math.sin(a) * 33;
        const y2 = 40 - Math.cos(a) * 33;
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#1a1a1a" strokeWidth="1.5" />;
      })}
      <line x1="40" y1="40" x2="40" y2="18" stroke="#dc2626" strokeWidth="2.5" strokeLinecap="round"
        style={{ transformOrigin: "40px 40px", transform: `rotate(${angle}deg)`, transition: "transform 0.8s ease" }} />
      <line x1="40" y1="40" x2="56" y2="40" stroke="#1a1a1a" strokeWidth="2" strokeLinecap="round" />
      <circle cx="40" cy="40" r="2.5" fill="#1a1a1a" />
    </svg>
  );
}

export function CrowdDots({ density, color = "#1a1a1a" }: { density: number; color?: string }) {
  // density 0..1
  const cols = 26;
  const rows = 7;
  const total = cols * rows;
  const filled = Math.round(density * total);
  return (
    <div className="ss-crowd-jitter grid" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 3 }}>
      {Array.from({ length: total }).map((_, i) => {
        const on = i < filled;
        const r = (i * 9301 + 49297) % 233280;
        const opacity = on ? 0.55 + ((r % 100) / 100) * 0.45 : 0;
        return (
          <div
            key={i}
            style={{
              width: 6, height: 6, borderRadius: 999,
              background: color, opacity,
              animationDelay: `${(r % 1600)}ms`,
            }}
          />
        );
      })}
    </div>
  );
}

export function StationDiagram({ critical = false }: { critical?: boolean }) {
  // Top-down platforms view
  const platforms = [9, 10, 11, 12, 13, 14, 15, 16];
  return (
    <svg viewBox="0 0 600 360" width="100%" aria-hidden>
      <defs>
        <pattern id="ss-cross" width="6" height="6" patternUnits="userSpaceOnUse">
          <path d="M0 6 L6 0" stroke="#dc2626" strokeWidth="0.5" opacity="0.4" />
        </pattern>
      </defs>
      {/* Concourse */}
      <rect x="0" y="0" width="600" height="36" fill="#e8e8ec" />
      <text x="12" y="22" fontSize="10" fontFamily="Inter, sans-serif" fill="#8e8e93" letterSpacing="1.5">
        MAIN CONCOURSE
      </text>
      {/* Footbridge */}
      <rect x="280" y="36" width="40" height="288" fill={critical ? "url(#ss-cross)" : "#f0f0f3"} stroke="#e8e8ec" />
      <text x="300" y="180" fontSize="9" fontFamily="Inter, sans-serif" fill={critical ? "#dc2626" : "#8e8e93"}
        textAnchor="middle" letterSpacing="1.5" transform="rotate(-90 300 180)">
        FOOTBRIDGE
      </text>

      {platforms.map((p, i) => {
        const y = 44 + i * 38;
        const isHot = critical && (p === 14 || p === 15);
        const isWarm = critical && p === 16;
        const fill = isHot ? "#fee2e2" : isWarm ? "#fef3c7" : "#f5f5f7";
        const stroke = isHot ? "#dc2626" : isWarm ? "#d97706" : "#e8e8ec";
        const trainColor = isHot ? "#dc2626" : "#1a1a1a";
        return (
          <g key={p}>
            <rect x="40" y={y} width="520" height="30" rx="4" fill={fill} stroke={stroke} />
            <text x="14" y={y + 19} fontSize="11" fontFamily="Inter, sans-serif" fill="#1a1a1a" fontWeight="600">
              {p}
            </text>
            {/* Train rectangle */}
            <rect x={isHot ? 60 : 80 + i * 8} y={y + 6} width={isHot ? 480 : 180} height="18" rx="2" fill={trainColor} opacity={isHot ? 0.9 : 0.7} />
            {/* Crowd dots between platforms (only for hot) */}
            {isHot && Array.from({ length: 50 }).map((_, j) => (
              <circle key={j} cx={50 + (j * 11) % 510} cy={y + 33 + ((j * 7) % 4)} r="1.4" fill="#dc2626" opacity="0.7" />
            ))}
          </g>
        );
      })}
    </svg>
  );
}

export function MovingTrain({ delay, color }: { delay: number; color: string }) {
  return (
    <div style={{ animation: `ss-train-move 12s linear infinite`, animationDelay: `${delay}s` }}>
      <TrainSilhouette color={color} width={180} />
    </div>
  );
}
