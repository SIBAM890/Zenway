import type { CrowdRiskAssessment, Platform } from '../types/surge';
import { LayoutGrid, Layers } from 'lucide-react';

interface PlatformGridProps {
  platforms: Platform[];
  assessments: CrowdRiskAssessment[];
}

export function PlatformGrid({ platforms, assessments }: PlatformGridProps) {
  return (
    <div className="bg-[#0D160F] border border-[#1A3320] rounded-xl p-5 shadow-lg">
      <div className="flex items-center justify-between border-b border-[#1C3B24] pb-3 mb-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <LayoutGrid className="w-4 h-4 text-[#4ADE80]" />
          Platform Occupancy Grid
        </h3>
        <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Physical Layout</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {platforms.map((platform) => {
          // Find matching assessment
          const assessment = assessments.find((a) => a.platform_id === platform.id);
          const level = assessment ? assessment.level : 'Normal';

          // Get occupancy numbers
          const capacity = platform.max_capacity;
          const expectedPax = assessment?.contributing_factors.expected_passengers_from_delayed_trains || 0;
          const baseLoad = assessment?.contributing_factors.typical_load || platform.typical_load_offpeak;
          const currentLoad = baseLoad + expectedPax;
          const percent = Math.min(100, (currentLoad / capacity) * 100);

          // Get border and text colors
          const getColors = () => {
            switch (level) {
              case 'Critical':
                return {
                  border: 'border-red-900/40 bg-red-950/10',
                  bar: 'bg-red-500',
                  text: 'text-red-400',
                };
              case 'Elevated':
                return {
                  border: 'border-amber-900/40 bg-amber-950/10',
                  bar: 'bg-amber-500',
                  text: 'text-amber-400',
                };
              default:
                return {
                  border: 'border-[#1A3320] bg-emerald-950/5',
                  bar: 'bg-emerald-500',
                  text: 'text-emerald-400',
                };
            }
          };

          const colors = getColors();

          return (
            <div 
              key={platform.id}
              className={`border rounded-lg p-4 transition-all hover:bg-[#122316]/20 ${colors.border}`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-gray-300 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-gray-500" />
                  {platform.name}
                </span>
                <span className={`text-[10px] font-bold ${colors.text}`}>
                  {level.toUpperCase()}
                </span>
              </div>

              <div className="flex items-end justify-between mb-1.5">
                <span className="text-lg font-extrabold text-white">
                  {currentLoad.toLocaleString()}{' '}
                  <span className="text-xs font-normal text-gray-500">/ {capacity.toLocaleString()} pax</span>
                </span>
                <span className="text-xs font-semibold text-gray-400">
                  {Math.round(percent)}%
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-[#122216] h-2 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-1000 ${colors.bar}`}
                  style={{ width: `${percent}%` }}
                ></div>
              </div>

              <div className="flex justify-between items-center mt-2.5 text-[9px] text-gray-500">
                <span>Base: {baseLoad} pax</span>
                <span>Expected Influx: +{expectedPax}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
