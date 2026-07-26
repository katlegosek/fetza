import { Redirect } from "expo-router";

export default function ManualEntryRoute() {
  return <Redirect href="/scan/confirm?mode=manual" />;
}
