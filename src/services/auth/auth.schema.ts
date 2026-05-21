import { z } from "zod";

export const AuthUserSchema = z.object({
  id: z.number().int(),
  email: z.string(),
  first_name: z.string().nullable(),
  last_name: z.string().nullable(),
  full_name: z.string().nullable(),
});

export const AuthSessionSchema = z.object({
  access_token: z.string(),
  refresh_token: z.string().nullable(),
  token_type: z.literal("Bearer"),
  expires_in: z.number().int(),
  user: AuthUserSchema,
});

export const LoginResponseSchema = AuthSessionSchema;

export const MeResponseSchema = z.object({
  user: AuthUserSchema,
});
