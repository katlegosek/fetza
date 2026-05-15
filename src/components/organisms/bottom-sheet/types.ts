import type { ReactNode } from "react";

export type BottomSheetAppearance = Readonly<{
  sheetBg: string;
  ink: string;
  muted: string;
  border: string;
  fieldBg: string;
  handle: string;
  onPrimary: string;
}>;

export type BottomSheetProps = {
  visible: boolean;
  onClose: () => void;
  bottomInset?: number;
  title: string;
  subtitle?: string;
  children: ReactNode;
};
