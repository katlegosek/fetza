export const participantUrls = {
  billParticipants: (billId: number) => `/bills/${billId}/participants`,
  participant: (participantId: number) => `/bill_participants/${participantId}`,
} as const;
