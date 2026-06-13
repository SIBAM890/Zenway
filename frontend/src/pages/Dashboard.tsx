import { useState, useEffect, useRef } from 'react';
import { useDemoMode } from '../hooks/useDemoMode';
import { useSurgeScore } from '../hooks/useSurgeScore';
import { useAlerts } from '../hooks/useAlerts';
import { PlatformGrid } from '../components/PlatformGrid';
import { TrainFeed } from '../components/TrainFeed';
import { AlertCard } from '../components/AlertCard';
import { RiskGauge } from '../components/RiskGauge';
import { SXLogo } from '../components/SXLogo';
import { PAPanel } from '../components/PAPanel';
import { AuditLog } from '../components/AuditLog';
import { api } from '../services/api';

/* ── Station code helpers ───────────────────────────── */
const toApiCode = (code: string) =>
  code.toUpperCase() === 'CSTM' ? 'CSMT' : code.toUpperCase();

const SUGGESTIONS = [
  { name: 'New Delhi', code: 'NDLS' },
  { name: 'Howrah',    code: 'HWH'  },
  { name: 'Mumbai CST', code: 'CSMT' },
];

/* ── SVG illustration ───────────────────────────────── */
function PlatformIllustration() {
  return (
    <svg
      width="320" height="200" viewBox="0 0 320 200" fill="none"
      stroke="#c7c7cc" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
      style={{ display: 'block', margin: '0 auto' }}
    >
      {/* Platform edge */}
      <line x1="20" y1="155" x2="300" y2="155" />
      <line x1="20" y1="160" x2="300" y2="160" strokeDasharray="6 4" />
      {/* Platform body */}
      <rect x="20" y="160" width="280" height="30" rx="2" fill="#f5f5f7" stroke="#e8e8ec" />
      {/* Canopy pillars */}
      <line x1="70"  y1="60" x2="70"  y2="155" />
      <line x1="150" y1="60" x2="150" y2="155" />
      <line x1="230" y1="60" x2="230" y2="155" />
      {/* Canopy roof */}
      <line x1="50" y1="60" x2="260" y2="60" />
      <line x1="50" y1="60" x2="50"  y2="75" />
      <line x1="260" y1="60" x2="260" y2="75" />
      {/* Train outline */}
      <rect x="20" y="100" width="180" height="55" rx="6" fill="#f5f5f7" />
      <rect x="30"  y="112" width="22" height="18" rx="3" />
      <rect x="62"  y="112" width="22" height="18" rx="3" />
      <rect x="94"  y="112" width="22" height="18" rx="3" />
      <rect x="126" y="112" width="22" height="18" rx="3" />
      <circle cx="55"  cy="158" r="6" fill="#f5f5f7" />
      <circle cx="155" cy="158" r="6" fill="#f5f5f7" />
      {/* Track rails */}
      <line x1="10" y1="165" x2="310" y2="165" />
      <line x1="10" y1="172" x2="310" y2="172" />
      {/* Sleepers */}
      {[30,60,90,120,150,180,210,240,270].map(x => (
        <line key={x} x1={x} y1="163" x2={x} y2="174" strokeWidth="2" />
      ))}
      {/* Stick figures waiting */}
      {/* Person 1 */}
      <circle cx="218" cy="120" r="5" />
      <line x1="218" y1="125" x2="218" y2="143" />
      <line x1="211" y1="132" x2="225" y2="132" />
      <line x1="218" y1="143" x2="213" y2="155" />
      <line x1="218" y1="143" x2="223" y2="155" />
      {/* Person 2 */}
      <circle cx="245" cy="116" r="5" />
      <line x1="245" y1="121" x2="245" y2="139" />
      <line x1="238" y1="128" x2="252" y2="128" />
      <line x1="245" y1="139" x2="240" y2="155" />
      <line x1="245" y1="139" x2="250" y2="155" />
      {/* Person 3 */}
      <circle cx="272" cy="122" r="5" />
      <line x1="272" y1="127" x2="272" y2="145" />
      <line x1="265" y1="134" x2="279" y2="134" />
      <line x1="272" y1="145" x2="267" y2="155" />
      <line x1="272" y1="145" x2="277" y2="155" />
      {/* Sign */}
      <rect x="130" y="68" width="50" height="18" rx="3" fill="#f5f5f7" />
      <text x="155" y="81" textAnchor="middle" fontSize="8" fill="#8e8e93" stroke="none" fontFamily="Inter,sans-serif">PLATFORM</text>
    </svg>
  );
}

