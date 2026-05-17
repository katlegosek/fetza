import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";

import { pointOnEllipse } from "./seatPositions";

/** Major accent dots (cardinal / diagonal), degrees; 0° = right, −90° = top. */
const MAIN_DOT_ANGLES_DEG = [-90, -45, 0, 45, 90, 135, 180, -135] as const;

/** Smaller dots between majors — “beads” along the path like the reference. */
const MID_DOT_ANGLES_DEG = [
  -67.5, -22.5, 22.5, 67.5, 112.5, 157.5, -157.5, -112.5,
] as const;

const MAIN_DOT_R = [3.25, 3, 3.5, 3, 3.75, 3, 3.25, 3.5] as const;

const ACCENT_FILLS = [
  "#7C3AED",
  "#22C55E",
  "#F59E0B",
  "#0EA5E9",
  "#F97316",
  "#14B8A6",
  "#6366F1",
  "#EC4899",
] as const;

/** Samples along ellipse for a dashed look (no native SVG). */
const ELLIPSE_SAMPLES = 168;
const DASH_PHASE_CYCLE = 11;
const DASH_ON_FRAC = 0.48;

type OrbitLayerProps = {
  width: number;
  height: number;
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  strokeColor?: string;
};

export function OrbitLayer({
  width,
  height,
  cx,
  cy,
  rx,
  ry,
  strokeColor = "rgba(120, 128, 140, 0.55)",
}: OrbitLayerProps) {
  if (width <= 0 || height <= 0) return null;

  const rxe = Math.max(0, rx);
  const rye = Math.max(0, ry);

  const dashDots: ReactNode[] = [];
  for (let i = 0; i < ELLIPSE_SAMPLES; i++) {
    const t = i / ELLIPSE_SAMPLES;
    const phase = (t * DASH_PHASE_CYCLE) % 1;
    if (phase > DASH_ON_FRAC) continue;
    const deg = -90 + t * 360;
    const p = pointOnEllipse(cx, cy, rxe, rye, deg);
    const d = 3;
    const h = d / 2;
    dashDots.push(
      <View
        key={`dash-${i}`}
        pointerEvents="none"
        style={[
          styles.dashGrain,
          {
            left: p.x - h,
            top: p.y - h,
            width: d,
            height: d,
            borderRadius: h,
            backgroundColor: strokeColor,
          },
        ]}
      />,
    );
  }

  const decorDots: ReactNode[] = [];

  MID_DOT_ANGLES_DEG.forEach((deg, i) => {
    const p = pointOnEllipse(cx, cy, rxe, rye, deg);
    const r = 2.25;
    decorDots.push(
      <View
        key={`decor-mid-${deg}`}
        pointerEvents="none"
        style={[
          styles.decorDot,
          {
            left: p.x - r,
            top: p.y - r,
            width: r * 2,
            height: r * 2,
            borderRadius: r,
            backgroundColor: ACCENT_FILLS[i % ACCENT_FILLS.length],
            opacity: 0.55,
          },
        ]}
      />,
    );
  });

  MAIN_DOT_ANGLES_DEG.forEach((deg, i) => {
    const p = pointOnEllipse(cx, cy, rxe, rye, deg);
    const r = MAIN_DOT_R[i % MAIN_DOT_R.length];
    decorDots.push(
      <View
        key={`decor-main-${deg}`}
        pointerEvents="none"
        style={[
          styles.decorDot,
          {
            left: p.x - r,
            top: p.y - r,
            width: r * 2,
            height: r * 2,
            borderRadius: r,
            backgroundColor: ACCENT_FILLS[i % ACCENT_FILLS.length],
            opacity: 0.78,
          },
        ]}
      />,
    );
  });

  return (
    <View
      pointerEvents="none"
      style={[StyleSheet.absoluteFillObject, styles.layer]}
    >
      {dashDots}
      {decorDots}
    </View>
  );
}

const styles = StyleSheet.create({
  layer: {
    zIndex: 3,
    backgroundColor: "transparent",
  },
  dashGrain: {
    position: "absolute",
  },
  decorDot: {
    position: "absolute",
  },
});
