import { apiGet } from './api-client';
import { healthResponseSchema, HealthResponse } from './schemas/health';

export async function fetchHealth(): Promise<HealthResponse> {
  return apiGet('/api/v1/health', healthResponseSchema);
}
