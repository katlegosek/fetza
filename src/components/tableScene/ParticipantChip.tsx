import Ionicons from "@expo/vector-icons/Ionicons";
import { Platform, StyleSheet, Text, View } from "react-native";

import type { TablePerson } from "./types";

type ParticipantChipProps = {
  person: TablePerson;
};

export function ParticipantChip({ person }: ParticipantChipProps) {
  return (
    <View style={styles.chip}>
      <View style={[styles.avatar, { backgroundColor: person.color }]}>
        <Text style={styles.avatarText}>{person.initials}</Text>
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
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#FFFFFF",
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
