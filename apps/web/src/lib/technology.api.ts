import { apiGet } from './api-client';
import {
  technologyResponseSchema,
  TechnologyResponse,
  technologyDetailResponseSchema,
  TechnologyDetailResponse,
  technologyPreviewResponseSchema,
  TechnologyPreviewResponse,
} from './schemas/technology';

export async function fetchTechnologies(): Promise<TechnologyResponse> {
  return apiGet('/api/v1/technologies', technologyResponseSchema);
}

export async function fetchTechnologyBySlug(slug: string): Promise<TechnologyDetailResponse> {
  return apiGet(`/api/v1/technologies/${encodeURIComponent(slug)}`, technologyDetailResponseSchema);
}

export async function fetchTechnologyPreview(slug: string): Promise<TechnologyPreviewResponse> {
  return apiGet(`/api/v1/technologies/${encodeURIComponent(slug)}/preview`, technologyPreviewResponseSchema);
}
