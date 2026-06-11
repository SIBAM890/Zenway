export interface Platform {
  id: string;
  name: string;
  max_capacity: number;
  typical_load_peak: number;
  typical_load_offpeak: number;
}

export interface Station {
  id: string;
  name: string;
  code: string;
  platforms: Platform[];
}

export interface CrowdRiskAssessment {
  station_id: string;
  platform_id: string;
  score: number;
  level: 'Normal' | 'Elevated' | 'Critical';
  time_to_critical: number | null;
  contributing_factors: {
    platform_capacity: number;
    typical_load: number;
    expected_passengers_from_delayed_trains: number;
    delayed_trains_count: number;
    delayed_train_numbers?: string[];
    formula: string;
  };
  calculated_at: string;
}
