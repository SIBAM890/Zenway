export interface Train {
  id: string;
  number: string;
  name: string;
  scheduled_arrival: string; // Format: "HH:MM"
  current_delay_mins: number;
  avg_passengers: number;
  class_breakdown: Record<string, number>;
}

export interface DelayEvent {
  train_id: string;
  station_id: string;
  platform_id: string;
  delay_mins: number;
  detected_at: string; // ISO timestamp
}
