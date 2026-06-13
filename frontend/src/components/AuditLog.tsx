import { useState } from 'react';
import type { AuditLogEntry } from '../types/audit';
import { Terminal, Calendar, Filter } from 'lucide-react';

interface AuditLogProps {
  logs: AuditLogEntry[];
}

export function AuditLog({ logs }: AuditLogProps) {
  const [filterType, setFilterType] = useState<string>('ALL');

  // Available unique event types in logs
  const eventTypes = ['ALL', ...Array.from(new Set(logs.map((log) => log.event_type)))];

  const filteredLogs = filterType === 'ALL'
    ? logs
    : logs.filter((log) => log.event_type === filterType);

  const getEventBadgeClass = (type: string) => {
    switch (type) {
      case 'SURGE_RISK_CRITICAL':
        return 'text-red-400 bg-red-950/30 border-red-900/50';
      case 'SURGE_RISK_UPDATED':
        return 'text-amber-400 bg-amber-950/20 border-amber-900/40';
      case 'TRAIN_DELAY_DETECTED':
        return 'text-blue-400 bg-blue-950/20 border-blue-900/40';
      case 'ALERT_CONFIRMED':
      case 'ALERT_BROADCASTED':
        return 'text-emerald-400 bg-emerald-950/30 border-emerald-900/50';
      default:
        return 'text-purple-400 bg-purple-950/20 border-purple-900/40';
    }
  };

  const formatPayload = (data: any) => {
    // Return a short clean summary of payload depending on type
    if (data.score !== undefined) {
      return `Score: ${data.score}% | Level: ${data.level} (P${data.platform_id})`;
    }
    if (data.delay_mins !== undefined) {
      return `Train T-${data.train_id} delay updated to ${data.delay_mins}m`;
    }
    if (data.action_card) {
      return `Summary: ${data.action_card.summary.substring(0, 50)}...`;
    }
    if (data.alert_id) {
      return `Alert ID: ${data.alert_id}`;
    }
    return JSON.stringify(data);
  };

  return (
    <div className="bg-[#0A0F0B] border border-[#1A3320] rounded-xl p-5 shadow-lg flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between border-b border-[#1C3B24] pb-3 mb-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Terminal className="w-4 h-4 text-[#4ADE80]" />
            Audit Log & Alert History
          </h3>
          <div className="flex items-center gap-2 bg-[#0F2213] border border-[#1C3B24] px-2 py-1 rounded">
            <Filter className="w-3 h-3 text-gray-500" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-transparent text-gray-300 text-xs focus:outline-none cursor-pointer"
            >
              {eventTypes.map((type) => (
                <option key={type} value={type} className="bg-[#08130B] text-gray-200">
                  {type.replace(/_/g, ' ')}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Log feed console */}
        <div className="bg-[#040805] border border-[#122316] rounded-lg p-3 h-[250px] overflow-y-auto font-mono text-[11px] text-gray-400 space-y-2">
          {filteredLogs.length === 0 ? (
            <div className="h-full flex items-center justify-center text-gray-600 text-center text-xs">
              Waiting for system events...
            </div>
          ) : (
            filteredLogs.map((log) => {
              const date = new Date(log.timestamp);
              const timeStr = date.toLocaleTimeString();

              return (
                <div key={log.id} className="flex items-start gap-2 py-1.5 hover:bg-[#122316]/20 transition-colors border-b border-[#112215]/20">
                  <span className="text-gray-600 select-none flex-shrink-0">
                    [{timeStr}]
                  </span>
                  <span className="text-gray-500 font-bold select-none flex-shrink-0">
                    {log.station_id}
                  </span>
                  <span className={`px-1.5 py-0.5 rounded border text-[9px] font-extrabold select-none flex-shrink-0 ${getEventBadgeClass(log.event_type)}`}>
                    {log.event_type}
                  </span>
                  <span className="text-gray-200 break-all text-left">
                    {formatPayload(log.data)}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="mt-3 text-[10px] text-gray-500 flex items-center gap-1">
        <Calendar className="w-3.5 h-3.5 text-gray-600" />
        <span>Append-only database journal • Total events logged: {logs.length}</span>
      </div>
    </div>
  );
}
