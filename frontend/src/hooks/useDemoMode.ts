import { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';

export function useDemoMode() {
  // Read parameters from URL query string
  const getQueryParams = () => {
    const params = new URLSearchParams(window.location.search);
    const demoVal = params.get('demo');
    return {
      isDemo: demoVal === 'true' || demoVal === 'feb15',
      scenario: params.get('scenario') || 'critical',
    };
  };

  const { isDemo, scenario } = getQueryParams();
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const intervalRef = useRef<number | null>(null);

  // Synchronize play/pause timer
  useEffect(() => {
    if (isDemo && isPlaying) {
      intervalRef.current = window.setInterval(() => {
        setElapsedSeconds((prev) => {
          if (prev >= 60) {
            setIsPlaying(false); // Stop when reaching end of timeline
            return 60;
          }
          return prev + 1;
        });
      }, 1000); // 1 tick per second
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isDemo, isPlaying]);

  const togglePlayback = () => {
    setIsPlaying(!isPlaying);
  };

  const setTime = (seconds: number) => {
    setElapsedSeconds(Math.max(0, Math.min(60, seconds)));
  };

  const resetDemo = async (stationCode?: string) => {
    setIsPlaying(false);
    setElapsedSeconds(0);
    try {
      await api.resetDemoScenario(scenario, stationCode);
    } catch (e) {
      console.error('Failed to reset backend demo state:', e);
    }
  };

  const selectScenario = (newScenario: string) => {
    const url = new URL(window.location.href);
    url.searchParams.set('demo', 'true');
    url.searchParams.set('scenario', newScenario);
    window.location.href = url.toString(); // Reload to reset whole application state
  };

  const disableDemo = () => {
    const url = new URL(window.location.href);
    url.searchParams.delete('demo');
    url.searchParams.delete('scenario');
    window.location.href = url.toString();
  };

  return {
    isDemo,
    scenario,
    elapsedSeconds,
    isPlaying,
    togglePlayback,
    setTime,
    resetDemo,
    selectScenario,
    disableDemo,
  };
}
