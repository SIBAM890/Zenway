import { Activity, ShieldAlert, RotateCcw, Zap } from 'lucide-react';

interface NavbarProps {
  isDemo: boolean;
  scenario: string;
  elapsedSeconds: number;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onReset: () => void;
  onSelectScenario: (scenario: string) => void;
  onDisableDemo: () => void;
}

export function Navbar({
  isDemo,
  scenario,
  elapsedSeconds,
  isPlaying,
  onTogglePlay,
  onReset,
  onSelectScenario,
  onDisableDemo,
}: NavbarProps) {
  return (
    <header className="sticky top-0 z-50 flex flex-col md:flex-row items-center justify-between px-6 py-4 bg-[#0D1B10] border-b border-[#1A3320] shadow-xl">
      <div className="flex items-center gap-3 mb-4 md:mb-0">
        <div className="p-2 bg-[#1B3E25] text-[#4ADE80] rounded-lg border border-[#2D5E3B]">
          <Activity className="w-6 h-6 animate-pulse" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-wider text-white m-0 leading-none">
            ZENWAY <span className="text-xs font-semibold px-2 py-0.5 bg-[#1B3E25] text-[#4ADE80] border border-[#2D5E3B] rounded-full ml-1">v1.0</span>
          </h1>
          <p className="text-xs text-gray-400 mt-1">RailMind Sentinel • Crowd Surge Control Center</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        {/* Connection status badges */}
        {isDemo ? (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-[#451A03] border border-[#78350F] text-[#F97316] rounded-md text-xs font-semibold animate-pulse shadow-inner">
            <ShieldAlert className="w-3.5 h-3.5" />
            JUDGE DEMO MODE — Scenario: {scenario.toUpperCase()} ({elapsedSeconds}s)
          </div>
        ) : (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-[#052E16] border border-[#14532D] text-[#4ADE80] rounded-md text-xs font-semibold shadow-inner">
            <Zap className="w-3.5 h-3.5 animate-bounce" />
            indianrailapi.com — LIVE
          </div>
        )}

        {/* Demo controller controls */}
        {isDemo && (
          <div className="flex items-center gap-2 bg-[#0F2213] border border-[#1C3B24] p-1 rounded-md shadow-md">
            <button
              onClick={onTogglePlay}
              className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                isPlaying
                  ? 'bg-[#E11D48] text-white hover:bg-[#BE123C]'
                  : 'bg-[#16A34A] text-white hover:bg-[#15803D]'
              }`}
            >
              {isPlaying ? 'Pause' : 'Run Scenario'}
            </button>
            <button
              onClick={onReset}
              title="Reset timeline and clear alerts"
              className="p-1 hover:bg-[#1C3B24] text-gray-400 hover:text-white rounded transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <div className="h-4 w-px bg-[#1C3B24] mx-1"></div>
            <select
              value={scenario}
              onChange={(e) => onSelectScenario(e.target.value)}
              className="bg-[#08130B] border border-[#1C3B24] text-gray-200 text-xs rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-[#2D5E3B]"
            >
              <option value="normal">Scenario: Normal</option>
              <option value="elevated">Scenario: Elevated</option>
              <option value="critical">Scenario: Critical</option>
            </select>
            <button
              onClick={onDisableDemo}
              className="px-2 py-1 text-xs text-red-400 hover:bg-red-950/40 rounded transition-colors ml-1"
            >
              Live Mode
            </button>
          </div>
        )}

        {!isDemo && (
          <button
            onClick={() => onSelectScenario('critical')}
            className="px-3 py-1.5 bg-[#1E293B] border border-[#334155] hover:bg-[#334155] text-gray-200 text-xs font-medium rounded transition-colors"
          >
            Launch Judge Demo
          </button>
        )}
      </div>
    </header>
  );
}
