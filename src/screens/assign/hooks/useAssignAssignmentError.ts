import { useCallback, useEffect, useState } from "react";

import { isApiError } from "@/api/errors";

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
    const message = isApiError(error)
      ? error.message
      : "Could not save assignment. Please try again.";
    setAssignmentError(message);
  }, []);

  return {
    assignmentError,
    setAssignmentError,
    showAssignmentError,
  };
}
