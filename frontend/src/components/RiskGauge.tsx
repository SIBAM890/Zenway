interface RiskGaugeProps {
  score: number;
  riskLevel: string;
  description: string;
  etaMinutes: number | null;
}

export function RiskGauge({ score, riskLevel, description, etaMinutes }: RiskGaugeProps) {
  // Determine background color based on riskLevel
  const getBackgroundColor = () => {
    switch (riskLevel) {
      case 'critical':
        return '#2563eb';
      case 'elevated':
        return '#b45309';
      case 'normal':
      default:
        return '#16a34a';
    }
  };

  // Determine title based on riskLevel
  const getTitle = () => {
    switch (riskLevel) {
      case 'critical':
        return 'Critical — act now';
      case 'elevated':
        return 'Elevated — monitor closely';
      case 'normal':
      default:
        return 'Normal — all clear';
    }
  };

  return (
    <div style={{
      borderRadius: '14px',
      padding: '18px 20px',
      backgroundColor: getBackgroundColor(),
      display: 'grid',
      gridTemplateColumns: '1fr auto',
      gap: '12px',
      alignItems: 'center',
      width: '100%',
      fontFamily: 'Inter, sans-serif',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Subtle background SVG illustration */}
      <svg
        style={{
          position: 'absolute',
          right: 0,
          bottom: 0,
          opacity: 0.08,
          pointerEvents: 'none',
          height: '100%',
          overflow: 'hidden'
        }}
        viewBox="0 0 300 120"
        fill="none"
        stroke="#ffffff"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* Train tracks/platform line */}
        <line x1="0" y1="100" x2="300" y2="100" />
        <line x1="0" y1="108" x2="300" y2="108" />
        
        {/* Train outline */}
        <path d="M 0 30 L 120 30 C 135 30, 145 40, 145 55 L 145 100 L 0 100 Z" />
        <rect x="15" y="45" width="20" height="20" rx="3" />
        <rect x="45" y="45" width="20" height="20" rx="3" />
        <rect x="75" y="45" width="20" height="20" rx="3" />
        <rect x="105" y="45" width="20" height="20" rx="3" />
        
        {/* Platform pillar */}
        <line x1="200" y1="30" x2="200" y2="100" />
        <line x1="200" y1="30" x2="280" y2="30" />
        
        {/* Stick figures (people) */}
        {/* Person 1 */}
        <circle cx="170" cy="70" r="5" />
        <line x1="170" y1="75" x2="170" y2="90" />
        <line x1="165" y1="80" x2="175" y2="80" />
        <line x1="170" y1="90" x2="167" y2="100" />
        <line x1="170" y1="90" x2="173" y2="100" />
        
        {/* Person 2 */}
        <circle cx="220" cy="65" r="5" />
        <line x1="220" y1="70" x2="220" y2="85" />
        <line x1="215" y1="75" x2="225" y2="75" />
        <line x1="220" y1="85" x2="217" y2="98" />
        <line x1="220" y1="85" x2="223" y2="98" />
        
        {/* Person 3 */}
        <circle cx="250" cy="72" r="5" />
        <line x1="250" y1="77" x2="250" y2="92" />
        <line x1="245" y1="82" x2="255" y2="82" />
        <line x1="250" y1="92" x2="247" y2="100" />
        <line x1="250" y1="92" x2="253" y2="100" />
      </svg>
      {/* Left side */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
        <span style={{
          fontSize: '11px',
          color: 'rgba(255, 255, 255, 0.6)',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          marginBottom: '4px'
        }}>
          Surge risk
        </span>
        <h2 style={{
          fontSize: '22px',
          fontWeight: 600,
          color: '#fff',
          letterSpacing: '-0.01em',
          lineHeight: '1.1',
          margin: 0
        }}>
          {getTitle()}
        </h2>
        <p style={{
          fontSize: '12px',
          color: 'rgba(255, 255, 255, 0.65)',
          marginTop: '6px',
          lineHeight: '1.5',
          margin: 0
        }}>
          {description}
        </p>
      </div>

      {/* Right side */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
        <span style={{
          fontSize: '10px',
          color: 'rgba(255, 255, 255, 0.6)',
          textTransform: 'uppercase',
          letterSpacing: '0.06em'
        }}>
          Score
        </span>
        <span style={{
          fontSize: '44px',
          fontWeight: 600,
          color: '#fff',
          letterSpacing: '-0.02em',
          lineHeight: '1',
          textAlign: 'right'
        }}>
          {score}
        </span>
        <span style={{
          fontSize: '11px',
          color: 'rgba(255, 255, 255, 0.6)',
          textAlign: 'right'
        }}>
          / 100
        </span>
      </div>
    </div>
  );
}
