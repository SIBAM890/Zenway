export interface ActionCard {
  alert_id: string;
  summary: string;
  actions: string[]; // Exactly 5 actions
  time_window: string;
  confidence: number;
}

export interface Announcement {
  alert_id: string;
  language: string;
  text: string;
  audio_url?: string;
}

export interface Alert {
  id: string;
  risk_assessment_id: string;
  status: 'pending' | 'confirmed' | 'broadcasted';
  created_at: string;
  action_card?: ActionCard;
  announcements?: Announcement[];
}

export interface Operator {
  id: string;
  name: string;
  station_id: string;
}

export interface AgentRunStep {
  node: string;
  description: string;
  input: Record<string, any>;
  output: Record<string, any>;
  started_at: string;
  completed_at: string;
}

export interface AgentRun {
  id: string;
  alert_id: string;
  started_at: string;
  completed_at: string;
  steps: AgentRunStep[];
}
