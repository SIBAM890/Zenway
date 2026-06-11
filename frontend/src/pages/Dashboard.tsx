import { useState } from 'react';
import { useDemoMode } from '../hooks/useDemoMode';
import { useSurgeScore } from '../hooks/useSurgeScore';
import { useAlerts } from '../hooks/useAlerts';
import { Navbar } from '../components/Navbar';
import { PlatformGrid } from '../components/PlatformGrid';
import { TrainFeed } from '../components/TrainFeed';
import { AlertCard } from '../components/AlertCard';

export function Dashboard() {
  const [station, setStation] = useState('NDLS');
  const [stationTabs, setStationTabs] = useState([
    { name: 'New Delhi', code: 'ndls' },
    { name: 'Howrah', code: 'hwh' },
    { name: 'Mumbai CST', code: 'cstm' }
  ]);
  
  // Custom hooks
  const demo = useDemoMode();
  
  const { assessments, trains, refetch } = useSurgeScore({
    station,
    isDemo: demo.isDemo,
    scenario: demo.scenario,
    elapsedSeconds: demo.elapsedSeconds,
  });

  const alerts = useAlerts({ station });

  const handleReset = () => {
    demo.resetDemo(station);
    alerts.refetchHistory();
    alerts.clearLocalAlert();
    refetch();
  };

  const handleStationChange = (code: string) => {
    setStation(code);
    if (demo.isDemo) {
      demo.resetDemo(code);
      alerts.clearLocalAlert();
    }
  };

  const handleSelectStation = (newStation: { name: string; code: string }) => {
    const code = newStation.code.toLowerCase();
    const isPinned = ['ndls', 'hwh', 'cstm'].includes(code);
    
    // Check if it's already in the tabs list
    const exists = stationTabs.some(t => t.code === code);
    if (!exists) {
      let updatedTabs = [...stationTabs];
      if (isPinned) {
        updatedTabs.push({ name: newStation.name, code });
      } else {
        const nonPinned = updatedTabs.filter(t => !['ndls', 'hwh', 'cstm'].includes(t.code));
        if (nonPinned.length >= 2) {
          const oldestNonPinned = nonPinned[0];
          updatedTabs = updatedTabs.filter(t => t.code !== oldestNonPinned.code);
        }
        updatedTabs.push({ name: newStation.name, code });
      }
      setStationTabs(updatedTabs);
    }
    const upperCode = code.toUpperCase() === 'CSTM' ? 'CSMT' : code.toUpperCase();
    handleStationChange(upperCode);
  };

  const assessment = assessments[0];
  const score = assessment?.score || 0;
  const riskLevel = (assessment?.level || 'Normal').toLowerCase();
  const etaMinutes = assessment?.time_to_critical || null;

  let description = "Station operations running normally. All platform capacities within safe levels.";
  if (riskLevel === 'critical') {
    description = `Critical passenger surge detected on Platform 1. Capacity limit of ${assessment?.contributing_factors?.platform_capacity || 2000} pax exceeded.`;
  } else if (riskLevel === 'elevated') {
    description = `Elevated passenger surge on Platform 1. Monitoring ${assessment?.contributing_factors?.delayed_trains_count || 0} delayed train arrivals.`;
  }

  const mappedPlatforms = assessments.map((a) => {
    const num = parseInt(a.platform_id.replace(/\D/g, ''), 10) || 1;
    const capacity = a.contributing_factors.platform_capacity || 1000;
    const baseLoad = a.contributing_factors.typical_load || 0;
    const expectedPax = a.contributing_factors.expected_passengers_from_delayed_trains || 0;
    const currentLoad = baseLoad + expectedPax;
    const percent = Math.round(Math.min(100, (currentLoad / capacity) * 100));
    return { number: num, occupancyPercent: percent };
  });

  const getEstimatedTime = (sched: string, delay: number) => {
    const [h, m] = sched.split(':').map(Number);
    const date = new Date();
    date.setHours(h);
    date.setMinutes(m + delay);
    return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  };

  const mappedTrains = trains.slice(0, 5).map((t) => ({
    trainNumber: t.number,
    trainName: t.name,
    scheduledArrival: t.scheduled_arrival,
    estimatedArrival: getEstimatedTime(t.scheduled_arrival, t.current_delay_mins),
    delayMinutes: t.current_delay_mins
  }));

  const delayedTrainsCount = trains.filter((t) => t.current_delay_mins > 0).length;
  const estPassengers = assessments.reduce(
    (sum, a) => sum + (a.contributing_factors.expected_passengers_from_delayed_trains || 0),
    0
  );

  return (
    <div className="min-h-screen bg-[#f5f5f7] text-[#1a1a1a] font-sans flex flex-col">
      {/* Header Navbar */}
      <Navbar
        activeStation={station.toLowerCase() === 'csmt' ? 'cstm' : station.toLowerCase()}
        onStationChange={(code) => {
          const upperCode = code.toUpperCase() === 'CSTM' ? 'CSMT' : code.toUpperCase();
          handleStationChange(upperCode);
        }}
        stationTabs={stationTabs}
        onSelectStation={handleSelectStation}
      />


      {/* Content Area */}
      <div style={{
        padding: '16px 16px 32px 16px',
        maxWidth: '1080px',
        margin: '0 auto',
        width: '100%',
        boxSizing: 'border-box'
      }}>
        <div className="dashboard-grid">
        {/* Top Banner */}
        <div className="dashboard-full-width" style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          borderLeft: '5px solid #dc2626',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          boxSizing: 'border-box',
          boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.05)'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <span style={{
              fontSize: '12px',
              fontWeight: 700,
              color: '#dc2626',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <span className="live-indicator" style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: '#dc2626',
                display: 'inline-block'
              }} />
              18 fatalities at New Delhi station · February 2025
            </span>
            <span style={{
              fontSize: '13px',
              color: '#64748b',
              marginTop: '4px',
              fontWeight: 500
            }}>
              StationSense detects crowd surges before they happen.
            </span>
          </div>
          <button
            onClick={() => {
              if (!demo.isDemo) {
                demo.selectScenario('critical');
              } else {
                if (!demo.isPlaying) {
                  demo.togglePlayback();
                }
              }
            }}
            style={{
              backgroundColor: '#2563eb',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: 700,
              padding: '8px 18px',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s',
              boxShadow: '0 2px 4px rgba(37, 99, 235, 0.2)'
            }}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#1d4ed8')}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#2563eb')}
          >
            Run Demo
          </button>
        </div>

        {/* 1. Simple Hero Banner */}
        {assessment && (
          <div className="dashboard-full-width" style={{
            borderRadius: '16px',
            padding: '20px 24px',
            background: riskLevel === 'critical' 
              ? 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)' 
              : riskLevel === 'elevated' 
                ? 'linear-gradient(135deg, #92400e 0%, #d97706 100%)' 
                : 'linear-gradient(135deg, #065f46 0%, #10b981 100%)',
            display: 'grid',
            gridTemplateColumns: '1fr auto',
            gap: '16px',
            alignItems: 'center',
            width: '100%',
            boxSizing: 'border-box',
            fontFamily: 'Inter, sans-serif',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -4px rgba(0, 0, 0, 0.05)',
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

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', position: 'relative', zIndex: 2 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                <span className="live-indicator" style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: '#22c55e',
                  display: 'inline-block'
                }}></span>
                <span style={{
                  fontSize: '10px',
                  color: 'rgba(255, 255, 255, 0.8)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  fontWeight: 700
                }}>
                  Surge risk status
                </span>
              </div>
              <h2 style={{
                fontSize: '32px',
                fontWeight: 700,
                color: '#fff',
                letterSpacing: '-0.02em',
                lineHeight: '1.1',
                margin: 0
              }}>
                {riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1)}
              </h2>
              <p style={{
                fontSize: '12px',
                color: 'rgba(255, 255, 255, 0.85)',
                marginTop: '8px',
                lineHeight: '1.5',
                margin: 0,
                fontWeight: 500
              }}>
                {description}
              </p>
            </div>
            <div style={{
              fontSize: '14px',
              fontWeight: 700,
              color: '#ffffff',
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              padding: '8px 14px',
              borderRadius: '20px',
              textAlign: 'right',
              backdropFilter: 'blur(4px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              position: 'relative',
              zIndex: 2
            }}>
              {etaMinutes !== null ? `Surge in ~${etaMinutes} min` : "No surge expected"}
            </div>
          </div>
        )}

        {/* Left Column (Core Telemetry) */}
        <div className="dashboard-column">
          {/* 2. Two stat cards side by side */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '12px'
          }}>
            {/* Card 1: Delayed trains */}
            <div style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              padding: '16px 20px',
              border: '1px solid #e2e8f0',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.05)'
            }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Delayed trains
              </span>
              <span style={{ fontSize: '32px', fontWeight: 800, color: '#0f172a', margin: '4px 0', letterSpacing: '-0.02em' }}>
                {delayedTrainsCount} <span style={{ fontSize: '14px', fontWeight: 600, color: '#64748b' }}>trains</span>
              </span>
              <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 500 }}>
                converging on terminal now
              </span>
            </div>

            {/* Card 2: Est. passengers */}
            <div style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              padding: '16px 20px',
              border: '1px solid #e2e8f0',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.05)'
            }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Est. passengers
              </span>
              <span style={{ fontSize: '32px', fontWeight: 800, color: '#0f172a', margin: '4px 0', letterSpacing: '-0.02em' }}>
                {estPassengers.toLocaleString()} <span style={{ fontSize: '14px', fontWeight: 600, color: '#64748b' }}>pax</span>
              </span>
              <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 500 }}>
                surge in <span style={{ color: '#2563eb', fontWeight: 700 }}>~{etaMinutes !== null ? etaMinutes : 0}</span> min
              </span>
            </div>
          </div>

          {/* 4. TrainFeed */}
          <TrainFeed trains={mappedTrains} />
        </div>

        {/* Right Column (Diagnostics & Bulletins) */}
        <div className="dashboard-column">
          {/* 5. AlertCard */}
          {alerts.activeAlert ? (
            <AlertCard
              alertText={alerts.activeAlert.action_card?.summary || "Immediate crowd mitigation protocols generated. Select action below."}
              riskLevel="critical"
              timestamp={new Date(alerts.activeAlert.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              onBroadcast={() => alerts.confirmAlert(alerts.activeAlert!.id)}
            />
          ) : (
            <div style={{
              borderRadius: '16px',
              border: '1px dashed #cbd5e1',
              backgroundColor: '#ffffff',
              padding: '28px 16px',
              textAlign: 'center',
              color: '#64748b',
              fontSize: '12px',
              fontWeight: 500,
              boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.05)'
            }}>
              No active security or surge alerts. System operations normal.
            </div>
          )}

          {/* 3. PlatformGrid */}
          <PlatformGrid platforms={mappedPlatforms} />
        </div>
      </div>
    </div>
    </div>
  );
}
export default Dashboard;
