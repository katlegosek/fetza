import { useCallback, useState } from "react";

export type UseBottomSheetVisibilityResult = {
  visible: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
  setVisible: (next: boolean) => void;
};

/**
 * Modal / bottom-sheet visibility (`visible` + `open` / `close` / `toggle`).
 * UI-agnostic — pair with any component that takes `visible` and `onClose`.
 * For several mutually exclusive sheets, prefer one state machine instead of many hooks.
 */
export function useBottomSheetVisibility(
  initialVisible = false,
): UseBottomSheetVisibilityResult {
  const [visible, setVisible] = useState(initialVisible);
  const open = useCallback(() => setVisible(true), []);
  const close = useCallback(() => setVisible(false), []);
  const toggle = useCallback(() => setVisible((v) => !v), []);
  return { visible, open, close, toggle, setVisible };
}
