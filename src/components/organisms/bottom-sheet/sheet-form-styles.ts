import { StyleSheet } from "react-native";

/** Shared layout for fields inside bottom sheets — pair with `useBottomSheetAppearance` / `LabeledField`. */
export const bottomSheetFormStyles = StyleSheet.create({
  fieldLabel: {
    letterSpacing: 1,
    fontSize: 12,
    marginTop: 14,
    marginBottom: 8,
    fontWeight: "600",
  },
  fieldCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  fieldInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    paddingVertical: 0,
  },
  currencyPrefix: {
    marginRight: 8,
    fontWeight: "600",
    fontSize: 16,
  },
  buttonRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 24,
  },
  btnDanger: {
    minWidth: 100,
    paddingVertical: 14,
    paddingHorizontal: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  btnDangerText: {
    color: "#dc2626",
    fontWeight: "600",
    fontSize: 16,
  },
  btnSecondary: {
    flex: 1,
    minWidth: 100,
    borderWidth: 2,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  btnSecondaryText: {
    fontWeight: "600",
    fontSize: 16,
  },
  btnPrimary: {
    flex: 1,
    minWidth: 100,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  btnPrimaryText: {
    fontWeight: "600",
    fontSize: 16,
  },
});
