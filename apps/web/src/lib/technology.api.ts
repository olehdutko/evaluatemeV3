import { apiGet } from './api-client';
import { technologyResponseSchema, TechnologyResponse } from './schemas/technology';

export async function fetchTechnologies(): Promise<TechnologyResponse> {
  return apiGet('/api/v1/technologies', technologyResponseSchema);
}
