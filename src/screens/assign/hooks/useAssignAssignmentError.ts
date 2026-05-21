import { MUTATION_ERROR_FALLBACKS } from "@/api/api-error-message";
import { useMutationErrorBanner } from "@/hooks/use-mutation-error-banner";

export function useAssignAssignmentError() {
  const { message, setMessage, showError } = useMutationErrorBanner(
    MUTATION_ERROR_FALLBACKS.assignAssignment,
  );

  return {
    assignmentError: message,
    setAssignmentError: setMessage,
    showAssignmentError: showError,
  };
}
