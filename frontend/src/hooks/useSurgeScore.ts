import { useState, useEffect } from 'react';
import { api } from '../services/api';
import type { CrowdRiskAssessment } from '../types/surge';
import type { Train } from '../types/train';

interface UseSurgeScoreProps {
  station: string;
  isDemo: boolean;
  scenario: string;
  elapsedSeconds: number;
}

export function useSurgeScore({ station, isDemo, scenario, elapsedSeconds }: UseSurgeScoreProps) {
  const [assessments, setAssessments] = useState<CrowdRiskAssessment[]>([]);
  const [trains, setTrains] = useState<Train[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [assessmentsData, trainsData] = await Promise.all([
        api.fetchSurgeScores(station, isDemo, scenario, isDemo ? elapsedSeconds : undefined),
        api.fetchIncomingTrains(station, isDemo, scenario, isDemo ? elapsedSeconds : undefined),
      ]);
      setAssessments(assessmentsData);
      setTrains(trainsData);
      setError(null);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e);
      setError(message || 'Error fetching real-time railway telemetry');
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Trigger fetch when station, demo flags, or elapsed time change
  useEffect(() => {
    fetchData();
  }, [station, isDemo, scenario, elapsedSeconds]);

  // Set up polling interval for live mode (every 5 seconds)
  useEffect(() => {
    if (isDemo) return; // In demo mode, the timeline clock handles updates

    const interval = setInterval(() => {
      fetchData();
    }, 5000);

    return () => clearInterval(interval);
  }, [station, isDemo, scenario]);

  return {
    assessments,
    trains,
    loading,
    error,
    refetch: fetchData,
  };
}
