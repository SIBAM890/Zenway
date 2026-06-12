interface TrainData {
  trainNumber: string;
  trainName: string;
  scheduledArrival: string;
  estimatedArrival: string;
  delayMinutes: number;
}

interface TrainFeedProps {
  trains: TrainData[];
}

export function TrainFeed({ trains }: TrainFeedProps) {
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
          <path d="M4 22V2M20 22V2M2 5h20M2 19h20M2 12h20" />
        </svg>
        Live departures & arrivals
      </div>

      {/* Card Wrapper */}
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        overflow: 'hidden',
        boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.05)'
      }}>
        {trains.map((train, index) => {
          const isLast = index === trains.length - 1;
          const delay = train.delayMinutes;
          
          let delayBg = '#d1fae5';
          let delayColor = '#065f46';
          let delayText = 'On Time';
          
          if (delay > 20) {
            delayBg = '#fee2e2';
            delayColor = '#b91c1c';
            delayText = `+${delay} min`;
          } else if (delay >= 5) {
            delayBg = '#fef3c7';
            delayColor = '#b45309';
            delayText = `+${delay} min`;
          }

          return (
            <div
              key={train.trainNumber + '-' + index}
              style={{
                padding: '12px 16px',
                borderBottom: isLast ? 'none' : '1px solid #f1f5f9',
                display: 'grid',
                gridTemplateColumns: '1fr auto auto',
                gap: '12px',
                alignItems: 'center',
                backgroundColor: '#ffffff',
                transition: 'background-color 0.2s ease'
              }}
              onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
              onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#ffffff')}
            >
              {/* Left Column - Train Details */}
              <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                <span style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#0f172a',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {train.trainName}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                  <span style={{
                    fontSize: '10px',
                    fontWeight: 500,
                    color: '#64748b',
                    fontFamily: 'monospace'
                  }}>
                    #{train.trainNumber}
                  </span>
                </div>
              </div>

              {/* Middle Column - Times */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', paddingRight: '4px' }}>
                <span style={{
                  fontSize: '13px',
                  fontWeight: 700,
                  color: '#0f172a',
                  textAlign: 'right'
                }}>
                  {train.estimatedArrival}
                </span>
                <span style={{
                  fontSize: '10px',
                  color: '#64748b',
                  textAlign: 'right',
                  marginTop: '2px'
                }}>
                  sched {train.scheduledArrival}
                </span>
              </div>

              {/* Right Column - Status Chip */}
              <div style={{
                fontSize: '11px',
                fontWeight: 700,
                padding: '5px 10px',
                borderRadius: '20px',
                minWidth: '60px',
                textAlign: 'center',
                backgroundColor: delayBg,
                color: delayColor,
                border: `1px solid ${delayColor}15`
              }}>
                {delayText}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
