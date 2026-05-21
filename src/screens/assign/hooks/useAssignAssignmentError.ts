import { useCallback, useEffect, useState } from "react";

import { getApiErrorMessage } from "@/api/api-error-message";

export function useAssignAssignmentError() {
  const [assignmentError, setAssignmentError] = useState<string | null>(null);

  useEffect(() => {
    if (!assignmentError) {
      return;
    }

    const timeout = setTimeout(() => setAssignmentError(null), 4000);
    return () => clearTimeout(timeout);
  }, [assignmentError]);

  const showAssignmentError = useCallback((error: unknown) => {
    setAssignmentError(
      getApiErrorMessage(error, "Could not save assignment. Please try again."),
    );
  }, []);

  return {
    assignmentError,
    setAssignmentError,
    showAssignmentError,
  };
}
