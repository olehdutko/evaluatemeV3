import { apiGet } from './api-client';
import { myResultListSchema, myResultDetailSchema } from './schemas/me';
import type { MyResultListResponse, MyResultDetailResponse } from './schemas/me';

export function getMyResults(): Promise<MyResultListResponse> {
  return apiGet('/api/v1/me/results', myResultListSchema);
}

export function getMyResultDetail(resultCode: string): Promise<MyResultDetailResponse> {
  return apiGet(`/api/v1/me/results/${encodeURIComponent(resultCode)}`, myResultDetailSchema);
}
