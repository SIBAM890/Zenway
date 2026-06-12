import { useState } from 'react';
import { useDemoMode } from '../hooks/useDemoMode';
import { useSurgeScore } from '../hooks/useSurgeScore';
import { useAlerts } from '../hooks/useAlerts';
import { Navbar } from '../components/Navbar';
import { PlatformGrid } from '../components/PlatformGrid';
import { TrainFeed } from '../components/TrainFeed';
import { AlertCard } from '../components/AlertCard';
import { RiskGauge } from '../components/RiskGauge';
import { PAPanel } from '../components/PAPanel';
import { AuditLog } from '../components/AuditLog';
import { Play, Pause, RotateCcw, X, Sliders } from 'lucide-react';

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

  const handleReset = async () => {
    await demo.resetDemo(station);
    await alerts.refetchHistory();
    alerts.clearLocalAlert();
    refetch();
  };

  const handleStationChange = async (code: string) => {
    setStation(code);
    if (demo.isDemo) {
      await demo.resetDemo(code);
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
        isDemo={demo.isDemo}
        scenario={demo.scenario}
        elapsedSeconds={demo.elapsedSeconds}
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
        {/* Demo Control Panel */}
        {demo.isDemo && (
          <div className="dashboard-full-width" style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            padding: '16px 20px',
            display: 'flex',
            flexDirection: 'row',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            width: '100%',
            boxSizing: 'border-box',
            boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.05)'
          }}>
            {/* Left Side: Play/Pause/Reset Controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                onClick={demo.togglePlayback}
                style={{
                  backgroundColor: '#2563eb',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px 14px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '12px',
                  fontWeight: 700,
                  transition: 'all 0.2s'
                }}
              >
                {demo.isPlaying ? (
                  <>
                    <Pause size={14} fill="currentColor" />
                    <span>Pause</span>
                  </>
                ) : (
                  <>
                    <Play size={14} fill="currentColor" />
                    <span>Play</span>
                  </>
                )}
              </button>

              <button
                onClick={handleReset}
                style={{
                  backgroundColor: '#f1f5f9',
                  color: '#475569',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '12px',
                  fontWeight: 600,
                  transition: 'background-color 0.2s'
                }}
                title="Reset Demo"
              >
                <RotateCcw size={14} />
                <span>Reset</span>
              </button>
            </div>

            {/* Middle: Scrubber */}
            <div style={{
              flex: '1 1 300px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              padding: '8px 16px',
              borderRadius: '10px'
            }}>
              <span style={{
                fontSize: '10px',
                fontWeight: 700,
                color: '#dc2626',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                whiteSpace: 'nowrap'
              }}>
                <span className="live-indicator" style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: '#dc2626',
                  display: 'inline-block'
                }} />
                Demo Clock
              </span>

              <input
                type="range"
                min="0"
                max="60"
                value={demo.elapsedSeconds}
                onChange={(e) => demo.setTime(Number(e.target.value))}
                style={{
                  flex: 1,
                  height: '4px',
                  cursor: 'pointer',
                  accentColor: '#2563eb'
                }}
              />

              <span style={{
                fontFamily: 'monospace',
                fontSize: '12px',
                color: '#475569',
                fontWeight: 600,
                minWidth: '95px',
                textAlign: 'right'
              }}>
                {demo.elapsedSeconds}s <span style={{ color: '#94a3b8' }}>/</span> 60s
              </span>
            </div>

            {/* Right Side: Scenario Select & Exit */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '4px 8px'
              }}>
                <Sliders size={14} className="text-slate-500 mr-2" />
                <select
                  value={demo.scenario}
                  onChange={(e) => demo.selectScenario(e.target.value, station)}
                  style={{
                    border: 'none',
                    backgroundColor: 'transparent',
                    color: '#0f172a',
                    fontSize: '12px',
                    fontWeight: 600,
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <option value="critical">Critical Scenario</option>
                  <option value="elevated">Elevated Scenario</option>
                  <option value="normal">Normal Scenario</option>
                </select>
              </div>

              <button
                onClick={demo.disableDemo}
                style={{
                  backgroundColor: '#fef2f2',
                  color: '#dc2626',
                  border: '1px solid #fee2e2',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '12px',
                  fontWeight: 700,
                  transition: 'all 0.2s'
                }}
              >
                <X size={14} />
                <span>Exit Demo</span>
              </button>
            </div>
          </div>
        )}

        {/* Top Banner (Visible when not in Demo Mode) */}
        {!demo.isDemo && (
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
                demo.selectScenario('critical', station);
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
        )}

        {/* Left Column (Core Telemetry - wider) */}
        <div className="dashboard-column">
          {/* Risk Gauge Banner */}
          {assessment && (
            <RiskGauge
              score={score}
              riskLevel={riskLevel}
              description={description}
              etaMinutes={etaMinutes}
            />
          )}

          {/* Platform load occupancy meters */}
          <PlatformGrid platforms={mappedPlatforms} />

          {/* Sensor Grid Section */}
          <div style={{ display: 'flex', flexDirection: 'column', width: '100%', fontFamily: 'Inter, sans-serif' }}>
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
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <path d="M9 3v18M15 3v18M3 9h18M3 15h18" />
              </svg>
              Sensor Grid Status
            </div>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '12px',
              width: '100%'
            }}>
              {assessments.slice(0, 2).map((a) => (
                <RiskGauge
                  key={a.platform_id}
                  variant="circular"
                  assessment={a}
                  platformName={a.platform_id === 'P1' ? 'Platform 1 (Main)' : `Platform ${a.platform_id.substring(1)}`}
                />
              ))}
            </div>
          </div>

          {/* Stat Cards Side by Side */}
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
        </div>

        {/* Right Column (Diagnostics & Bulletins - narrower) */}
        <div className="dashboard-column">
          {/* Active Mitigation Card / AlertCard Area */}
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
              padding: '24px 20px',
              textAlign: 'center',
              color: '#64748b',
              fontSize: '12px',
              fontWeight: 500,
              boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.05)'
            }}>
              <h4 style={{ color: '#0f172a', fontWeight: 700, marginBottom: '4px' }}>No Active Surge Alerts</h4>
              <p style={{ color: '#64748b', fontSize: '11px' }}>
                {demo.isDemo && demo.scenario === 'critical' && demo.elapsedSeconds < 30
                  ? `Critical threat building... Run timeline to 30 seconds to trigger warning.`
                  : `Surge prediction algorithm is monitoring platform loads. Operations normal.`}
              </p>
            </div>
          )}

          {/* PA Announcement Tab Console */}
          <PAPanel
            announcements={alerts.activeAlert?.announcements}
            alertStatus={alerts.activeAlert?.status || 'none'}
          />

          {/* Real-time system logs */}
          <AuditLog logs={alerts.auditLog} />
        </div>

        {/* BELOW (full width) */}
        <div className="dashboard-full-width">
          <TrainFeed trains={mappedTrains} />
        </div>
      </div>
    </div>
    </div>
  );
}
export default Dashboard;
