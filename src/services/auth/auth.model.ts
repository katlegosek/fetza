import { parseApiResponse } from "@/api/parse-api-response";
import {
  LoginResponseSchema,
  MeResponseSchema,
} from "@/services/auth/auth.schema";
import type { AuthSession, AuthUser } from "@/services/auth/types";

export const loginModel = (data: unknown): AuthSession =>
  parseApiResponse(LoginResponseSchema, data);

export const meModel = (data: unknown): AuthUser => {
  const response = parseApiResponse(MeResponseSchema, data);
  return response.user;
};
