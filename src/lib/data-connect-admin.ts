/**
 * Firebase Data Connect REST API helper for admin queries.
 * Uses the same Data Connect service as the client, but with admin auth.
 */

import { stripProtoPollution } from '@/lib/sanitize';

const DC_API = 'https://firebasedataconnect.googleapis.com/v1beta/projects/pepmax-ac025/locations/us-central1/services/pepmax-service/connectors/default';

interface DataConnectResponse<T = unknown> {
  data?: T;
  errors?: Array<{ message: string }>;
}

export async function dcQuery<T = unknown>(
  operationName: string,
  variables: Record<string, unknown> = {}
): Promise<T> {
  const response = await fetch(`${DC_API}:executeQuery`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ operationName, variables }),
  });

  const result = (await response.json()) as DataConnectResponse<T>;
  if (result.errors?.length) {
    throw new Error(result.errors[0].message);
  }
  return result.data as T;
}

export async function dcMutation<T = unknown>(
  operationName: string,
  variables: Record<string, unknown> = {}
): Promise<T> {
  const cleanVars = stripProtoPollution(variables);
  const response = await fetch(`${DC_API}:executeMutation`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ operationName, variables: cleanVars }),
  });

  const result = (await response.json()) as DataConnectResponse<T>;
  if (result.errors?.length) {
    throw new Error(result.errors[0].message);
  }
  return result.data as T;
}
