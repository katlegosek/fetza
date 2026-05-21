import { useRouter } from "expo-router";

import { ScreenEmptyState } from "@/components/feedback/ScreenEmptyState";

export type MissingBillStateProps = {
  title: string;
  message: string;
};

export function MissingBillState({ title, message }: MissingBillStateProps) {
  const router = useRouter();

  return (
    <ScreenEmptyState
      title={title}
      message={message}
      onBack={() => router.back()}
      actionLabel="Go to Home"
      onAction={() => router.replace("/(tabs)")}
    />
  );
}
