export function participantInitials(
  name: string,
  initials?: string | null,
): string {
  if (initials?.trim()) {
    return initials.trim().toUpperCase();
  }

  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return "?";
  }
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}
