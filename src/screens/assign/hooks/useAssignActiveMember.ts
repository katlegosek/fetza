import { useCallback, useRef, useState } from "react";

export const useAssignActiveMember = () => {
  const [activeMemberId, setActiveMemberId] = useState<string | null>(null);
  const activeMemberIdRef = useRef<string | null>(null);

  const setActiveMember = useCallback((memberId: string | null) => {
    activeMemberIdRef.current = memberId;
    setActiveMemberId(memberId);
  }, []);

  return {
    activeMemberId,
    activeMemberIdRef,
    setActiveMember,
  };
};
