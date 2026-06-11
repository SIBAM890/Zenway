interface AlertCardProps {
  alertText: string;
  riskLevel: string;
  timestamp: string;
  onBroadcast: () => void;
}

const colorMap: Record<string, { bg: string; border: string; textColor: string; accentColor: string; leftBorder: string }> = {
  critical: { bg: '#eff6ff', border: '#e2e8f0', textColor: '#1e40af', accentColor: '#2563eb', leftBorder: '#2563eb' },
  elevated: { bg: '#fffbeb', border: '#e2e8f0', textColor: '#92400e', accentColor: '#d97706', leftBorder: '#d97706' },
  normal: { bg: '#f0fdf4', border: '#e2e8f0', textColor: '#14532d', accentColor: '#16a34a', leftBorder: '#16a34a' }
};

export function AlertCard({ alertText, riskLevel, timestamp, onBroadcast }: AlertCardProps) {
  const normRisk = (riskLevel || 'normal').toLowerCase();
  const colors = colorMap[normRisk] || colorMap.normal;

  const handleCopy = () => {
    navigator.clipboard.writeText(alertText).catch((err) => {
      console.error('Failed to copy text: ', err);
    });
  };

  const getRgbaAccent = (hex: string) => {
    if (hex === '#2563eb') return 'rgba(37, 99, 235, 0.6)';
    if (hex === '#d97706') return 'rgba(217, 119, 6, 0.6)';
    if (hex === '#16a34a') return 'rgba(22, 163, 74, 0.6)';
    return 'rgba(0, 0, 0, 0.6)';
  };

  return (
    <div style={{
      borderRadius: '16px',
      border: `1px solid ${colors.border}`,
      borderLeft: `5px solid ${colors.leftBorder}`,
      backgroundColor: '#ffffff',
      padding: '16px 18px',
      fontFamily: 'Inter, sans-serif',
      boxSizing: 'border-box',
      width: '100%',
      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05)'
    }}>
      {/* Header Row */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '10px'
      }}>
        {/* Warning triangle icon SVG */}
        <svg
          viewBox="0 0 24 24"
          width="16"
          height="16"
          fill="none"
          stroke={colors.accentColor}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>

        <span style={{
          fontSize: '11px',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          color: colors.accentColor
        }}>
          AI OPS ALERT
        </span>

        <span style={{
          fontSize: '10px',
          color: getRgbaAccent(colors.accentColor),
          marginLeft: 'auto',
          fontWeight: 600
        }}>
          {timestamp}
        </span>
      </div>

      {/* Alert Text */}
      <div style={{
        fontSize: '13px',
        color: '#334155',
        lineHeight: 1.6,
        marginBottom: '14px',
        fontWeight: 500
      }}>
        {alertText}
      </div>

      {/* Actions Row */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        <button
          onClick={onBroadcast}
          style={{
            backgroundColor: colors.accentColor,
            color: '#ffffff',
            border: 'none',
            borderRadius: '8px',
            fontSize: '12px',
            fontWeight: 700,
            padding: '8px 16px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: `0 2px 4px ${colors.accentColor}33`
          }}
          onMouseOver={(e) => (e.currentTarget.style.opacity = '0.9')}
          onMouseOut={(e) => (e.currentTarget.style.opacity = '1')}
        >
          Broadcast alert
        </button>

        <button
          onClick={handleCopy}
          style={{
            backgroundColor: '#f1f5f9',
            border: 'none',
            borderRadius: '8px',
            color: '#475569',
            fontSize: '12px',
            fontWeight: 600,
            padding: '8px 14px',
            cursor: 'pointer',
            transition: 'background-color 0.2s'
          }}
          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#e2e8f0')}
          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#f1f5f9')}
        >
          Copy Text
        </button>
      </div>
    </div>
  );
}
