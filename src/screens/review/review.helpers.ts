import { Alert } from "react-native";

// TODO(production): Remove notConnectedYet stubs — connect merchant/clear/rescan to API. See docs/DEV_ONLY_TODOS.md
export function notConnectedYet() {
  Alert.alert(
    "Coming soon",
    "Editing receipts is not connected to the server yet.",
  );
}

export function reviewOverflowMenuTop(safeAreaTop: number): number {
  return safeAreaTop + 60;
}

export function reviewReceiptWidth(windowWidth: number): number {
  return Math.min(352, windowWidth - 32);
}

export function reviewFloatingActionScrollClearance(
  safeAreaBottom: number,
): number {
  return safeAreaBottom + 72;
}
