import { parseApiResponse } from "@/api/parse-api-response";
import {
  LoginResponseSchema,
  MeResponseSchema,
} from "@/services/auth/auth.schema";
import type { LoginResponse, MeResponse } from "@/services/auth/types";

export function parseLoginResponse(data: unknown): LoginResponse {
  return parseApiResponse(LoginResponseSchema, data);
}

export function parseMeResponse(data: unknown): MeResponse {
  return parseApiResponse(MeResponseSchema, data);
}
