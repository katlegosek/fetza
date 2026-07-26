import Ionicons from "@expo/vector-icons/Ionicons";
import * as Clipboard from "expo-clipboard";
import { useEffect, useMemo, useState } from "react";
import { Linking, Platform, Pressable, Share, View } from "react-native";
import QRCode from "react-native-qrcode-svg";

import { AppText } from "@/components";
import { useThemeColors } from "@/hooks";
import { guestShareMessage, resolveGuestShareLink } from "@/services/bill-room";

type ShareActionProps = {
  accessibilityLabel: string;
  icon: React.ComponentProps<typeof Ionicons>["name"];
  label: string;
  disabled: boolean;
  onPress: () => void;
};

const ShareAction = ({
  accessibilityLabel,
  icon,
  label,
  disabled,
  onPress,
}: ShareActionProps) => {
  const colors = useThemeColors();

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      className="min-w-0 flex-1 items-center gap-1.5 rounded-2xl border border-borderSubtle bg-background px-2 py-3 active:opacity-70 disabled:opacity-40"
      disabled={disabled}
      onPress={onPress}
    >
      <Ionicons color={colors.foreground} name={icon} size={20} />
      <AppText className="text-center text-xs font-semibold text-foreground">
        {label}
      </AppText>
    </Pressable>
  );
};

export const BillRoomShareCard = ({
  shareUrl,
  shareToken,
}: {
  shareUrl: string | null;
  shareToken: string | null;
}) => {
  const colors = useThemeColors();
  const [feedback, setFeedback] = useState<string | null>(null);
  const shareLink = useMemo(
    () => resolveGuestShareLink({ shareUrl, shareToken }),
    [shareToken, shareUrl],
  );
  const url = shareLink.url;
  const sharingDisabled = !url;

  useEffect(() => {
    if (!feedback) return;
    const timeout = setTimeout(() => setFeedback(null), 2_500);
    return () => clearTimeout(timeout);
  }, [feedback]);

  const handleCopy = async () => {
    if (!url) return;

    try {
      await Clipboard.setStringAsync(url);
      setFeedback("Link copied");
    } catch {
      setFeedback("Couldn’t copy the link");
    }
  };

  const handleWhatsApp = async () => {
    if (!url) return;

    try {
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(
        guestShareMessage(url),
      )}`;
      await Linking.openURL(whatsappUrl);
    } catch {
      setFeedback("Couldn’t open WhatsApp");
    }
  };

  const handleShare = async () => {
    if (!url) return;

    try {
      await Share.share({
        message: guestShareMessage(url),
        ...(Platform.OS === "ios" ? { url } : {}),
      });
    } catch {
      setFeedback("Couldn’t open sharing");
    }
  };

  return (
    <View className="rounded-3xl border border-borderSubtle bg-background p-5">
      <AppText className="text-lg font-bold text-foreground">
        Share this table
      </AppText>
      <AppText className="mt-1 text-sm leading-5 text-muted">
        Let friends join and claim their items. No account or app needed.
      </AppText>

      <View className="mt-5 items-center rounded-3xl bg-stone-50 p-5 dark:bg-neutral-900">
        {url ? (
          <View
            accessibilityLabel="QR code for the guest table link"
            className="rounded-2xl bg-white p-3"
          >
            <QRCode
              backgroundColor="#ffffff"
              color="#0a0a0a"
              size={136}
              value={url}
            />
          </View>
        ) : (
          <View className="h-40 w-40 items-center justify-center rounded-2xl border border-dashed border-muted">
            <Ionicons color={colors.muted} name="qr-code-outline" size={48} />
            <AppText className="mt-2 text-xs font-semibold text-muted">
              QR unavailable
            </AppText>
          </View>
        )}

        <AppText
          className="mt-4 text-center text-sm text-foreground"
          numberOfLines={3}
          selectable={!!url}
        >
          {url ?? shareLink.error}
        </AppText>

        {shareLink.error ? (
          <View className="mt-3 flex-row items-start gap-2 rounded-2xl bg-amber-50 px-4 py-3 dark:bg-amber-950/30">
            <Ionicons color="#d97706" name="warning-outline" size={18} />
            <AppText className="min-w-0 flex-1 text-sm leading-5 text-amber-800 dark:text-amber-300">
              Sharing is disabled until this is fixed.
            </AppText>
          </View>
        ) : null}
      </View>

      <View className="mt-4 flex-row gap-2">
        <ShareAction
          accessibilityLabel="Copy guest table link"
          disabled={sharingDisabled}
          icon="copy-outline"
          label="Copy link"
          onPress={() => void handleCopy()}
        />
        <ShareAction
          accessibilityLabel="Share guest table link on WhatsApp"
          disabled={sharingDisabled}
          icon="logo-whatsapp"
          label="WhatsApp"
          onPress={() => void handleWhatsApp()}
        />
        <ShareAction
          accessibilityLabel="Share guest table link"
          disabled={sharingDisabled}
          icon="share-outline"
          label="More"
          onPress={() => void handleShare()}
        />
      </View>

      {feedback ? (
        <AppText
          accessibilityLiveRegion="polite"
          className="mt-3 text-center text-sm font-semibold text-foreground"
        >
          {feedback}
        </AppText>
      ) : null}
    </View>
  );
};
