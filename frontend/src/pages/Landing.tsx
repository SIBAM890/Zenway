
export const navigate = (path: string) => {
  window.history.pushState({}, '', path);
  const event = new Event('pushstate-changed');
  window.dispatchEvent(event);
};

export default function Landing() {
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#ffffff',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      fontFamily: "'Inter', sans-serif",
      padding: '40px 20px',
      boxSizing: 'border-box'
    }}>
      <div style={{
        maxWidth: '640px',
        width: '100%',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
        {/* TOP Badge */}
        <div style={{
          backgroundColor: '#fef2f2',
          color: '#dc2626',
          borderRadius: '20px',
          fontSize: '11px',
          fontWeight: 600,
          padding: '5px 12px',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          🔴 18 fatalities · New Delhi Station · Feb 2025
        </div>

        {/* HEADLINE */}
        <h1 style={{
          marginTop: '20px',
          fontSize: '36px',
          fontWeight: 600,
          color: '#1a1a1a',
          letterSpacing: '-0.02em',
          lineHeight: '1.2',
          textAlign: 'center',
          marginRight: 0,
          marginLeft: 0,
          marginBottom: 0
        }}>
          Detect crowd surges before they become disasters.
        </h1>

        {/* SUBTEXT */}
        <p style={{
          marginTop: '12px',
          fontSize: '15px',
          color: '#8e8e93',
          textAlign: 'center',
          lineHeight: '1.6',
          maxWidth: '480px',
          marginLeft: 'auto',
          marginRight: 'auto',
          marginBottom: 0
        }}>
          StationSense monitors delayed train data in real-time and predicts dangerous platform overcrowding — giving station managers time to act.
        </p>

        {/* CTA BUTTON */}
        <div style={{ display: 'flex', gap: '16px', marginTop: '32px' }}>
          <button 
            onClick={() => navigate('/dashboard')}
            style={{
              backgroundColor: '#1a1a1a',
              color: '#ffffff',
              border: 'none',
              borderRadius: '12px',
              padding: '16px 32px',
              fontSize: '16px',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: '0 4px 14px rgba(0, 0, 0, 0.1)',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.15)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 14px rgba(0, 0, 0, 0.1)';
            }}
          >
            Crowd AI Dashboard →
          </button>
          
          <button 
            onClick={() => navigate('/ops-dashboard')}
            style={{
              backgroundColor: '#4f46e5',
              color: '#ffffff',
              border: 'none',
              borderRadius: '12px',
              padding: '16px 32px',
              fontSize: '16px',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: '0 4px 14px rgba(79, 70, 229, 0.3)',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(79, 70, 229, 0.4)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 14px rgba(79, 70, 229, 0.3)';
            }}
          >
            Ops Dashboard (Feature 2) →
          </button>
        </div>

        {/* THREE STAT PILLS */}
        <div style={{
          marginTop: '32px',
          display: 'flex',
          gap: '12px',
          justifyContent: 'center',
          flexWrap: 'wrap',
          width: '100%'
        }}>
          <div style={{
            backgroundColor: '#f5f5f7',
            borderRadius: '8px',
            padding: '8px 16px',
            fontSize: '12px',
            color: '#8e8e93',
            fontWeight: 500
          }}>
            🚆 Live train data
          </div>
          <div style={{
            backgroundColor: '#f5f5f7',
            borderRadius: '8px',
            padding: '8px 16px',
            fontSize: '12px',
            color: '#8e8e93',
            fontWeight: 500
          }}>
            ⚡ Real-time surge scoring
          </div>
          <div style={{
            backgroundColor: '#f5f5f7',
            borderRadius: '8px',
            padding: '8px 16px',
            fontSize: '12px',
            color: '#8e8e93',
            fontWeight: 500
          }}>
            🔔 AI-generated alerts
          </div>
        </div>

        {/* BOTTOM */}
        <div style={{
          marginTop: '40px',
          fontSize: '11px',
          color: '#c7c7cc',
          textAlign: 'center',
          fontWeight: 500
        }}>
          Built for FAR AWAY 2026 · India's Biggest International Hackathon
        </div>
      </div>
    </div>
  );
}
