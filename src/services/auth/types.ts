import type { z } from "zod";

import type {
  AuthSessionSchema,
  AuthUserSchema,
  LoginResponseSchema,
  MeResponseSchema,
} from "@/services/auth/auth.schema";

export type AuthUser = z.infer<typeof AuthUserSchema>;
export type AuthSession = z.infer<typeof AuthSessionSchema>;
export type LoginResponse = z.infer<typeof LoginResponseSchema>;
export type MeResponse = z.infer<typeof MeResponseSchema>;

export type LoginPayload = {
  email: string;
  password: string;
};
