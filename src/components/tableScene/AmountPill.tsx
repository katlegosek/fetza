import Ionicons from "@expo/vector-icons/Ionicons";
import { StyleSheet, Text, View } from "react-native";

const PAID_TEXT = "#16834A";
const PAID_BG = "#EAF7F1";
const PAID_BORDER = "#CFEFDD";

type AmountPillProps = {
  amount: string;
  paid: boolean;
};

/** Amount row under the participant chip; parent usually wraps both in a Pressable. */
export function AmountPill({ amount, paid }: AmountPillProps) {
  return (
    <View
      style={[
        styles.pill,
        paid
          ? { backgroundColor: PAID_BG, borderColor: PAID_BORDER }
          : {
              backgroundColor: "#FFFFFF",
              borderColor: "#E5E7EB",
            },
      ]}
    >
      <Text
        style={[
          styles.text,
          paid ? { color: PAID_TEXT } : { color: "#111827" },
        ]}
      >
        {amount}
      </Text>
      {paid ? (
        <Ionicons
          color={PAID_TEXT}
          name="checkmark-circle"
          size={14}
          style={styles.check}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "center",
    marginTop: -1,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 999,
    borderWidth: 1,
  },
  text: {
    fontSize: 12,
    fontWeight: "600",
    fontVariant: ["tabular-nums"],
  },
  check: {
    marginLeft: 6,
  },
});
