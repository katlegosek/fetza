import type { DraftBill } from "@/types/draft-bill";

export function generateLineId(): string {
  return `ln-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

export function cloneBillDraft(seed: DraftBill): DraftBill {
  return {
    ...seed,
    lines: seed.lines.map((l) => ({ ...l })),
  };
}
