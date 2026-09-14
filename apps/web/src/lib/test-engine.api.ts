import { apiPost, apiGet } from './api-client';
import {
  startPersonalQuizRequestSchema,
  startPersonalQuizResponseSchema,
  startTestRequestSchema,
  startTestResponseSchema,
  startSessionRequestSchema,
  testSessionStateResponseSchema,
  submitAnswerRequestSchema,
  submitAnswerResponseSchema,
} from './schemas/test-engine';
import type {
  StartPersonalQuizResponse,
  StartSessionRequest,
  StartTestRequest,
  StartTestResponse,
  TestSessionStateResponse,
  SubmitAnswerRequest,
  SubmitAnswerResponse,
} from './schemas/test-engine';

export function startPersonalQuiz(): Promise<StartPersonalQuizResponse> {
  return apiPost('/api/v1/tests/personal/start', {}, startPersonalQuizRequestSchema, startPersonalQuizResponseSchema);
}

export function startTest(input: StartTestRequest): Promise<StartTestResponse> {
  return apiPost('/api/v1/tests/start', input, startTestRequestSchema, startTestResponseSchema);
}

export function startSessionByAccessCode(accessCode: string): Promise<StartTestResponse> {
  const body: StartSessionRequest = { accessCode };
  return apiPost('/api/v1/sessions/start', body, startSessionRequestSchema, startTestResponseSchema);
}

export function getTestSession(sessionId: string): Promise<TestSessionStateResponse> {
  return apiGet(`/api/v1/tests/${sessionId}`, testSessionStateResponseSchema);
}

export function submitAnswer(
  sessionId: string,
  input: SubmitAnswerRequest,
): Promise<SubmitAnswerResponse> {
  return apiPost(
    `/api/v1/tests/${sessionId}/answer`,
    input,
    submitAnswerRequestSchema,
    submitAnswerResponseSchema,
  );
}
