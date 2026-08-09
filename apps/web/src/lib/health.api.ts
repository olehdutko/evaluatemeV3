import { apiGet } from './api-client';
import { healthResponseSchema, HealthResponse } from './schemas/health.schema';

export async function fetchHealth(): Promise<HealthResponse> {
  const response = await apiGet<HealthResponse['data']>('/health');
  if (!response.success) {
    throw new Error('Health check failed');
  }
  return healthResponseSchema.parse({
    success: true,
    data: response.data,
  });
}
