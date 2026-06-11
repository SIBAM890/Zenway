import type { Train } from '../types/train';
import { Clock, Users } from 'lucide-react';

interface TrainFeedProps {
  trains: Train[];
}

export function TrainFeed({ trains }: TrainFeedProps) {
  // Sort trains by estimated arrival time
  const parseTimeToMins = (t: string) => {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
  };

  const getEstimatedTime = (sched: string, delay: number) => {
    const [h, m] = sched.split(':').map(Number);
    const date = new Date();
    date.setHours(h);
    date.setMinutes(m + delay);
    return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  };

  const sortedTrains = [...trains].sort((a, b) => {
    const aEst = parseTimeToMins(a.scheduled_arrival) + a.current_delay_mins;
    const bEst = parseTimeToMins(b.scheduled_arrival) + b.current_delay_mins;
    return aEst - bEst;
  });

  return (
    <div className="bg-[#0D160F] border border-[#1A3320] rounded-xl p-5 shadow-lg h-full">
      <div className="flex items-center justify-between border-b border-[#1C3B24] pb-3 mb-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Clock className="w-4 h-4 text-[#4ADE80]" />
          Incoming Trains Feed (Next 5 Arrivals)
        </h3>
        <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">NTES Active Sync</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#142618] text-[10px] text-gray-400 uppercase tracking-wider">
              <th className="py-2.5 font-semibold">Train Number & Name</th>
              <th className="py-2.5 font-semibold text-center">Scheduled</th>
              <th className="py-2.5 font-semibold text-center">Delay</th>
              <th className="py-2.5 font-semibold text-center">Estimated Arrival</th>
              <th className="py-2.5 font-semibold text-right">Passenger Load</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#122316]/50">
            {sortedTrains.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-xs text-gray-500 font-medium">
                  No incoming trains scheduled in this sector.
                </td>
              </tr>
            ) : (
              sortedTrains.slice(0, 5).map((train) => {
                const isDelayed = train.current_delay_mins > 0;
                const estTime = getEstimatedTime(train.scheduled_arrival, train.current_delay_mins);
                
                return (
                  <tr key={train.id} className="hover:bg-[#122316]/30 transition-colors">
                    <td className="py-3 pr-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[#4ADE80] font-mono text-xs font-semibold bg-[#1C3B24]/40 border border-[#2D5E3B]/40 px-1.5 py-0.5 rounded">
                          {train.number}
                        </span>
                        <span className="text-xs font-semibold text-white truncate max-w-[150px] md:max-w-none" title={train.name}>
                          {train.name}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 text-center text-xs font-medium text-gray-300">
                      {train.scheduled_arrival}
                    </td>
                    <td className="py-3 text-center">
                      {isDelayed ? (
                        <span className="inline-block px-1.5 py-0.5 text-[10px] font-bold text-red-400 bg-red-950/40 border border-red-900/60 rounded">
                          +{train.current_delay_mins} min
                        </span>
                      ) : (
                        <span className="inline-block px-1.5 py-0.5 text-[10px] font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-900/60 rounded">
                          On Time
                        </span>
                      )}
                    </td>
                    <td className="py-3 text-center text-xs font-mono font-bold text-white">
                      {estTime}
                    </td>
                    <td className="py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Users className="w-3.5 h-3.5 text-gray-500" />
                        <span className="text-xs font-semibold text-gray-200">
                          {train.avg_passengers.toLocaleString()}
                        </span>
                      </div>
                      <span className="block text-[8px] text-gray-500 font-mono">
                        SL: {train.class_breakdown.SL || 0} | AC: {(train.class_breakdown['3A'] || 0) + (train.class_breakdown['2A'] || 0)}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
