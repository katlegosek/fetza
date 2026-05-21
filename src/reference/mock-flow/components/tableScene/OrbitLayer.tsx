import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";

import { participantBetweenAngleDeg, pointOnEllipse } from "./seatPositions";

/**
 * Backlog: animate orbit — e.g. Reanimated for ring sweep, stagger, or morph
 * when `participantCount` changes (shared layout / layout transitions).
 */

/** Target gap between dot centers along each ellipse (px, approximate). */
const DOT_SPACING_PX = 4.75;
const DOT_SIZE = 3.35;

/** Inner orbit is this fraction of the participant anchor ellipse (`rx` / `ry`). */
const INNER_ORBIT_SCALE = 0.88;

/**
 * Outer dotted ring + between-user beads are drawn on this scale of `rx`/`ry`.
 * Participant stacks use unscaled `rx`/`ry` from the parent, so pills stay put.
 */
const OUTER_RING_DRAW_SCALE = 1.1;

/** Beads on the outer ring, midway between participant anchors. */
const BETWEEN_BEAD_SIZE = 6;

type OrbitLayerProps = {
  width: number;
  height: number;
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  /** Dotted path only (inner + outer ellipse grains). From theme `orbitLineColor`. */
  orbitLineColor: string;
  /** Between-user beads; separate so the path can stay subtle. From theme `orbitColor`. */
  orbitBeadColor: string;
  /**
   * Visible participant count: drives “between user” beads on the **outer** ring only.
   * Inner ring stays a plain dotted loop with no extra markers.
   */
  participantCount?: number;
};

function ellipsePerimeter(rx: number, ry: number): number {
  const a = Math.max(rx, 0);
  const b = Math.max(ry, 0);
  if (a === 0 && b === 0) return 0;
  const h = ((a - b) * (a - b)) / ((a + b) * (a + b));
  return Math.PI * (a + b) * (1 + (3 * h) / (10 + Math.sqrt(4 - 3 * h)));
}

function buildRingDots(args: {
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  color: string;
  keyPrefix: string;
}): ReactNode[] {
  const { cx, cy, rx, ry, color, keyPrefix } = args;
  const rxe = Math.max(0, rx);
  const rye = Math.max(0, ry);
  const perim = ellipsePerimeter(rxe, rye);
  const sampleCount = Math.max(
    120,
    Math.min(380, Math.round(perim / DOT_SPACING_PX)),
  );

  const dots: ReactNode[] = [];
  const d = DOT_SIZE;
  const half = d / 2;

  for (let i = 0; i < sampleCount; i++) {
    const t = i / sampleCount;
    const deg = -90 + t * 360;
    const p = pointOnEllipse(cx, cy, rxe, rye, deg);
    dots.push(
      <View
        key={`${keyPrefix}-${i}`}
        pointerEvents="none"
        style={[
          styles.dot,
          {
            left: p.x - half,
            top: p.y - half,
            width: d,
            height: d,
            borderRadius: half,
            backgroundColor: color,
          },
        ]}
      />,
    );
  }
  return dots;
}

export function OrbitLayer({
  width,
  height,
  cx,
  cy,
  rx,
  ry,
  orbitLineColor,
  orbitBeadColor,
  participantCount = 0,
}: OrbitLayerProps) {
  if (width <= 0 || height <= 0) return null;

  const rxe = Math.max(0, rx);
  const rye = Math.max(0, ry);
  const riX = rxe * INNER_ORBIT_SCALE;
  const riY = rye * INNER_ORBIT_SCALE;
  const roX = rxe * OUTER_RING_DRAW_SCALE;
  const roY = rye * OUTER_RING_DRAW_SCALE;

  const innerRing = buildRingDots({
    cx,
    cy,
    rx: riX,
    ry: riY,
    color: orbitLineColor,
    keyPrefix: "orbit-inner",
  });

  const outerRing = buildRingDots({
    cx,
    cy,
    rx: roX,
    ry: roY,
    color: orbitLineColor,
    keyPrefix: "orbit-outer",
  });

  const n = Math.max(0, Math.floor(participantCount));
  const betweenBeads: ReactNode[] = [];

  if (n >= 2) {
    const b = BETWEEN_BEAD_SIZE;
    const bh = b / 2;
    for (let i = 0; i < n; i++) {
      const deg = participantBetweenAngleDeg(i, n);
      const p = pointOnEllipse(cx, cy, roX, roY, deg);
      betweenBeads.push(
        <View
          key={`orbit-between-${i}`}
          pointerEvents="none"
          style={[
            styles.dot,
            {
              left: p.x - bh,
              top: p.y - bh,
              width: b,
              height: b,
              borderRadius: bh,
              backgroundColor: orbitBeadColor,
            },
          ]}
        />,
      );
    }
  }

  return (
    <View
      pointerEvents="none"
      style={[StyleSheet.absoluteFillObject, styles.layer]}
    >
      {innerRing}
      {outerRing}
      {betweenBeads}
    </View>
  );
}

const styles = StyleSheet.create({
  layer: {
    zIndex: 3,
    backgroundColor: "transparent",
  },
  dot: {
    position: "absolute",
  },
});
