import { z } from "zod";

export const AuthUserSchema = z.object({
  id: z.number().int(),
  email: z.string(),
  first_name: z.string().nullable().optional(),
  last_name: z.string().nullable().optional(),
  full_name: z.string().nullable().optional(),
});

export const AuthSessionSchema = z.object({
  access_token: z.string(),
  refresh_token: z.string().nullable().optional(),
  token_type: z.string().nullable().optional(),
  expires_in: z.number().int().nullable().optional(),
  user: AuthUserSchema,
});

export const LoginResponseSchema = AuthSessionSchema;

export const MeResponseSchema = z.object({
  user: AuthUserSchema,
});
