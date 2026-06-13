interface AlertCardProps {
  alertText: string;
  riskLevel: string;
  timestamp: string;
  onBroadcast: () => void;
}

const THEMES = {
  critical: {
    border:    '#fecaca',
    leftBorder:'#dc2626',
    accentColor:'#dc2626',
    headerColor:'#dc2626',
    btnBg:     '#dc2626',
    iconStroke:'#dc2626',
  },
  elevated: {
    border:    '#fde68a',
    leftBorder:'#d97706',
    accentColor:'#d97706',
    headerColor:'#d97706',
    btnBg:     '#d97706',
    iconStroke:'#d97706',
  },
  normal: {
    border:    '#bbf7d0',
    leftBorder:'#16a34a',
    accentColor:'#16a34a',
    headerColor:'#16a34a',
    btnBg:     '#16a34a',
    iconStroke:'#16a34a',
  },
};

export function AlertCard({ alertText, riskLevel, timestamp, onBroadcast }: AlertCardProps) {
  const key = (riskLevel || 'normal').toLowerCase() as keyof typeof THEMES;
  const t = THEMES[key] ?? THEMES.normal;

  const handleCopy = () => {
    navigator.clipboard.writeText(alertText).catch(console.error);
  };

  return (
    <div style={{
      borderRadius: '16px',
      border: `1px solid ${t.border}`,
      borderLeft: `5px solid ${t.leftBorder}`,
      backgroundColor: '#ffffff',
      padding: '16px 18px',
      fontFamily: 'Inter, sans-serif',
      boxSizing: 'border-box',
      width: '100%',
      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)',
    }}>

      {/* Header Row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
        {/* Icon — triangle for critical/elevated, check for normal */}
        {key === 'normal' ? (
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none"
            stroke={t.iconStroke} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M8 12l3 3 5-5" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none"
            stroke={t.iconStroke} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        )}

        <span style={{
          fontSize: '11px', fontWeight: 700,
          textTransform: 'uppercase', letterSpacing: '0.08em',
          color: t.headerColor,
        }}>
          Alert ready to send
        </span>

        <span style={{
          fontSize: '10px', color: t.accentColor + '99',
          marginLeft: 'auto', fontWeight: 600,
        }}>
          {timestamp}
        </span>
      </div>

      {/* Alert Text */}
      <div style={{
        fontSize: '13px', color: '#334155',
        lineHeight: 1.65, marginBottom: '14px', fontWeight: 500,
      }}>
        {alertText}
      </div>

      {/* Actions Row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <button
          onClick={onBroadcast}
          style={{
            backgroundColor: t.btnBg, color: '#ffffff', border: 'none',
            borderRadius: '8px', fontSize: '12px', fontWeight: 700,
            padding: '9px 16px', cursor: 'pointer',
            width: '100%', transition: 'opacity 0.2s',
            boxShadow: `0 2px 4px ${t.btnBg}44`,
          }}
          onMouseOver={e => (e.currentTarget.style.opacity = '0.88')}
          onMouseOut={e  => (e.currentTarget.style.opacity = '1')}
        >
          Send this alert to station manager
        </button>

        <button
          onClick={handleCopy}
          title="Copy text"
          style={{
            backgroundColor: '#f1f5f9', border: 'none', borderRadius: '8px',
            color: '#475569', fontSize: '12px', fontWeight: 600,
            padding: '9px 14px', cursor: 'pointer', flexShrink: 0,
            transition: 'background-color 0.2s',
          }}
          onMouseOver={e => (e.currentTarget.style.backgroundColor = '#e2e8f0')}
          onMouseOut={e  => (e.currentTarget.style.backgroundColor = '#f1f5f9')}
        >
          Copy
        </button>
      </div>
    </div>
  );
}

export default AlertCard;
