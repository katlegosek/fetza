import type { AssignmentMap } from "@/reference/mock-flow/summary/summary.helpers";
import type { DraftBill } from "@/types/draft-bill";

export type { AssignmentMap } from "@/reference/mock-flow/summary/summary.helpers";

export type SummaryMember = { id: string; name: string };

export type SummaryPayload = {
  draft: DraftBill;
  assignments: AssignmentMap;
  members: SummaryMember[];
};

export type SummaryViewMode = "table" | "list";

/** Bottom padding so scroll content clears the floating single-row nav. */
export const SUMMARY_SCROLL_PAD_BOTTOM_NAV = 112;

/** Breathing room below the receipt strip (modal is vertically centered). */
export const SUMMARY_RECEIPT_MODAL_VERTICAL_MARGIN = 40;
/** Matches `paddingTop` + `paddingBottom` on the modal content container (8 + 8). */
export const SUMMARY_RECEIPT_MODAL_INNER_PAD_Y = 16;
/** Nudges the slip below true vertical center (readability / thumb zone). */
export const SUMMARY_RECEIPT_MODAL_SHIFT_DOWN = 72;
