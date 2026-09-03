import { apiGet } from './api-client';
import {
  technologyResponseSchema,
  TechnologyResponse,
  technologyDetailResponseSchema,
  TechnologyDetailResponse,
} from './schemas/technology';

export async function fetchTechnologies(): Promise<TechnologyResponse> {
  return apiGet('/api/v1/technologies', technologyResponseSchema);
}

export async function fetchTechnologyBySlug(slug: string): Promise<TechnologyDetailResponse> {
  return apiGet(`/api/v1/technologies/${encodeURIComponent(slug)}`, technologyDetailResponseSchema);
}
