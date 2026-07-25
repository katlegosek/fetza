import Ionicons from "@expo/vector-icons/Ionicons";
import { Pressable, Share, View } from "react-native";

import { AppText } from "@/components";
import { useThemeColors } from "@/hooks";

export const BillRoomShareCard = ({
  shareUrl,
  shareToken,
}: {
  shareUrl: string | null;
  shareToken: string | null;
}) => {
  const colors = useThemeColors();
  const configuredWebUrl = process.env.EXPO_PUBLIC_WEB_APP_URL?.replace(
    /\/$/,
    "",
  );
  const generatedShareUrl =
    configuredWebUrl && shareToken
      ? `${configuredWebUrl}/b/${shareToken}`
      : null;
  const shareValue =
    shareUrl ??
    generatedShareUrl ??
    shareToken ??
    "Room link is being prepared";

  const handleShare = async () => {
    if (!shareUrl && !shareToken) return;
    await Share.share({
      message: `Join my Fetza bill room and claim your items: ${shareValue}`,
    });
  };

  return (
    <View className="rounded-3xl border border-borderSubtle bg-background p-5">
      <AppText className="text-lg font-bold text-foreground">
        Share this bill room
      </AppText>
      <AppText className="mt-1 text-sm leading-5 text-muted">
        Let friends join and claim their items. No account or app needed.
      </AppText>

      <View className="mt-4 flex-row gap-4">
        <View className="h-24 w-24 items-center justify-center rounded-2xl border border-dashed border-muted bg-stone-50 dark:bg-neutral-900">
          <Ionicons name="qr-code-outline" size={42} color={colors.muted} />
          <AppText className="mt-1 text-[10px] text-muted">
            QR coming soon
          </AppText>
        </View>
        <View className="min-w-0 flex-1 justify-center">
          <AppText className="text-xs font-semibold uppercase tracking-wide text-muted">
            Share link
          </AppText>
          <AppText className="mt-1 text-sm text-foreground" numberOfLines={3}>
            {shareValue}
          </AppText>
          <Pressable
            accessibilityRole="button"
            className="mt-3 self-start rounded-full bg-foreground px-4 py-2 active:opacity-80"
            disabled={!shareUrl && !shareToken}
            onPress={() => void handleShare()}
          >
            <AppText className="font-semibold text-background">Share</AppText>
          </Pressable>
        </View>
      </View>
    </View>
  );
};
