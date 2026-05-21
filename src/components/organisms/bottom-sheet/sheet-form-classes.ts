/**
 * Tailwind classes for bottom-sheet fields and actions.
 * Use with `useBottomSheetAppearance` for colors (`style` on text / inputs where needed).
 */
export const bottomSheetFormClasses = {
  fieldLabel: "mt-3.5 mb-2 text-xs font-semibold tracking-[1px]",
  fieldCard: "flex-row items-center rounded-[18px] border px-4 py-3.5",
  fieldInput: "flex-1 py-0 text-base font-semibold",
  currencyPrefix: "mr-2 text-base font-semibold",
  buttonRow: "mt-6 flex-row flex-wrap gap-3",
  btnDanger: "min-w-[100px] items-center justify-center px-4 py-3.5",
  btnDangerText: "text-base font-semibold text-red-600",
  btnSecondary:
    "min-w-[100px] flex-1 items-center justify-center rounded-2xl border-2 py-3.5",
  btnSecondaryText: "text-base font-semibold",
  btnPrimary:
    "min-w-[100px] flex-1 items-center justify-center rounded-2xl py-3.5",
  btnPrimaryText: "text-base font-semibold",
} as const;
