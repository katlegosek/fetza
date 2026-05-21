/** Shared API error types (used by api/client and api/errors). */
export type ApiErrorCode =
  | "validation_error"
  | "not_found"
  | "bad_request"
  | "server_error"
  | "processing_failed"
  | "network_error";

export interface ApiErrorPayload {
  code: ApiErrorCode;
  message: string;
  details?: Record<string, string[]>;
}

export interface ApiErrorResponse {
  error: ApiErrorPayload;
}
