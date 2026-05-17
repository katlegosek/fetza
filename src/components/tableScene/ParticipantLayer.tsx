import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";

import { AmountPill } from "./AmountPill";
import { ParticipantChip } from "./ParticipantChip";
import {
  PARTICIPANT_ORBIT_RADIUS_SCALE,
  participantAngleDegEvenCount,
  pointOnEllipse,
} from "./seatPositions";
import type { TablePerson } from "./types";

const NARROW_WIDTH = 360;
/** Pull orbit in slightly on narrow screens so stacks stay on-screen. */
const NARROW_RADIUS_SCALE = 0.92;

export type ParticipantOrbitGeom = {
  cx: number;
  cy: number;
  rx: number;
  ry: number;
};

type ParticipantLayerProps = {
  people: TablePerson[];
  /** Clamped 1–8 inside TableScene. */
  maxVisible: number;
  /** Same ellipse as {@link OrbitLayer}; pills sit slightly outside this path. */
  orbitGeom: ParticipantOrbitGeom | null;
  onPressPerson?: (person: TablePerson) => void;
  onLongPressPerson?: (person: TablePerson) => void;
  onPressMorePeople?: () => void;
};

export function ParticipantLayer({
  people,
  maxVisible,
  orbitGeom,
  onPressPerson,
  onLongPressPerson,
  onPressMorePeople,
}: ParticipantLayerProps) {
  const { width: windowW } = useWindowDimensions();
  const narrow = windowW < NARROW_WIDTH;

  const visible = people.slice(0, maxVisible);
  if (visible.length === 0 || !orbitGeom) return null;

  const { cx, cy, rx, ry } = orbitGeom;
  const radiusScale =
    PARTICIPANT_ORBIT_RADIUS_SCALE * (narrow ? NARROW_RADIUS_SCALE : 1);
  const rxP = rx * radiusScale;
  const ryP = ry * radiusScale;
  const n = visible.length;

  const overflow = Math.max(0, people.length - maxVisible);

  const firePress = onPressPerson
    ? (p: TablePerson) => () => {
        onPressPerson(p);
      }
    : () => undefined;

  return (
    <View
      pointerEvents="box-none"
      style={[StyleSheet.absoluteFillObject, styles.layer]}
    >
      {visible.map((person, i) => {
        const deg = participantAngleDegEvenCount(i, n);
        const p = pointOnEllipse(cx, cy, rxP, ryP, deg);
        const onPress = firePress(person);
        return (
          <View
            key={person.id}
            pointerEvents="box-none"
            style={[
              styles.anchor,
              {
                left: p.x,
                top: p.y,
                transform: [{ translateX: "-50%" }, { translateY: "-50%" }],
              },
            ]}
          >
            <Pressable
              accessibilityHint="Tap for share. Long press for paid status."
              accessibilityLabel={`${person.name}, ${person.amount}${person.isPaid ? ", paid" : ""}`}
              accessibilityRole="button"
              delayLongPress={400}
              hitSlop={6}
              onLongPress={
                onLongPressPerson ? () => onLongPressPerson(person) : undefined
              }
              onPress={onPress}
              style={styles.col}
            >
              <ParticipantChip person={person} />
              <AmountPill
                amount={person.amount}
                paid={Boolean(person.isPaid)}
              />
            </Pressable>
          </View>
        );
      })}

      {overflow > 0 && onPressMorePeople ? (
        <View pointerEvents="box-none" style={styles.moreRow}>
          <Pressable
            accessibilityLabel={`${overflow} more people`}
            accessibilityRole="button"
            hitSlop={8}
            onPress={onPressMorePeople}
            style={styles.moreChip}
          >
            <Text style={styles.moreChipText}>+{overflow} more</Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  layer: {
    zIndex: 5,
  },
  anchor: {
    position: "absolute",
  },
  col: {
    alignItems: "center",
  },
  moreRow: {
    position: "absolute",
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 6,
  },
  moreChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    backgroundColor: "#FFFFFF",
    borderColor: "#E5E7EB",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 3,
      },
      android: { elevation: 2 },
      default: {},
    }),
  },
  moreChipText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6B7280",
  },
});
