interface RiskGaugeProps {
  riskLevel: 'normal' | 'elevated' | 'critical';
  stationName: string;
  stationCode: string;
  description: string;
  etaMinutes: number | null;
  actionSteps?: string[];
}

/* ── Per-state design tokens ──────────────────────── */
const THEMES = {
  normal: {
    bg:         '#f0fdf4',
    border:     '#bbf7d0',
    iconBg:     '#dcfce7',
    iconColor:  '#15803d',
    titleColor: '#15803d',
    descColor:  '#166534',
    etaColor:   '#15803d',
    stepBg:     '#dcfce7',
    stepNum:    '#15803d',
    stepText:   '#166534',
  },
  elevated: {
    bg:         '#fffbeb',
    border:     '#fde68a',
    iconBg:     '#fef9c3',
    iconColor:  '#b45309',
    titleColor: '#b45309',
    descColor:  '#92400e',
    etaColor:   '#b45309',
    stepBg:     '#fef9c3',
    stepNum:    '#b45309',
    stepText:   '#92400e',
  },
  critical: {
    bg:         '#fef2f2',
    border:     '#fecaca',
    iconBg:     '#fee2e2',
    iconColor:  '#dc2626',
    titleColor: '#dc2626',
    descColor:  '#991b1b',
    etaColor:   '#dc2626',
    stepBg:     '#fee2e2',
    stepNum:    '#dc2626',
    stepText:   '#991b1b',
  },
} as const;

const TITLES = {
  normal:   'Your station is safe right now',
  elevated: 'Watch out — crowds are building',
  critical: 'Dangerous overcrowding likely',
};

/* ── State icons (inline SVG, no external deps) ─── */
function SafeIcon({ color, bg }: { color: string; bg: string }) {
  return (
    <div style={{
      width: 48, height: 48, borderRadius: '50%',
      backgroundColor: bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
    }}>
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none"
        stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M8 12l3 3 5-5" />
      </svg>
    </div>
  );
}

function WarningIcon({ color, bg }: { color: string; bg: string }) {
  return (
    <div style={{
      width: 48, height: 48, borderRadius: '50%',
      backgroundColor: bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
    }}>
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none"
        stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <circle cx="12" cy="16" r="0.8" fill={color} stroke="none" />
      </svg>
    </div>
  );
}

function DangerIcon({ color, bg }: { color: string; bg: string }) {
  return (
    <div style={{
      width: 48, height: 48, borderRadius: '50%',
      backgroundColor: bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
    }}>
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none"
        stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <circle cx="12" cy="17" r="0.8" fill={color} stroke="none" />
      </svg>
    </div>
  );
}

/* ── Pulsing ring for critical state ─────────────── */
function PulseRing({ color }: { color: string }) {
  return (
    <span style={{
      display: 'inline-block', width: 8, height: 8, borderRadius: '50%',
      backgroundColor: color, flexShrink: 0,
      animation: 'ss-pulse-ring 2s ease-out infinite',
    }} />
  );
}

/* ── Main component ──────────────────────────────── */
export function RiskGauge({
  riskLevel,
  stationName,
  stationCode,
  description,
  etaMinutes,
  actionSteps = [],
}: RiskGaugeProps) {
  const t = THEMES[riskLevel] ?? THEMES.normal;
  const title = TITLES[riskLevel];
  const showSteps = actionSteps.length > 0 && riskLevel !== 'normal';

  const Icon =
    riskLevel === 'critical' ? DangerIcon :
    riskLevel === 'elevated' ? WarningIcon : SafeIcon;

  /* ETA badge text */
  const etaBadge =
    riskLevel === 'normal'   ? 'No surge expected' :
    riskLevel === 'elevated' ? (etaMinutes ? `~${etaMinutes} min until it gets worse` : 'Monitor closely') :
    /* critical */              (etaMinutes ? `${etaMinutes} min to act` : 'Act immediately');

  const etaSub =
    riskLevel === 'critical' && etaMinutes ? 'before surge peaks' : null;

  return (
    <div style={{
      backgroundColor: t.bg,
      border: `1px solid ${t.border}`,
      borderRadius: '18px',
      padding: '22px 24px',
      fontFamily: 'Inter, system-ui, sans-serif',
      display: 'flex',
      flexDirection: 'column',
      gap: '18px',
      width: '100%',
      boxSizing: 'border-box',
      transition: 'border-color 0.3s, background-color 0.3s',
    }}>

      {/* ── Top row: icon + text + ETA badge ─────── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr auto',
        gap: '16px',
        alignItems: 'flex-start',
      }}>
        {/* Left: icon + title + description */}
        <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
          <Icon color={t.iconColor} bg={t.iconBg} />
          <div>
            {/* Station label */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              marginBottom: '6px',
            }}>
              {riskLevel === 'critical' && <PulseRing color={t.iconColor} />}
              <span style={{
                fontSize: '11px', fontWeight: 700, color: t.descColor,
                textTransform: 'uppercase', letterSpacing: '0.08em',
              }}>
                {stationName} · {stationCode}
              </span>
            </div>

            {/* Main title */}
            <h2 style={{
              fontSize: '22px', fontWeight: 600,
              color: t.titleColor, margin: 0,
              lineHeight: 1.2, letterSpacing: '-0.01em',
            }}>
              {title}
            </h2>

            {/* Description */}
            <p style={{
              fontSize: '13px', color: t.descColor,
              marginTop: '8px', lineHeight: 1.6, margin: '8px 0 0',
            }}>
              {description}
            </p>
          </div>
        </div>

        {/* Right: ETA badge */}
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'flex-end',
          gap: '4px', paddingTop: '4px', flexShrink: 0,
        }}>
          <span style={{
            fontSize: '15px', fontWeight: 700,
            color: t.etaColor, textAlign: 'right',
            whiteSpace: 'nowrap',
          }}>
            {etaBadge}
          </span>
          {etaSub && (
            <span style={{
              fontSize: '11px', color: t.descColor,
              textAlign: 'right', fontWeight: 500,
            }}>
              {etaSub}
            </span>
          )}
        </div>
      </div>

      {/* ── Action steps ─────────────────────────── */}
      {showSteps && (
        <div style={{
          display: 'flex', flexDirection: 'column', gap: '8px',
          paddingTop: '4px',
          borderTop: `1px solid ${t.border}`,
        }}>
          <span style={{
            fontSize: '10px', fontWeight: 700,
            color: t.descColor, textTransform: 'uppercase',
            letterSpacing: '0.1em', paddingTop: '8px',
          }}>
            Recommended Actions
          </span>
          {actionSteps.map((step, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'flex-start', gap: '10px',
              backgroundColor: t.stepBg,
              border: `1px solid ${t.border}`,
              borderRadius: '10px',
              padding: '10px 14px',
            }}>
              {/* Number circle */}
              <div style={{
                width: 22, height: 22, borderRadius: '50%',
                backgroundColor: t.stepNum, color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '11px', fontWeight: 700, flexShrink: 0, marginTop: '1px',
              }}>
                {i + 1}
              </div>
              <span style={{
                fontSize: '13px', color: t.stepText,
                lineHeight: 1.55, fontWeight: 500,
              }}>
                {step}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default RiskGauge;
