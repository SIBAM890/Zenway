import { useState } from 'react';
import type { CrowdRiskAssessment } from '../types/surge';
import { HelpCircle, Info } from 'lucide-react';

interface RiskGaugeProps {
  assessment: CrowdRiskAssessment;
  platformName: string;
}

export function RiskGauge({ assessment, platformName }: RiskGaugeProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { score, level, contributing_factors, calculated_at } = assessment;

  // Determine colors based on risk level
  const getColorScheme = () => {
    switch (level) {
      case 'Critical':
        return {
          stroke: '#EF4444', // Red
          bg: 'rgba(239, 68, 68, 0.1)',
          border: 'border-red-900/50',
          text: 'text-red-400',
          fill: 'fill-red-500',
        };
      case 'Elevated':
        return {
          stroke: '#F59E0B', // Amber
          bg: 'rgba(245, 158, 11, 0.1)',
          border: 'border-amber-900/50',
          text: 'text-amber-400',
          fill: 'fill-amber-500',
        };
      default:
        return {
          stroke: '#10B981', // Green
          bg: 'rgba(16, 185, 129, 0.1)',
          border: 'border-emerald-900/30',
          text: 'text-emerald-400',
          fill: 'fill-emerald-500',
        };
    }
  };

  const scheme = getColorScheme();
  
  // Calculate SVG gauge progress variables
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div 
      className={`bg-[#0D160F] border ${scheme.border} rounded-xl p-6 transition-all duration-300 hover:shadow-2xl hover:-translate-y-0.5 cursor-pointer`}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="text-xs uppercase tracking-widest text-gray-500 font-semibold">Sensor Grid</span>
          <h3 className="text-lg font-bold text-white mt-0.5">{platformName}</h3>
        </div>
        <span className={`px-2 py-0.5 text-xs font-bold uppercase rounded-full ${scheme.bg} ${scheme.text} border border-current/30`}>
          {level}
        </span>
      </div>

      <div className="flex flex-col items-center justify-center py-4 relative">
        <svg className="w-36 h-36 transform -rotate-90">
          {/* Background track circle */}
          <circle
            cx="72"
            cy="72"
            r={radius}
            className="stroke-[#122216]"
            strokeWidth="8"
            fill="transparent"
          />
          {/* Active progress circle */}
          <circle
            cx="72"
            cy="72"
            r={radius}
            stroke={scheme.stroke}
            strokeWidth="10"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Score overlay */}
        <div className="absolute text-center">
          <span className="text-3xl font-extrabold text-white tracking-tight">{score}%</span>
          <span className="block text-[10px] text-gray-500 uppercase tracking-widest font-bold mt-0.5">Surge Capacity</span>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-gray-400 border-t border-[#1C3B24] pt-3 mt-2">
        <div className="flex items-center gap-1">
          <Info className="w-3 h-3 text-gray-500" />
          <span>Click to audit formula</span>
        </div>
        <span className="text-[10px] text-gray-500">
          Updated: {new Date(calculated_at).toLocaleTimeString()}
        </span>
      </div>

      {/* Expandable Explainability Panel */}
      {isExpanded && (
        <div 
          className="mt-4 p-4 bg-[#080E09] border border-[#1C3B24] rounded-lg text-sm text-left transition-all duration-300"
          onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inner elements
        >
          <div className="flex items-center gap-1.5 text-xs text-[#4ADE80] font-semibold uppercase tracking-wider mb-2.5">
            <HelpCircle className="w-3.5 h-3.5" />
            Explainability Formula Audit
          </div>

          <div className="space-y-2 text-xs text-gray-300">
            <div className="flex justify-between border-b border-[#142618] pb-1.5">
              <span className="text-gray-500">Platform Limit (Capacity):</span>
              <span className="font-semibold text-white">{contributing_factors.platform_capacity} pax</span>
            </div>
            <div className="flex justify-between border-b border-[#142618] pb-1.5">
              <span className="text-gray-500">Typical Base Load (Offpeak):</span>
              <span className="font-semibold text-white">{contributing_factors.typical_load} pax</span>
            </div>
            <div className="flex justify-between border-b border-[#142618] pb-1.5">
              <span className="text-gray-500">Expected Delayed Influx (30m):</span>
              <span className="font-semibold text-[#FF8A8A] font-mono">
                +{contributing_factors.expected_passengers_from_delayed_trains} pax
              </span>
            </div>
            <div className="flex justify-between border-b border-[#142618] pb-1.5">
              <span className="text-gray-500">Active Delayed Trains:</span>
              <span className="font-semibold text-white">{contributing_factors.delayed_trains_count}</span>
            </div>

            {contributing_factors.delayed_train_numbers && contributing_factors.delayed_train_numbers.length > 0 && (
              <div className="py-1">
                <span className="text-gray-500 block mb-1">Contributing Trains:</span>
                <div className="flex flex-wrap gap-1">
                  {contributing_factors.delayed_train_numbers.map((tnum) => (
                    <span key={tnum} className="bg-[#1C3B24] text-white text-[10px] font-semibold px-1.5 py-0.5 rounded border border-[#2D5E3B]">
                      T-{tnum}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-2 border-t border-[#1C3B24] mt-2">
              <span className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold block mb-1">Formula Execution:</span>
              <div className="bg-[#050906] p-2 rounded border border-[#142618] font-mono text-[10px] text-[#4ADE80] break-words">
                score = min(100, (({contributing_factors.typical_load} + {contributing_factors.expected_passengers_from_delayed_trains}) / {contributing_factors.platform_capacity}) * 100)<br />
                score = min(100, ({contributing_factors.typical_load + contributing_factors.expected_passengers_from_delayed_trains} / {contributing_factors.platform_capacity}) * 100) = <span className="font-bold text-white">{score}%</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
