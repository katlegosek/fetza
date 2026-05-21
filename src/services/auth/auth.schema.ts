import { z } from "zod";

import { IsoDateTimeSchema } from "@/services/api-common.schema";

export const AuthUserSchema = z.object({
  id: z.number().int(),
  email: z.string(),
  name: z.string().nullable().optional(),
});

export const AuthSessionSchema = z.object({
  access_token: z.string(),
  refresh_token: z.string().optional(),
  token_type: z.string().default("Bearer"),
  expires_at: IsoDateTimeSchema.optional(),
});

export const LoginResponseSchema = z.object({
  user: AuthUserSchema,
  session: AuthSessionSchema,
});

export const MeResponseSchema = z.object({
  user: AuthUserSchema,
});
