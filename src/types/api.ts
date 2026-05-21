/**
 * @deprecated Compatibility barrel — prefer direct service type imports for new code
 * (e.g. @/services/bills/bill.types). ApiError types below are shared, not service-specific.
 */
/** Shared API error types (used by api/client and api/errors). */
export type ApiErrorCode =
  | "validation_error"
  | "not_found"
  | "bad_request"
  | "server_error"
  | "processing_failed"
  | "network_error";

export interface ApiErrorPayload {
  code: ApiErrorCode;
  message: string;
  details?: Record<string, string[]>;
}

export interface ApiErrorResponse {
  error: ApiErrorPayload;
}

export type {
  BillCreateResponse,
  BillDetail,
  BillIndexItem,
  BillShowResponse,
  BillStatus,
  BillSummary,
  BillSummaryAdjustment,
  BillSummaryBill,
  BillSummaryParticipant,
  BillSummaryTotals,
  BillsIndexResponse,
  IsoDateTime,
} from "@/services/bills/bill.types";

export type {
  BillSummaryMutationResponse,
  ItemAssignment,
  ReplaceAssignmentsInput,
  SplitMethod,
} from "@/services/assignments/assignment.types";

export type {
  BillParticipant,
  ParticipantDeleteResponse,
  ParticipantInput,
  ParticipantMutationResponse,
} from "@/services/participants/participant.types";

export type {
  ProcessingRunStatus,
  Receipt,
  ReceiptAdjustment,
  ReceiptAdjustmentDeleteResponse,
  ReceiptAdjustmentInput,
  ReceiptAdjustmentKind,
  ReceiptAdjustmentMutationResponse,
  ReceiptImage,
  ReceiptItem,
  ReceiptItemDeleteResponse,
  ReceiptItemInput,
  ReceiptItemMutationResponse,
  ReceiptProcessingRun,
  ReceiptShowResponse,
  ReceiptStatus,
  ReceiptStatusPayload,
  ReceiptUploadResponse,
} from "@/services/receipts/receipt.types";
