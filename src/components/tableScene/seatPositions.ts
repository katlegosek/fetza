import type { DimensionValue } from "react-native";

export type SeatRing = 2 | 4 | 6 | 8;

export type SeatSpot = { top: DimensionValue; left: DimensionValue };

export const seatPositions = {
  2: [
    { top: "3%", left: "50%" },
    { top: "98%", left: "50%" },
  ],
  4: [
    { top: "3%", left: "50%" },
    { top: "47%", left: "92%" },
    { top: "98%", left: "50%" },
    { top: "47%", left: "10%" },
  ],
  6: [
    { top: "3%", left: "50%" },
    { top: "20%", left: "84%" },
    { top: "80%", left: "84%" },
    { top: "98%", left: "50%" },
    { top: "80%", left: "16%" },
    { top: "20%", left: "16%" },
  ],
  8: [
    { top: "3%", left: "50%" },
    { top: "20%", left: "84%" },
    { top: "47%", left: "92%" },
    { top: "80%", left: "84%" },
    { top: "98%", left: "50%" },
    { top: "80%", left: "16%" },
    { top: "47%", left: "10%" },
    { top: "20%", left: "16%" },
  ],
} as const satisfies Record<SeatRing, readonly SeatSpot[]>;

const NARROW_LEFT_REPLACEMENTS: [string, string][] = [
  ["12%", "15%"],
  ["14%", "16%"],
  ["16%", "18%"],
  ["18%", "20%"],
];

const NARROW_RIGHT_REPLACEMENTS: [string, string][] = [
  ["88%", "85%"],
  ["86%", "83%"],
  ["84%", "81%"],
  ["82%", "79%"],
];

export function adjustSeatSpotsForNarrowWidth(
  spots: readonly SeatSpot[],
  narrow: boolean,
): SeatSpot[] {
  if (!narrow) return [...spots];
  return spots.map(({ top, left }) => {
    let L: DimensionValue = left;
    for (const [from, to] of NARROW_LEFT_REPLACEMENTS) {
      if (L === from) L = to as DimensionValue;
    }
    for (const [from, to] of NARROW_RIGHT_REPLACEMENTS) {
      if (L === from) L = to as DimensionValue;
    }
    return { top, left: L };
  });
}

export function seatCountForPeople(n: number): SeatRing {
  if (n <= 2) return 2;
  if (n <= 4) return 4;
  if (n <= 6) return 6;
  return 8;
}

/** Polar angle in degrees (0° = right, −90° = top). */
export function participantAnglesDeg(ring: SeatRing): number[] {
  switch (ring) {
    case 2:
      return [-90, 90];
    case 4:
      return [-90, 0, 90, 180];
    case 6:
      return [-90, -45, 45, 90, 135, -135];
    case 8:
      return [-90, -45, 0, 45, 90, 135, 180, -135];
    default:
      return [-90];
  }
}

function degToRad(d: number): number {
  return (d * Math.PI) / 180;
}

export function pointOnEllipse(
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  deg: number,
): { x: number; y: number } {
  const r = degToRad(deg);
  return { x: cx + rx * Math.cos(r), y: cy + ry * Math.sin(r) };
}

/** Horizontal center shift (px), matches legacy table layout. */
export const SCENE_CENTER_SHIFT_X = -6;

/** Target dashed orbit size (~320×390); scales down in smaller scenes. */
const ORBIT_RX_BASE = 160;
const ORBIT_RY_BASE = 195;

/** Slightly larger than legacy so the ring reads outside the table art (esp. 2-seat). */
const ORBIT_RING_SCALE = 1.07;

/**
 * Decorative dashed orbit ellipse (table scene), centered with optional X shift.
 */
export function orbitDecorEllipsePx(
  width: number,
  height: number,
  shiftX: number,
): { cx: number; cy: number; rx: number; ry: number } {
  const cx = width / 2 + shiftX;
  const cy = height / 2;
  const pad = 12;
  const maxRx = Math.max(48, (width - pad * 2) / 2);
  const maxRy = Math.max(60, (height - pad * 2) / 2);
  const sx = Math.min(maxRx / ORBIT_RX_BASE, maxRy / ORBIT_RY_BASE, 1);
  return {
    cx,
    cy,
    rx: ORBIT_RX_BASE * sx * ORBIT_RING_SCALE,
    ry: ORBIT_RY_BASE * sx * ORBIT_RING_SCALE,
  };
}

/**
 * Orbit radii in px from scene layout. Tunable when artwork changes.
 */
export function orbitRadiiPx(
  width: number,
  height: number,
): {
  rx: number;
  ry: number;
} {
  return {
    rx: width * 0.405,
    ry: height * 0.385,
  };
}
