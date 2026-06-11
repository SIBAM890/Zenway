import { useState } from 'react';
import { useDemoMode } from '../hooks/useDemoMode';
import { useSurgeScore } from '../hooks/useSurgeScore';
import { useAlerts } from '../hooks/useAlerts';
import { Navbar } from '../components/Navbar';
import { PlatformGrid } from '../components/PlatformGrid';
import { RiskGauge } from '../components/RiskGauge';
import { TrainFeed } from '../components/TrainFeed';
import { AlertCard } from '../components/AlertCard';
import { PAPanel } from '../components/PAPanel';
import { AuditLog } from '../components/AuditLog';
import { MapPin, ShieldAlert } from 'lucide-react';

export function Dashboard() {
  const [station, setStation] = useState('NDLS');
  
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

  return (
    <div className="min-h-screen bg-[#070C08] text-gray-200 font-sans flex flex-col">
      {/* Header Navbar */}
      <Navbar
        isDemo={demo.isDemo}
        scenario={demo.scenario}
        elapsedSeconds={demo.elapsedSeconds}
        isPlaying={demo.isPlaying}
        onTogglePlay={demo.togglePlayback}
        onReset={handleReset}
        onSelectScenario={demo.selectScenario}
        onDisableDemo={demo.disableDemo}
      />

      {/* Control bar / Station Switcher + Timeline Scrubber */}
      <div className="bg-[#09130A] border-b border-[#1A3320] px-6 py-4 flex flex-col lg:flex-row items-center gap-6 justify-between">
        {/* Station switcher */}
        <div className="flex items-center gap-3">
          <span className="text-xs uppercase tracking-wider font-bold text-gray-500 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-gray-400" />
            Station Control:
          </span>
          <div className="inline-flex rounded-md shadow-sm">
            {['NDLS', 'HWH', 'CSMT'].map((code) => (
              <button
                key={code}
                onClick={() => handleStationChange(code)}
                className={`px-4 py-1.5 text-xs font-bold border transition-colors ${
                  station === code
                    ? 'bg-[#1C3B24] text-[#4ADE80] border-[#2D5E3B] z-10'
                    : 'bg-[#0F2213] text-gray-400 border-[#1C3B24] hover:text-white'
                } ${code === 'NDLS' ? 'rounded-l-md' : ''} ${code === 'CSMT' ? 'rounded-r-md' : ''}`}
              >
                {code === 'NDLS' ? 'New Delhi (NDLS)' : code === 'HWH' ? 'Howrah (HWH)' : 'Mumbai (CSMT)'}
              </button>
            ))}
          </div>
        </div>

        {/* Demo Timeline Scrubber */}
        {demo.isDemo && (
          <div className="flex-1 w-full lg:max-w-2xl bg-[#0B180D] border border-[#1C3B24] p-3 rounded-lg flex items-center gap-4 shadow-inner">
            <span className="text-[10px] text-[#4ADE80] uppercase tracking-wider font-extrabold whitespace-nowrap flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 animate-pulse" />
              Compressed Timeline Clock
            </span>
            
            {/* Scrubber range input */}
            <input
              type="range"
              min="0"
              max="60"
              value={demo.elapsedSeconds}
              onChange={(e) => demo.setTime(Number(e.target.value))}
              className="flex-1 h-1.5 bg-[#122215] rounded-lg appearance-none cursor-pointer accent-[#4ADE80] focus:outline-none"
            />
            
            <div className="flex items-center gap-2 font-mono text-xs text-gray-300 min-w-[100px] justify-end">
              <span className="text-white font-bold">{demo.elapsedSeconds}s</span>
              <span className="text-gray-500">/</span>
              <span>60s (2 Hours)</span>
            </div>
          </div>
        )}
      </div>

      {/* Main Grid */}
      <main className="flex-1 p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Prediction & Yard Telemetry (66% / 2 Columns) */}
        <div className="lg:col-span-2 space-y-6 flex flex-col">
          {/* Section: Platforms Occupancy Meters */}
          <PlatformGrid 
            platforms={
              station === 'NDLS' 
                ? [
                    { id: 'P1', name: 'Platform 1', max_capacity: 2000, typical_load_peak: 1500, typical_load_offpeak: 500 },
                    { id: 'P2', name: 'Platform 2', max_capacity: 1800, typical_load_peak: 1300, typical_load_offpeak: 450 },
                    { id: 'P3', name: 'Platform 3', max_capacity: 1800, typical_load_peak: 1300, typical_load_offpeak: 450 }
                  ]
                : station === 'HWH'
                ? [
                    { id: 'P1', name: 'Platform 1', max_capacity: 800, typical_load_peak: 600, typical_load_offpeak: 200 },
                    { id: 'P2', name: 'Platform 2', max_capacity: 1200, typical_load_peak: 900, typical_load_offpeak: 300 }
                  ]
                : [
                    { id: 'P1', name: 'Platform 1', max_capacity: 1000, typical_load_peak: 700, typical_load_offpeak: 250 },
                    { id: 'P2', name: 'Platform 2', max_capacity: 1200, typical_load_peak: 900, typical_load_offpeak: 300 }
                  ]
            }
            assessments={assessments}
          />

          {/* Section: Risk Gauges Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {assessments.slice(0, 2).map((a) => (
              <RiskGauge
                key={a.platform_id}
                assessment={a}
                platformName={a.platform_id === 'P1' ? 'Platform 1 (Main Terminal)' : `Platform ${a.platform_id.substring(1)}`}
              />
            ))}
          </div>

          {/* Section: Train Feed Table */}
          <div className="flex-1">
            <TrainFeed trains={trains} />
          </div>
        </div>

        {/* Right Side: Command Mitigation Center & Logs (34% / 1 Column) */}
        <div className="space-y-6 flex flex-col justify-start">
          
          {/* Active Mitigation Card */}
          {alerts.activeAlert ? (
            <AlertCard
              alert={alerts.activeAlert}
              onConfirm={alerts.confirmAlert}
            />
          ) : (
            <div className="bg-[#090F0B] border border-dashed border-[#1C3B24] rounded-xl p-8 text-center text-gray-500 text-sm flex flex-col items-center justify-center min-h-[220px]">
              <div className="p-3 bg-[#112215] text-[#4ADE80] rounded-full mb-3 border border-[#1C3B24]">
                <ShieldAlert className="w-6 h-6 animate-pulse" />
              </div>
              <h4 className="text-white font-bold mb-1">No Active Surge Alerts</h4>
              <p className="text-xs text-gray-400 max-w-xs">
                {demo.isDemo && demo.scenario === 'critical' && demo.elapsedSeconds < 30
                  ? `Critical threat building... Run timeline to 30 seconds to trigger warning.`
                  : `Surge prediction algorithm is monitoring yard loads. Level green.`}
              </p>
            </div>
          )}

          {/* PA Announcement Tab Console */}
          <div>
            <PAPanel
              announcements={alerts.activeAlert?.announcements}
              alertStatus={alerts.activeAlert?.status || 'none'}
            />
          </div>

          {/* Real-time system logs */}
          <div className="flex-1 min-h-[300px]">
            <AuditLog logs={alerts.auditLog} />
          </div>

        </div>

      </main>
    </div>
  );
}
export default Dashboard;
