import { useState, useEffect } from 'react';
import { api } from '../services/api';
import type { Alert } from '../types/alert';
import type { AuditLogEntry } from '../types/audit';

interface UseAlertsProps {
  station: string;
}

export function useAlerts({ station }: UseAlertsProps) {
  const [activeAlert, setActiveAlert] = useState<Alert | null>(null);
  const [auditLog, setAuditLog] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch initial audit log history and reconstruct any pending alerts
  const fetchHistory = async () => {
    try {
      const logs = await api.fetchAuditHistory(station);
      setAuditLog(logs);
      
      // Find the most recent critical assessment log for the active station
      const criticalLog = logs.find(
        (l) => l.event_type === 'SURGE_RISK_CRITICAL' && 
        l.station_id.toUpperCase() === station.toUpperCase()
      );
      
      if (criticalLog) {
        // Check if there is a more recent confirmation or broadcast event
        const isResolved = logs.some(
          (l) => 
            (l.event_type === 'ALERT_CONFIRMED' || l.event_type === 'ALERT_BROADCASTED') && 
            l.timestamp > criticalLog.timestamp
        );
        
        if (!isResolved) {
          // Locate corresponding action card and PA announcement logs
          const actionCardLog = logs.find(
            (l) => l.event_type === 'ACTION_CARD_GENERATED' && l.timestamp >= criticalLog.timestamp
          );
          const paLog = logs.find(
            (l) => l.event_type === 'PA_ANNOUNCEMENT_CREATED' && l.timestamp >= criticalLog.timestamp
          );
          
          const alertId = actionCardLog?.data?.alert_id || paLog?.data?.alert_id || 'A-TEMP';
          
          setActiveAlert({
            id: alertId,
            risk_assessment_id: `${criticalLog.station_id}-${criticalLog.platform_id || 'P1'}`,
            status: 'pending',
            created_at: criticalLog.timestamp,
            action_card: actionCardLog?.data?.action_card,
            announcements: paLog?.data?.announcements
          });
        } else {
          setActiveAlert(null);
        }
      } else {
        setActiveAlert(null);
      }
    } catch (e) {
      console.error('Failed to fetch event history:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [station]);

  // Set up Server-Sent Events (SSE) connection
  useEffect(() => {
    const sseUrl = api.getEventStreamUrl();
    const eventSource = new EventSource(sseUrl);

    eventSource.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (!payload || !payload.event_type) return;

        // Construct audit entry
        const newEntry: AuditLogEntry = {
          id: `LOG-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
          event_type: payload.event_type,
          timestamp: payload.timestamp || new Date().toISOString(),
          station_id: payload.data?.station_id || station,
          platform_id: payload.data?.platform_id,
          data: payload.data || {},
        };

        // Append to audit log (most recent first)
        setAuditLog((prev) => [newEntry, ...prev].slice(0, 100));

        // React to specific event types
        if (payload.event_type === 'SURGE_RISK_CRITICAL') {
          setActiveAlert((prev) => {
            if (prev && prev.status === 'pending') return prev;
            return {
              id: payload.data.alert_id || `A-TEMP`,
              risk_assessment_id: `${payload.data.station_id}-${payload.data.platform_id}`,
              status: 'pending',
              created_at: new Date().toISOString(),
            };
          });
        } 
        else if (payload.event_type === 'ACTION_CARD_GENERATED') {
          const actionCardData = payload.data.action_card;
          const alertId = payload.data.alert_id;
          setActiveAlert((prev) => {
            if (prev) {
              return { ...prev, id: alertId, action_card: actionCardData };
            }
            return {
              id: alertId,
              risk_assessment_id: `${payload.data.station_id || station}-${payload.data.platform_id || 'P1'}`,
              status: 'pending',
              created_at: new Date().toISOString(),
              action_card: actionCardData
            };
          });
        } 
        else if (payload.event_type === 'PA_ANNOUNCEMENT_CREATED') {
          const announcementsData = payload.data.announcements;
          const alertId = payload.data.alert_id;
          setActiveAlert((prev) => {
            if (prev) {
              return { ...prev, id: alertId, announcements: announcementsData };
            }
            return {
              id: alertId,
              risk_assessment_id: `${payload.data.station_id || station}-${payload.data.platform_id || 'P1'}`,
              status: 'pending',
              created_at: new Date().toISOString(),
              announcements: announcementsData
            };
          });
        }
        else if (payload.event_type === 'ALERT_CONFIRMED' || payload.event_type === 'ALERT_BROADCASTED') {
          const alertId = payload.data.alert_id;
          setActiveAlert((prev) => {
            if (prev && prev.id === alertId) {
              return { ...prev, status: 'broadcasted' };
            }
            return prev;
          });
          // Automatically clear active alert after 5 seconds
          setTimeout(() => {
            setActiveAlert((prev) => (prev && prev.id === alertId ? null : prev));
          }, 5000);
        }
      } catch (err) {
        console.error('Error processing SSE event:', err);
      }
    };

    eventSource.onerror = (err) => {
      console.error('SSE connection error:', err);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [station]);

  const confirmAlert = async (alertId: string) => {
    try {
      await api.confirmAlert(alertId);
      setActiveAlert((prev) => {
        if (prev && prev.id === alertId) {
          return { ...prev, status: 'broadcasted' };
        }
        return prev;
      });
      // Clear alert after some delay
      setTimeout(() => {
        setActiveAlert((prev) => (prev && prev.id === alertId ? null : prev));
      }, 5000);
    } catch (e) {
      console.error('Failed to confirm alert:', e);
    }
  };

  const clearLocalAlert = () => {
    setActiveAlert(null);
  };

  return {
    activeAlert,
    auditLog,
    loading,
    confirmAlert,
    clearLocalAlert,
    refetchHistory: fetchHistory,
  };
}
