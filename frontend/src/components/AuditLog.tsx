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

  const getEventBadgeStyle = (type: string) => {
    switch (type) {
      case 'SURGE_RISK_CRITICAL':
        return {
          color: '#f87171',
          backgroundColor: 'rgba(127, 29, 29, 0.3)',
          borderColor: 'rgba(127, 29, 29, 0.5)'
        };
      case 'SURGE_RISK_UPDATED':
        return {
          color: '#fbbf24',
          backgroundColor: 'rgba(120, 53, 4, 0.2)',
          borderColor: 'rgba(120, 53, 4, 0.4)'
        };
      case 'TRAIN_DELAY_DETECTED':
        return {
          color: '#60a5fa',
          backgroundColor: 'rgba(30, 58, 138, 0.2)',
          borderColor: 'rgba(30, 58, 138, 0.4)'
        };
      case 'ALERT_CONFIRMED':
      case 'ALERT_BROADCASTED':
        return {
          color: '#34d399',
          backgroundColor: 'rgba(6, 78, 59, 0.3)',
          borderColor: 'rgba(6, 78, 59, 0.5)'
        };
      default:
        return {
          color: '#c084fc',
          backgroundColor: 'rgba(88, 28, 135, 0.2)',
          borderColor: 'rgba(88, 28, 135, 0.4)'
        };
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
    <div style={{
      backgroundColor: '#0A0F0B',
      border: '1px solid #1A3320',
      borderRadius: '12px',
      padding: '20px',
      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      height: '100%',
      fontFamily: 'Inter, sans-serif',
      boxSizing: 'border-box'
    }}>
      <div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid #1C3B24',
          paddingBottom: '12px',
          marginBottom: '16px'
        }}>
          <h3 style={{
            fontSize: '15px',
            fontWeight: 700,
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            margin: 0
          }}>
            <Terminal size={16} style={{ color: '#4ADE80' }} />
            Audit Log & Alert History
          </h3>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: '#0F2213',
            border: '1px solid #1C3B24',
            padding: '4px 8px',
            borderRadius: '4px'
          }}>
            <Filter size={12} className="text-gray-500" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#cbd5e1',
                fontSize: '12px',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              {eventTypes.map((type) => (
                <option key={type} value={type} style={{ backgroundColor: '#08130B', color: '#e2e8f0' }}>
                  {type.replace(/_/g, ' ')}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Log feed console */}
        <div style={{
          backgroundColor: '#040805',
          border: '1px solid #122316',
          borderRadius: '8px',
          padding: '12px',
          height: '250px',
          overflowY: 'auto',
          fontFamily: 'monospace',
          fontSize: '11px',
          color: '#94a3b8',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          {filteredLogs.length === 0 ? (
            <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4b5563', textAlign: 'center', fontSize: '12px' }}>
              Waiting for system events...
            </div>
          ) : (
            filteredLogs.map((log) => {
              const date = new Date(log.timestamp);
              const timeStr = date.toLocaleTimeString();

              return (
                <div key={log.id} style={{
                  display: 'flex',
                  alignItems: 'start',
                  gap: '8px',
                  padding: '6px 0',
                  borderBottom: '1px solid rgba(28, 59, 36, 0.2)',
                  transition: 'background-color 0.2s ease',
                  textAlign: 'left'
                }}>
                  <span style={{ color: '#4b5563', userSelect: 'none', flexShrink: 0 }}>
                    [{timeStr}]
                  </span>
                  <span style={{ color: '#94a3b8', fontWeight: 'bold', userSelect: 'none', flexShrink: 0 }}>
                    {log.station_id}
                  </span>
                  <span style={{
                    flexShrink: 0,
                    textTransform: 'uppercase',
                    fontSize: '9px',
                    fontWeight: 800,
                    padding: '2px 6px',
                    borderRadius: '4px',
                    border: '1px solid',
                    display: 'inline-block',
                    lineHeight: '1.2',
                    ...getEventBadgeStyle(log.event_type)
                  }}>
                    {log.event_type}
                  </span>
                  <span style={{ color: '#cbd5e1', wordBreak: 'break-all', textAlign: 'left', flex: 1 }}>
                    {formatPayload(log.data)}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>

      <div style={{
        marginTop: '12px',
        fontSize: '10px',
        color: '#64748b',
        display: 'flex',
        alignItems: 'center',
        gap: '4px'
      }}>
        <Calendar size={14} className="text-gray-600" />
        <span>Append-only database journal • Total events logged: {logs.length}</span>
      </div>
    </div>
  );
}
