interface SXLogoProps {
  size?: number;
  /** Show the text "StationSense" beside the icon */
  withText?: boolean;
  /** Color scheme: 'dark' = navy bg (default), 'light' = white bg with navy text */
  variant?: 'dark' | 'light';
}

export function SXLogo({ size = 36, withText = false, variant = 'dark' }: SXLogoProps) {
  const isDark = variant === 'dark';
  const bgColor = isDark ? '#1e3a8a' : '#ffffff';
  const rail1Color = isDark ? '#ffffff' : '#1e3a8a';
  const rail2Color = isDark ? '#60a5fa' : '#2563eb';
  const sleeperColor = isDark ? '#ffffff' : '#1e3a8a';
  const borderStyle = isDark ? {} : { border: '1.5px solid #e8e8ec' };

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ flexShrink: 0, borderRadius: '50%', ...borderStyle }}
        aria-label="S Railway logo"
      >
        {/* Background circle */}
        <circle cx="32" cy="32" r="32" fill={bgColor} />

        {/* Outer Rail of the S */}
        <path d="M 44,18 C 26,18 20,24 20,32 C 20,40 44,40 44,48 C 44,56 38,62 20,62" 
              stroke={rail1Color} strokeWidth="3" strokeLinecap="round" fill="none"/>

        {/* Inner Rail of the S */}
        <path d="M 44,24 C 32,24 26,28 26,32 C 26,36 38,36 38,48 C 38,54 32,56 20,56" 
              stroke={rail2Color} strokeWidth="3" strokeLinecap="round" fill="none"/>

        {/* Track Sleepers (Crossbars linking the two rails of the S) */}
        <line x1="44" y1="21" x2="44" y2="21.5" stroke={sleeperColor} strokeWidth="2.5" strokeLinecap="round"/>
        <path d="M 38,21 L 35,25" stroke={sleeperColor} strokeWidth="2.5" strokeLinecap="round"/>
        <path d="M 29,22 L 28,26" stroke={sleeperColor} strokeWidth="2.5" strokeLinecap="round"/>
        <path d="M 23,28 L 26,29" stroke={sleeperColor} strokeWidth="2.5" strokeLinecap="round"/>
        <path d="M 25,34 L 28,34" stroke={sleeperColor} strokeWidth="2.5" strokeLinecap="round"/>
        <path d="M 32,36 L 32,38" stroke={sleeperColor} strokeWidth="2.5" strokeLinecap="round"/>
        <path d="M 39,40 L 36,42" stroke={sleeperColor} strokeWidth="2.5" strokeLinecap="round"/>
        <path d="M 41,46 L 38,47" stroke={sleeperColor} strokeWidth="2.5" strokeLinecap="round"/>
        <path d="M 38,52 L 35,53" stroke={sleeperColor} strokeWidth="2.5" strokeLinecap="round"/>
        <path d="M 29,55 L 29,59" stroke={sleeperColor} strokeWidth="2.5" strokeLinecap="round"/>

        {/* Live Green Indicator Dot */}
        <circle cx="50" cy="14" r="4" fill="#22c55e" />
      </svg>

      {withText && (
        <span style={{
          fontSize: size * 0.42,
          fontWeight: 700,
          color: '#1a1a1a',
          letterSpacing: '-0.02em',
          fontFamily: 'Inter, system-ui, sans-serif',
          lineHeight: 1,
        }}>
          Station<span style={{ color: '#2563eb' }}>Sense</span>
        </span>
      )}
    </div>
  );
}

export default SXLogo;
