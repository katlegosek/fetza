import { parseApiResponse } from "@/api/parse-api-response";
import {
  LoginResponseSchema,
  MeResponseSchema,
} from "@/services/auth/auth.schema";
import type { AuthSession, AuthUser } from "@/services/auth/types";

export function loginModel(data: unknown): AuthSession {
  return parseApiResponse(LoginResponseSchema, data);
}

export function meModel(data: unknown): AuthUser {
  const response = parseApiResponse(MeResponseSchema, data);
  return response.user;
}
