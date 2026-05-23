const billsBase = "/bills";
const billParticipantsBase = "/bill_participants";

export default {
  billParticipants: (billId: number) => `${billsBase}/${billId}/participants`,
  participant: (participantId: number) =>
    `${billParticipantsBase}/${participantId}`,
};
