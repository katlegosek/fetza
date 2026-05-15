import { AppText, ScreenContainer } from "@/components";

export default function ManualEntryScreen() {
  return (
    <ScreenContainer className="justify-center px-6">
      <AppText className="text-center text-base leading-6 text-foreground">
        Manual entry — line items, totals, and the Review flow will plug in
        here.
      </AppText>
    </ScreenContainer>
  );
}
