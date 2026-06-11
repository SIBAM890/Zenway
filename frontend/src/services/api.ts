import type { CrowdRiskAssessment } from '../types/surge';
import type { Train } from '../types/train';
import type { Alert } from '../types/alert';
import type { AuditLogEntry } from '../types/audit';

// Use environment variable or default to localhost:8000
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const api = {
  getEventStreamUrl(): string {
    return `${API_BASE_URL}/events/stream`;
  },

  async fetchSurgeScores(
    station: string,
    demo: boolean = false,
    scenario: string = 'critical',
    elapsed?: number
  ): Promise<CrowdRiskAssessment[]> {
    const params = new URLSearchParams({
      station,
      demo: String(demo),
      scenario,
    });
    if (elapsed !== undefined) {
      params.append('elapsed', String(elapsed));
    }
    const res = await fetch(`${API_BASE_URL}/surge-score/all?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch surge scores');
    return res.json();
  },

  async fetchIncomingTrains(
    station: string,
    demo: boolean = false,
    scenario: string = 'critical',
    elapsed?: number
  ): Promise<Train[]> {
    const params = new URLSearchParams({
      station,
      demo: String(demo),
      scenario,
    });
    if (elapsed !== undefined) {
      params.append('elapsed', String(elapsed));
    }
    const res = await fetch(`${API_BASE_URL}/trains/incoming?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch incoming trains');
    return res.json();
  },

  async confirmAlert(alertId: string): Promise<Alert> {
    const res = await fetch(`${API_BASE_URL}/alert/confirm`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ alert_id: alertId }),
    });
    if (!res.ok) throw new Error('Failed to confirm alert');
    return res.json();
  },

  async fetchAuditHistory(station?: string): Promise<AuditLogEntry[]> {
    const url = station 
      ? `${API_BASE_URL}/events/history?station=${station}` 
      : `${API_BASE_URL}/events/history`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch audit history');
    return res.json();
  },

  async resetDemoScenario(scenario: string, station?: string): Promise<{ status: string; message: string }> {
    const url = station 
      ? `${API_BASE_URL}/demo/reset?scenario=${scenario}&station=${station}` 
      : `${API_BASE_URL}/demo/reset?scenario=${scenario}`;
    const res = await fetch(url, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Failed to reset demo scenario');
    return res.json();
  },
};
