import { useCallback, useEffect, useState } from "react";

import { assignSaveErrorMessage } from "@/screens/assign/assign.schema";

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
      assignSaveErrorMessage(
        error,
        "Could not save assignment. Please try again.",
      ),
    );
  }, []);

  return {
    assignmentError,
    setAssignmentError,
    showAssignmentError,
  };
}
