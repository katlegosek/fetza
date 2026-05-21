import type { ZodType } from "zod";

import { ApiError } from "@/api/errors";

export function parseApiResponse<T>(schema: ZodType<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new ApiError(500, {
      code: "server_error",
      message: "Invalid API response",
    });
  }

  return result.data;
}
