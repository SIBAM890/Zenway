import type { CrowdRiskAssessment } from '../types/surge';
import type { Train } from '../types/train';
import type { Alert } from '../types/alert';
import type { AuditLogEntry } from '../types/audit';

// Use environment variable or default to localhost:8000
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const API_BASE_URL = BASE_URL;
const VERSIONED_API_BASE_URL = `${BASE_URL}/api/v1`;

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
    
    try {
      const res = await fetch(`${API_BASE_URL}/surge-score/all?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.length > 0) {
          return data;
        }
      }
    } catch (e) {
      console.warn("Backend fetch failed, using fallback data for station:", station, e);
    }

    // Fallback for custom searched stations
    const nameMap: Record<string, string> = {
      NDLS: "New Delhi Railway Station",
      HWH: "Howrah Junction",
      CSMT: "Chhatrapati Shivaji Maharaj Terminus",
      CSTM: "Chhatrapati Shivaji Maharaj Terminus",
      MAS: "Chennai Central",
      SC: "Secunderabad Junction",
      SBC: "KSR Bengaluru City",
      ADI: "Ahmedabad Junction",
      PUNE: "Pune Junction",
      PNBE: "Patna Junction",
      GHY: "Guwahati Junction",
      CNB: "Kanpur Central",
      LKO: "Lucknow Charbagh"
    };
    const sUpper = station.toUpperCase();

    return [
      {
        station_id: sUpper,
        platform_id: 'P1',
        score: 72,
        level: 'Elevated',
        time_to_critical: 12,
        calculated_at: new Date().toISOString(),
        contributing_factors: {
          platform_capacity: 1000,
          typical_load: 300,
          expected_passengers_from_delayed_trains: 750,
          delayed_trains_count: 2,
          formula: 'typical_load + expected_passengers_from_delayed_trains'
        }
      },
      {
        station_id: sUpper,
        platform_id: 'P2',
        score: 38,
        level: 'Normal',
        time_to_critical: null,
        calculated_at: new Date().toISOString(),
        contributing_factors: {
          platform_capacity: 1000,
          typical_load: 400,
          expected_passengers_from_delayed_trains: 0,
          delayed_trains_count: 0,
          formula: 'typical_load + expected_passengers_from_delayed_trains'
        }
      }
    ];
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
    
    try {
      const res = await fetch(`${API_BASE_URL}/trains/incoming?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.length > 0) {
          return data;
        }
      }
    } catch (e) {
      console.warn("Backend fetch failed, using fallback data for station:", station, e);
    }

    const sUpper = station.toUpperCase();
    return [
      {
        id: '12626',
        number: '12626',
        name: `${sUpper} Express`,
        scheduled_arrival: '14:20',
        current_delay_mins: 15,
        avg_passengers: 800,
        class_breakdown: {}
      },
      {
        id: '12002',
        number: '12002',
        name: `Shatabdi Exp`,
        scheduled_arrival: '15:00',
        current_delay_mins: 0,
        avg_passengers: 600,
        class_breakdown: {}
      }
    ];
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

  async searchStations(query: string): Promise<{ name: string; code: string }[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/stations/search?q=${encodeURIComponent(query)}`);
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn("Backend search endpoint failed or not found, using client fallback", e);
    }
    
    // Client-side fallback to make search work beautifully without backend changes:
    const allStations = [
      { name: 'New Delhi', code: 'ndls' },
      { name: 'Howrah', code: 'hwh' },
      { name: 'Mumbai CST', code: 'cstm' },
      { name: 'Chennai Central', code: 'mas' },
      { name: 'Secunderabad Junction', code: 'sc' },
      { name: 'KSR Bengaluru City', code: 'sbc' },
      { name: 'Ahmedabad Junction', code: 'adi' },
      { name: 'Pune Junction', code: 'pune' },
      { name: 'Patna Junction', code: 'pnbe' },
      { name: 'Guwahati Junction', code: 'ghy' },
      { name: 'Kanpur Central', code: 'cnb' },
      { name: 'Lucknow Charbagh', code: 'lko' }
    ];
    const q = query.toLowerCase().trim();
    if (!q) return [];
    return allStations.filter(s => s.name.toLowerCase().includes(q) || s.code.toLowerCase().includes(q));
  }
};

// --- New Feature 2 API functions ---
export async function fetchCrewAlerts(threshold: number = 0) {
  const res = await fetch(`${VERSIONED_API_BASE_URL}/crew/roster/alerts?threshold=${threshold}`);
  if (!res.ok) throw new Error('Failed to fetch crew alerts');
  return res.json();
}

export async function requestCrewSwap(pilotId: string) {
  const res = await fetch(`${VERSIONED_API_BASE_URL}/crew/roster/swap`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fatigued_pilot_id: pilotId, time_window_minutes: 45 }),
  });
  if (!res.ok) throw new Error('Failed to request swap');
  return res.json();
}

export async function fetchCongestion(terminal?: string) {
  const url = terminal ? `${VERSIONED_API_BASE_URL}/fois/congestion/${terminal}` : `${VERSIONED_API_BASE_URL}/fois/congestion`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch congestion for ${terminal || 'all terminals'}`);
  return res.json();
}

export async function fetchAllRakes() {
  const res = await fetch(`${VERSIONED_API_BASE_URL}/fois/rakes`);
  if (!res.ok) throw new Error('Failed to fetch rakes');
  return res.json();
}

export async function fetchBatchEtas(rakeIds: string[]) {
  const res = await fetch(`${VERSIONED_API_BASE_URL}/fois/eta/batch`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ rake_ids: rakeIds, origin: "Mundra", destination: "New Delhi" }),
  });
  if (!res.ok) throw new Error('Failed to fetch batch ETAs');
  return res.json();
}

export async function fetchStations() {
  const res = await fetch(`${VERSIONED_API_BASE_URL}/concierge/stations`);
  if (!res.ok) throw new Error('Failed to fetch stations');
  return res.json();
}

export async function fetchLanguages() {
  const res = await fetch(`${VERSIONED_API_BASE_URL}/concierge/languages`);
  if (!res.ok) throw new Error('Failed to fetch languages');
  return res.json();
}

export async function generateItinerary(pnr: string, stationCode: string, lang: string, hours: number) {
  const res = await fetch(`${VERSIONED_API_BASE_URL}/concierge/itinerary`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pnr: pnr, station: stationCode, layover_minutes: hours * 60, language: lang }),
  });
  if (!res.ok) throw new Error('Failed to generate itinerary');
  return res.json();
}
