export class AuthSessionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthSessionError";
  }
}

export function isAuthSessionError(error: unknown): error is AuthSessionError {
  return error instanceof AuthSessionError;
}
