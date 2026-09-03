import { apiGet } from './api-client';
import { publicResultSchema } from './schemas/public-result';
import type { PublicResultResponse } from './schemas/public-result';

export function getPublicResult(resultCode: string): Promise<PublicResultResponse> {
  return apiGet(`/api/v1/public/results/${encodeURIComponent(resultCode)}`, publicResultSchema);
}
