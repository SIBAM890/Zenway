interface PlatformData {
  number: number;
  occupancyPercent: number;
}

interface PlatformGridProps {
  platforms: PlatformData[];
}

export function PlatformGrid({ platforms }: PlatformGridProps) {


  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', fontFamily: 'Inter, sans-serif' }}>
      {/* Section Label */}
      <div style={{
        fontSize: '11px',
        fontWeight: 700,
        color: '#64748b',
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        marginBottom: '8px',
        display: 'flex',
        alignItems: 'center',
        gap: '4px'
      }}>
        <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 6v6l4 2" />
        </svg>
        Platform load status
      </div>

      {/* Outer Wrapper */}
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        overflow: 'hidden',
        boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.05)'
      }}>
        {/* Grid Inside */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '1px',
          backgroundColor: '#e2e8f0'
        }}>
          {platforms.map((platform) => {
            const platformColor = platform.occupancyPercent >= 70 
              ? '#dc2626' 
              : platform.occupancyPercent >= 45 
                ? '#d97706' 
                : '#8e8e93';
            return (
              <div
                key={platform.number}
                style={{
                  backgroundColor: '#ffffff',
                  padding: '14px 8px',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background-color 0.2s ease'
                }}
                onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
                onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#ffffff')}
              >
                {/* Platform Number */}
                <div style={{
                  fontSize: '22px',
                  fontWeight: 600,
                  color: platformColor,
                  marginBottom: '2px'
                }}>
                  {platform.number}
                </div>

                {/* Percentage Text */}
                <div style={{
                  fontSize: '11px',
                  color: '#8e8e93',
                  marginTop: '1px'
                }}>
                  {platform.occupancyPercent}%
                </div>

                {/* Progress Bar */}
                <div style={{
                  height: '4px',
                  width: '100%',
                  backgroundColor: '#f1f5f9',
                  borderRadius: '2px',
                  marginTop: '8px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${Math.min(100, Math.max(0, platform.occupancyPercent))}%`,
                    height: '100%',
                    backgroundColor: platformColor,
                    borderRadius: '2px'
                  }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
