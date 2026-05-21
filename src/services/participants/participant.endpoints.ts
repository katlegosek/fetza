export const participantEndpoints = {
  billParticipants: (billId: number) => `/bills/${billId}/participants`,
  participant: (participantId: number) => `/bill_participants/${participantId}`,
} as const;