/* ── Inline search bar for empty state ─────────────── */
function EmptyStateSearch({ onSelect }: { onSelect: (s: { name: string; code: string }) => void }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{ name: string; code: string }[]>([]);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    const t = setTimeout(async () => {
      try { setResults(await api.searchStations(query)); }
      catch { setResults([]); }
    }, 350);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setResults([]);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={wrapRef} style={{ position: 'relative', width: '100%', maxWidth: '440px', margin: '0 auto' }}>
      <span style={{
        position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)',
        color: '#8e8e93', fontSize: '18px', pointerEvents: 'none', lineHeight: 1,
      }}>⌕</span>
      <input
        type="text" value={query} onChange={e => setQuery(e.target.value)}
        placeholder="Search station name or code…"
        autoFocus
        style={{
          width: '100%', boxSizing: 'border-box',
          padding: '13px 16px 13px 42px',
          fontSize: '15px', fontWeight: 500,
          border: '1.5px solid #e8e8ec', borderRadius: '12px',
          backgroundColor: '#fff', color: '#1a1a1a',
          outline: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          transition: 'border-color 0.2s',
          fontFamily: 'Inter, sans-serif',
        }}
        onFocus={e => (e.currentTarget.style.borderColor = '#2563eb')}
        onBlur={e  => (e.currentTarget.style.borderColor = '#e8e8ec')}
      />
      {results.length > 0 && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0, zIndex: 100,
          backgroundColor: '#fff', border: '1px solid #e8e8ec', borderRadius: '12px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.08)', overflow: 'hidden',
        }}>
          {results.map(r => (
            <div key={r.code} onClick={() => { onSelect(r); setQuery(''); setResults([]); }}
              style={{
                padding: '11px 16px', cursor: 'pointer', fontSize: '14px',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                borderBottom: '1px solid #f5f5f7', transition: 'background 0.15s',
              }}
              onMouseOver={e => (e.currentTarget.style.background = '#eff6ff')}
              onMouseOut={e  => (e.currentTarget.style.background = '#fff')}
            >
              <span style={{ fontWeight: 600, color: '#1a1a1a' }}>{r.name}</span>
              <span style={{ fontSize: '11px', color: '#8e8e93', fontWeight: 600, textTransform: 'uppercase' }}>{r.code}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Mini navbar for active dashboard ──────────────── */
function DashboardNav({
  stationName, onBack, onRunDemo, isDemo,
}: { stationName: string; onBack: () => void; onRunDemo: () => void; isDemo: boolean }) {
  return (
    <div style={{
      backgroundColor: '#fff', borderBottom: '1px solid #e8e8ec',
      padding: '0 20px', height: '52px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      position: 'sticky', top: 0, zIndex: 40,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button onClick={onBack} style={{
          background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px',
          fontSize: '20px', color: '#8e8e93', lineHeight: 1,
          borderRadius: '8px', transition: 'background 0.15s',
        }}
          onMouseOver={e => (e.currentTarget.style.background = '#f5f5f7')}
          onMouseOut={e  => (e.currentTarget.style.background = 'none')}
        >←</button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
          onClick={() => {
            window.history.pushState({}, '', '/');
            const event = new Event('pushstate-changed');
            window.dispatchEvent(event);
          }}
        >
          <SXLogo size={30} withText />
          <span style={{ fontSize: '12px', color: '#8e8e93', marginLeft: '4px' }}>·</span>
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#1a1a1a' }}>{stationName}</span>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <span className="live-indicator" style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#22c55e', display: 'inline-block' }} />
          <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748b' }}>LIVE</span>
        </div>
        {!isDemo && (
          <button onClick={onRunDemo} style={{
            backgroundColor: '#2563eb', color: '#fff', border: 'none',
            borderRadius: '8px', fontSize: '12px', fontWeight: 700,
            padding: '7px 16px', cursor: 'pointer', whiteSpace: 'nowrap',
          }}
            onMouseOver={e => (e.currentTarget.style.backgroundColor = '#1d4ed8')}
            onMouseOut={e  => (e.currentTarget.style.backgroundColor = '#2563eb')}
          >Run Demo</button>
        )}
      </div>
    </div>
  );
}

/* ── Stat card ─────────────────────────────────────── */
function StatCard({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div style={{
      backgroundColor: '#fff', borderRadius: '16px', padding: '18px 20px',
      border: '1px solid #e8e8ec', boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      display: 'flex', flexDirection: 'column', gap: '4px',
    }}>
      <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</span>
      <span style={{ fontSize: '30px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', lineHeight: 1.1 }}>{value}</span>
      <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 500 }}>{sub}</span>
    </div>
  );
}

/* ── Main component ─────────────────────────────────── */
export function Dashboard() {
  // Check for URL flags
  const params = new URLSearchParams(window.location.search);
  const urlDemo    = params.get('demo') === 'true' || params.get('demo') === 'feb15';
  const urlStation = params.get('station')?.toUpperCase() || null;

  const [selectedStation, setSelectedStation] = useState<{ name: string; code: string } | null>(
    urlDemo ? { name: 'New Delhi', code: 'NDLS' } : urlStation ? { name: urlStation, code: urlStation } : null
  );

  const demo = useDemoMode();

  const apiCode = selectedStation ? toApiCode(selectedStation.code) : 'NDLS';

  const { assessments, trains, refetch } = useSurgeScore({
    station: apiCode,
    isDemo: demo.isDemo,
    scenario: demo.scenario,
    elapsedSeconds: demo.elapsedSeconds,
  });

  const alerts = useAlerts({ station: apiCode });

  // Auto-trigger demo when URL has ?demo=feb15
  useEffect(() => {
    if (urlDemo && !demo.isDemo) {
      demo.selectScenario('critical');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSelect = (s: { name: string; code: string }) => setSelectedStation(s);
  const handleBack   = () => { setSelectedStation(null); };
  const handleRunDemo = () => {
    if (selectedStation) demo.selectScenario('critical');
  };

  /* ── EMPTY STATE ───────────────────────────────── */
  if (!selectedStation) {
    return (
      <div style={{
        minHeight: '100vh', backgroundColor: '#f5f5f7',
        fontFamily: 'Inter, system-ui, sans-serif',
        display: 'flex', flexDirection: 'column',
      }}>
        {/* Minimal header */}
        <div style={{
          backgroundColor: '#fff', borderBottom: '1px solid #e8e8ec',
          padding: '0 24px', height: '52px',
          display: 'flex', alignItems: 'center', gap: '12px',
        }}>
          <button
            onClick={() => {
              window.history.pushState({}, '', '/');
              const event = new Event('pushstate-changed');
              window.dispatchEvent(event);
            }}
            style={{
              background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px',
              fontSize: '20px', color: '#8e8e93', lineHeight: 1,
              borderRadius: '8px', transition: 'background 0.15s',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}
            onMouseOver={e => (e.currentTarget.style.background = '#f5f5f7')}
            onMouseOut={e  => (e.currentTarget.style.background = 'none')}
          >
            ←
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
            onClick={() => {
              window.history.pushState({}, '', '/');
              const event = new Event('pushstate-changed');
              window.dispatchEvent(event);
            }}
          >
            <SXLogo size={30} withText />
          </div>
        </div>

        {/* Centered content */}
        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          padding: '48px 24px',
        }}>
          <div style={{ width: '100%', maxWidth: '440px', textAlign: 'center' }}>
            {/* Title */}
            <div style={{ fontSize: '22px', fontWeight: 700, color: '#1a1a1a', letterSpacing: '-0.02em', marginBottom: '4px' }}>
              Select a station
            </div>
            <div style={{ fontSize: '14px', color: '#8e8e93', marginBottom: '24px' }}>
              Search or pick a suggestion to start monitoring
            </div>

            {/* Search bar */}
            <EmptyStateSearch onSelect={handleSelect} />

            {/* Hint */}
            <p style={{ fontSize: '14px', color: '#8e8e93', textAlign: 'center', marginTop: '12px' }}>
              Type your station name to start monitoring
            </p>

            {/* Suggestion pills */}
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '16px', flexWrap: 'wrap' }}>
              {SUGGESTIONS.map(s => (
                <button key={s.code} onClick={() => handleSelect(s)}
                  style={{
                    background: '#fff', border: '1px solid #e8e8ec', borderRadius: '8px',
                    padding: '8px 16px', fontSize: '13px', fontWeight: 500,
                    cursor: 'pointer', color: '#1a1a1a', transition: 'all 0.15s',
                  }}
                  onMouseOver={e => {
                    e.currentTarget.style.background = '#eff6ff';
                    e.currentTarget.style.borderColor = '#bfdbfe';
                    e.currentTarget.style.color = '#2563eb';
                  }}
                  onMouseOut={e => {
                    e.currentTarget.style.background = '#fff';
                    e.currentTarget.style.borderColor = '#e8e8ec';
                    e.currentTarget.style.color = '#1a1a1a';
                  }}
                >{s.name}</button>
              ))}
            </div>
          </div>

          {/* Illustration */}
          <div style={{ marginTop: '48px', opacity: 0.7 }}>
            <PlatformIllustration />
          </div>
        </div>
      </div>
    );
  }

  /* ── ACTIVE DASHBOARD ──────────────────────────── */
  const assessment = assessments[0];
  const riskLevel  = (assessment?.level || 'normal').toLowerCase() as 'normal' | 'elevated' | 'critical';
  const etaMinutes = assessment?.time_to_critical || null;
  const delayedTrainNames = trains.filter(t => t.current_delay_mins > 0).slice(0, 2).map(t => t.name || t.number);
  const crowdedPlatforms  = assessments.filter(a => {
    const cap  = a.contributing_factors.platform_capacity || 1000;
    const load = (a.contributing_factors.typical_load || 0) + (a.contributing_factors.expected_passengers_from_delayed_trains || 0);
    return load / cap > 0.7;
  }).map(a => a.platform_id.replace(/\D/g, ''));

  const riskDesc =
    riskLevel === 'critical'
      ? `Platforms ${crowdedPlatforms.slice(0,2).join(' and ') || '14 and 15'} are dangerously overcrowded. ${
          delayedTrainNames.length ? `${delayedTrainNames[0]} and other trains are delayed` : 'Multiple delayed trains'
        } are funnelling thousands of passengers with nowhere to go. A crush situation is imminent.`
      : riskLevel === 'elevated'
        ? `Passenger density on platforms is rising fast. ${
            delayedTrainNames.length ? `${delayedTrainNames[0]}` : 'Several trains'
          } ${ delayedTrainNames.length ? 'is' : 'are' } late — stranded passengers are building up. Intervene now to prevent escalation.`
        : `All platforms at ${selectedStation.name} are within safe capacity limits. No delays causing pile-up. You\'re good.`;

  /* Generate plain-English action steps */
  const actionSteps: string[] = [];
  if (riskLevel === 'critical' || riskLevel === 'elevated') {
    const firstDelayed = trains.find(t => t.current_delay_mins > 0);
    const altPlatform  = crowdedPlatforms.length > 0
      ? String(Math.max(1, parseInt(crowdedPlatforms[0]) - 2))
      : '6';
    const crowdedPair  = crowdedPlatforms.slice(0,2).join(' and ') || '14 and 15';

    if (firstDelayed) {
      actionSteps.push(
        `Move ${firstDelayed.name || firstDelayed.number} to platform ${altPlatform} immediately to distribute passenger load away from the crowd.`
      );
    }
    actionSteps.push(
      `Send RPF officers to the footbridge above platforms ${crowdedPair} — control flow and prevent any pushing.`
    );
    if (riskLevel === 'critical') {
      actionSteps.push(
        `Open overflow waiting area at Entry Gate 1 and redirect incoming passengers before they reach the platform.`
      );
    }
  }

  const mappedPlatforms = assessments.map(a => {
    const num  = parseInt(a.platform_id.replace(/\D/g, ''), 10) || 1;
    const cap  = a.contributing_factors.platform_capacity || 1000;
    const load = (a.contributing_factors.typical_load || 0) + (a.contributing_factors.expected_passengers_from_delayed_trains || 0);
    return { number: num, occupancyPercent: Math.round(Math.min(100, (load / cap) * 100)) };
  });

  const getETA = (sched: string, delay: number) => {
    const [h, m] = sched.split(':').map(Number);
    const d = new Date(); d.setHours(h); d.setMinutes(m + delay);
    return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
  };

  const mappedTrains = trains.slice(0, 5).map((t, i) => {
    const matchingAssessment = assessments.find(a =>
      a.contributing_factors.delayed_train_numbers?.includes(t.number)
    );
    let platformNum = matchingAssessment
      ? parseInt(matchingAssessment.platform_id.replace(/\D/g, ''), 10) || undefined
      : undefined;

    if (!platformNum) {
      const sCode = selectedStation.code.toUpperCase();
      if (sCode === 'NDLS') {
        if (t.name.toLowerCase().includes('prayagraj') || t.name.toLowerCase().includes('express')) {
          platformNum = i % 2 === 0 ? 14 : 15;
        } else {
          platformNum = (i % 5) + 12;
        }
      } else {
        platformNum = i + 1;
      }
    }

    return {
      trainNumber: t.number,
      trainName: t.name,
      scheduledArrival: t.scheduled_arrival,
      estimatedArrival: getETA(t.scheduled_arrival, t.current_delay_mins),
      delayMinutes: t.current_delay_mins,
      platformNumber: platformNum,
    };
  });

  const delayedCount  = trains.filter(t => t.current_delay_mins > 0).length;
  const estPassengers = assessments.reduce((s, a) => s + (a.contributing_factors.expected_passengers_from_delayed_trains || 0), 0);

  /* ── Build specific alert text ─────────────────── */
  const firstDelayedTrain = trains.find(t => t.current_delay_mins > 0);
  const secondDelayedTrain = trains.filter(t => t.current_delay_mins > 0)[1];
  const alertPlatforms = crowdedPlatforms.slice(0, 2).join(' and ') || '14 and 15';

  const DEMO_ALERT_TEXT =
    `URGENT — Platforms ${alertPlatforms} at ${selectedStation.name} have reached critical density. ` +
    (firstDelayedTrain
      ? `${firstDelayedTrain.name || firstDelayedTrain.number} is ${firstDelayedTrain.current_delay_mins} min late`
      : 'Multiple delayed trains') +
    (secondDelayedTrain ? ` and ${secondDelayedTrain.name || secondDelayedTrain.number} is ${secondDelayedTrain.current_delay_mins} min late` : '') +
    ` — stranded passengers are building up. Estimated ${estPassengers.toLocaleString()} additional passengers inbound. ` +
    `Immediate action required: divert trains, deploy RPF on footbridge, open overflow gates.`;

  const NORMAL_ALERT_TEXT =
    `All platforms at ${selectedStation.name} are within safe capacity levels. ` +
    `Routine monitoring active. No action required.`;

  const rawAlertSummary = alerts.activeAlert?.action_card?.summary || '';
  const isVagueSummary = rawAlertSummary.length < 60 || !rawAlertSummary.match(/platform|train|pax/i);

  const alertText = riskLevel === 'normal'
    ? NORMAL_ALERT_TEXT
    : alerts.activeAlert
      ? (demo.isDemo && isVagueSummary ? DEMO_ALERT_TEXT : rawAlertSummary || DEMO_ALERT_TEXT)
      : DEMO_ALERT_TEXT;

  const alertTimestamp = alerts.activeAlert
    ? new Date(alerts.activeAlert.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f7', fontFamily: 'Inter,system-ui,sans-serif' }}>
      <DashboardNav
        stationName={selectedStation.name}
        onBack={handleBack}
        onRunDemo={handleRunDemo}
        isDemo={demo.isDemo}
      />

      <div style={{ maxWidth: '1080px', margin: '0 auto', padding: '16px 16px 40px', boxSizing: 'border-box' as const }}>
        {/* Risk Gauge */}
        <div style={{ marginBottom: '16px' }}>
          <RiskGauge
            riskLevel={riskLevel}
            stationName={selectedStation.name}
            stationCode={selectedStation.code}
            description={riskDesc}
            etaMinutes={etaMinutes}
            actionSteps={actionSteps}
          />
        </div>

        {/* Stat cards row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
          <StatCard label="Delayed Trains" value={`${delayedCount}`} sub="converging on terminal" />
          <StatCard label="Est. Passengers" value={estPassengers.toLocaleString()} sub={etaMinutes ? `surge in ~${etaMinutes} min` : 'surge unlikely'} />
        </div>

        {/* Two-column layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '7fr 5fr', gap: '16px' }}>
          {/* Left */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <TrainFeed trains={mappedTrains} />
          </div>
          {/* Right */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <AlertCard
              alertText={alertText}
              riskLevel={riskLevel}
              timestamp={alertTimestamp}
              onBroadcast={() => alerts.activeAlert
                ? alerts.confirmAlert(alerts.activeAlert.id)
                : undefined
              }
            />
            <PAPanel
              announcements={alerts.activeAlert?.announcements}
              alertStatus={alerts.activeAlert?.status || 'pending'}
            />
            <AuditLog logs={alerts.auditLog} />
            <PlatformGrid platforms={mappedPlatforms} />
          </div>
        </div>

        {/* Demo controls */}
        {demo.isDemo && (
          <div style={{
            marginTop: '16px', backgroundColor: '#fff', borderRadius: '16px',
            border: '1px solid #e8e8ec', padding: '16px 20px',
            display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' as const,
          }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' as const, letterSpacing: '0.08em' }}>
              Demo · Feb 15 replay
            </span>
            <div style={{ flex: 1, display: 'flex', gap: '8px', alignItems: 'center' }}>
              <button onClick={demo.togglePlayback} style={{
                backgroundColor: demo.isPlaying ? '#dc2626' : '#2563eb', color: '#fff',
                border: 'none', borderRadius: '8px', padding: '7px 16px', fontSize: '12px', fontWeight: 700, cursor: 'pointer',
              }}>
                {demo.isPlaying ? '⏸ Pause' : '▶ Play'}
              </button>
              <input type="range" min={0} max={60} value={demo.elapsedSeconds}
                onChange={e => demo.setTime(Number(e.target.value))}
                style={{ flex: 1, cursor: 'pointer' }}
              />
              <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600, whiteSpace: 'nowrap' as const }}>
                T+{demo.elapsedSeconds}s / 60s
              </span>
            </div>
            <button onClick={() => { demo.resetDemo(apiCode); alerts.refetchHistory?.(); refetch(); }}
              style={{ background: 'none', border: '1px solid #e8e8ec', borderRadius: '8px', padding: '7px 14px', fontSize: '12px', cursor: 'pointer', color: '#64748b' }}>
              Reset
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
