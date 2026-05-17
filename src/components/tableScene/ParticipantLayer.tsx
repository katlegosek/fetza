import { useEffect } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from "react-native-reanimated";

import { AmountPill } from "./AmountPill";
import { ParticipantChip } from "./ParticipantChip";
import { participantAngleDegEvenCount, pointOnEllipse } from "./seatPositions";
import type { TablePerson } from "./types";

/**
 * Matches Split app `CircularTotals` → `MemberOrbit`: staggered spring + scale
 * from 0.4→1 with opacity, plus press squash. Scale runs on an inner `Animated.View`
 * so the parent anchor can keep `%` centering without layout drift.
 */
const ORBIT_APPEAR_SPRING = { damping: 14, stiffness: 140 } as const;
const ORBIT_PRESS_SPRING = { damping: 12, stiffness: 220 } as const;
const ORBIT_STAGGER_MS = 60;
const ORBIT_OVERFLOW_EXTRA_MS = 72;

function ParticipantOrbitStack({
  delay,
  person,
  stackMidDotColor,
  onLongPressPerson,
  onPressPerson,
}: {
  delay: number;
  person: TablePerson;
  stackMidDotColor?: string;
  onLongPressPerson?: (person: TablePerson) => void;
  onPressPerson?: (person: TablePerson) => void;
}) {
  const appear = useSharedValue(0);
  const pressScale = useSharedValue(1);

  useEffect(() => {
    appear.value = 0;
    appear.value = withDelay(delay, withSpring(1, ORBIT_APPEAR_SPRING));
  }, [appear, delay]);

  const appearStyle = useAnimatedStyle(() => ({
    opacity: appear.value,
    transform: [{ scale: (0.4 + appear.value * 0.6) * pressScale.value }],
  }));

  return (
    <Animated.View pointerEvents="box-none" style={[styles.col, appearStyle]}>
      <Pressable
        accessibilityHint="Tap for share. Long press for paid status."
        accessibilityLabel={`${person.name}, ${person.amount}${person.isPaid ? ", paid" : ""}`}
        accessibilityRole="button"
        delayLongPress={400}
        hitSlop={6}
        onLongPress={
          onLongPressPerson ? () => onLongPressPerson(person) : undefined
        }
        onPress={onPressPerson ? () => onPressPerson(person) : undefined}
        onPressIn={() => {
          pressScale.value = withTiming(0.92, { duration: 110 });
        }}
        onPressOut={() => {
          pressScale.value = withSpring(1, ORBIT_PRESS_SPRING);
        }}
        style={styles.col}
      >
        <ParticipantChip person={person} />
        {stackMidDotColor ? (
          <View
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
            pointerEvents="none"
            style={styles.midDotRow}
          >
            <View
              style={[
                styles.midDot,
                {
                  backgroundColor: stackMidDotColor,
                  borderColor: "#FFFFFF",
                },
              ]}
            />
          </View>
        ) : null}
        <AmountPill amount={person.amount} paid={Boolean(person.isPaid)} />
      </Pressable>
    </Animated.View>
  );
}

function MorePeopleOrbitChip({
  delay,
  overflow,
  onPress,
}: {
  delay: number;
  overflow: number;
  onPress: () => void;
}) {
  const appear = useSharedValue(0);
  const pressScale = useSharedValue(1);

  useEffect(() => {
    appear.value = 0;
    appear.value = withDelay(delay, withSpring(1, ORBIT_APPEAR_SPRING));
  }, [appear, delay]);

  const appearStyle = useAnimatedStyle(() => ({
    opacity: appear.value,
    transform: [{ scale: (0.4 + appear.value * 0.6) * pressScale.value }],
  }));

  return (
    <Animated.View style={appearStyle}>
      <Pressable
        accessibilityLabel={`${overflow} more people`}
        accessibilityRole="button"
        hitSlop={8}
        onPress={onPress}
        onPressIn={() => {
          pressScale.value = withTiming(0.92, { duration: 110 });
        }}
        onPressOut={() => {
          pressScale.value = withSpring(1, ORBIT_PRESS_SPRING);
        }}
        style={styles.moreChip}
      >
        <Text style={styles.moreChipText}>+{overflow} more</Text>
      </Pressable>
    </Animated.View>
  );
}

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
  /** Same ellipse as {@link OrbitLayer} (pin centers sit on this path). */
  orbitGeom: ParticipantOrbitGeom | null;
  onPressPerson?: (person: TablePerson) => void;
  onLongPressPerson?: (person: TablePerson) => void;
  onPressMorePeople?: () => void;
  /** Small dot on the seam between name chip and amount pill; matches orbit tone. */
  stackMidDotColor?: string;
};

export function ParticipantLayer({
  people,
  maxVisible,
  orbitGeom,
  onPressPerson,
  onLongPressPerson,
  onPressMorePeople,
  stackMidDotColor,
}: ParticipantLayerProps) {
  const visible = people.slice(0, maxVisible);
  if (visible.length === 0 || !orbitGeom) return null;

  const { cx, cy, rx, ry } = orbitGeom;
  const n = visible.length;

  const overflow = Math.max(0, people.length - maxVisible);

  return (
    <View
      pointerEvents="box-none"
      style={[StyleSheet.absoluteFillObject, styles.layer]}
    >
      {visible.map((person, i) => {
        const deg = participantAngleDegEvenCount(i, n);
        const p = pointOnEllipse(cx, cy, rx, ry, deg);
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
            <ParticipantOrbitStack
              delay={i * ORBIT_STAGGER_MS}
              person={person}
              stackMidDotColor={stackMidDotColor}
              onLongPressPerson={onLongPressPerson}
              onPressPerson={onPressPerson}
            />
          </View>
        );
      })}

      {overflow > 0 && onPressMorePeople ? (
        <View pointerEvents="box-none" style={styles.moreRow}>
          <MorePeopleOrbitChip
            delay={visible.length * ORBIT_STAGGER_MS + ORBIT_OVERFLOW_EXTRA_MS}
            overflow={overflow}
            onPress={onPressMorePeople}
          />
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
  midDotRow: {
    height: 6,
    alignItems: "center",
    justifyContent: "center",
    marginTop: -3,
    marginBottom: -3,
    zIndex: 2,
  },
  midDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    borderWidth: 1.5,
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
