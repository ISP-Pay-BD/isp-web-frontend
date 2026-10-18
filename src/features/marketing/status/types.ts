/** Public status (`GET /v1/public/status`). */

export type ServiceHealth = 'operational' | 'degraded' | 'outage';

export interface StatusComponent {
  key: string;
  name: string;
  status: ServiceHealth;
  latencyMs: number | null;
}

export interface PublicStatus {
  overall: ServiceHealth;
  message: string;
  components: StatusComponent[];
  /** ISO 8601 */
  checkedAt: string;
}
