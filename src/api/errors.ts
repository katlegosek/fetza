import type {
  ApiErrorCode,
  ApiErrorPayload,
  ApiErrorResponse,
} from "@/api/api.types";

export class ApiError extends Error {
  readonly status: number;
  readonly code: ApiErrorCode;
  readonly details?: Record<string, string[]>;

  constructor(status: number, payload: ApiErrorPayload) {
    super(payload.message);
    this.name = "ApiError";
    this.status = status;
    this.code = payload.code;
    this.details = payload.details;
  }

  static network(): ApiError {
    return new ApiError(0, {
      code: "network_error",
      message: "Could not connect to the server.",
    });
  }

  static fromResponse(status: number, body: unknown): ApiError {
    if (isApiErrorResponse(body)) {
      return new ApiError(status, body.error);
    }

    return new ApiError(status, {
      code: "server_error",
      message:
        typeof body === "object" && body !== null && "message" in body
          ? String((body as { message: unknown }).message)
          : "Request failed.",
    });
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

/** @deprecated Use `getApiErrorMessage` from `@/api/api-error-message`. */
export { getApiErrorMessage as mutationErrorMessage } from "@/api/api-error-message";

export function isApiErrorResponse(body: unknown): body is ApiErrorResponse {
  if (typeof body !== "object" || body === null) {
    return false;
  }

  const error = (body as ApiErrorResponse).error;
  return (
    typeof error === "object" &&
    error !== null &&
    typeof error.code === "string" &&
    typeof error.message === "string"
  );
}
