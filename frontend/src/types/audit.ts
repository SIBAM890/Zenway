export interface AuditLogEntry {
  id: string;
  event_type: string;
  timestamp: string;
  station_id: string;
  platform_id?: string;
  data: Record<string, unknown>;
}
