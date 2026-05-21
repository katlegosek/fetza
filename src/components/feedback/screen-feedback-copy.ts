/** Shared screen titles for full-screen feedback states. */
export const SCREEN_TITLES = {
  assign: "Assign Items",
  billDetail: "Summary",
  review: "Review",
} as const;

/** Shared user-facing copy for loading, error, and empty states. */
export const FEEDBACK_MESSAGES = {
  invalidBillLink: "This bill link is invalid.",
  billDetailLoading: "Loading bill summary…",
  billDetailNoData: "No summary data for this bill.",
  assignLoading: "Loading bill…",
  assignLoadError: "Something went wrong loading this bill.",
  assignNoAssignmentData: "No assignment data for this bill.",
  assignNoLines: "No receipt items to assign on this bill yet.",
  assignNoParticipants: "No participants on this bill yet.",
  reviewLoading: "Loading receipt…",
  reviewLoadError: "Something went wrong loading this receipt.",
  reviewNoReceipt: "No receipt data for this bill.",
} as const;

export const CENTERED_EMPTY_CONTAINER_CLASS =
  "items-center justify-center px-6";

export const CENTERED_EMPTY_MESSAGE_CLASS =
  "text-center text-base text-muted-foreground";

/** Review screen uses `bg-background` on the shell. */
export const REVIEW_FEEDBACK_CONTAINER_CLASS = "bg-background";
