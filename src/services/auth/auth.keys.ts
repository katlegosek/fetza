export const authKeys = {
  all: ["auth"] as const,
  currentUser: () => [...authKeys.all, "me"] as const,
  session: () => [...authKeys.all, "session"] as const,
};
