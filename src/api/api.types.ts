/** Shared API error types (used by api/client and api/errors). */
// Mirrors the `code` field returned by Rails mobile API errors
// (`{ error: { code, message, details? } }`). Keep in sync with
// `Api::Mobile::V1::BaseController#render_api_error`.
export type ApiErrorCode =
  | "unauthorized"
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
