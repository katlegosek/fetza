import Ionicons from "@expo/vector-icons/Ionicons";
import { Platform, StyleSheet, Text, View } from "react-native";

import type { TablePerson } from "./types";

type ParticipantChipProps = {
  person: TablePerson;
};

const FALLBACK_BG = "#263238";
const FALLBACK_INITIALS = "#FFFFFF";

export function ParticipantChip({ person }: ParticipantChipProps) {
  const avatarBg = person.avatarBackgroundColor ?? person.color ?? FALLBACK_BG;
  const initialsColor = person.avatarTextColor ?? FALLBACK_INITIALS;

  return (
    <View style={styles.chip}>
      <View style={[styles.avatar, { backgroundColor: avatarBg }]}>
        <Text style={[styles.avatarText, { color: initialsColor }]}>
          {person.initials}
        </Text>
      </View>
      <Text style={styles.name} numberOfLines={1}>
        {person.name}
      </Text>
      {person.isHost ? (
        <Ionicons
          accessibilityLabel="Host"
          color="#7C4DFF"
          name="person"
          size={13}
          style={styles.hostBadge}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: "row",
    alignItems: "center",
    maxWidth: 220,
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderRadius: 999,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: { elevation: 2 },
      default: {},
    }),
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 13,
    fontWeight: "800",
  },
  name: {
    flexShrink: 1,
    maxWidth: 120,
    marginLeft: 6,
    fontSize: 13,
    fontWeight: "700",
    color: "#111827",
  },
  hostBadge: {
    marginLeft: 4,
  },
});
