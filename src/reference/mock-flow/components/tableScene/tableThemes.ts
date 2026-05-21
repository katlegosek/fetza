export const tableThemes = {
  softWood: {
    seats: {
      2: require("@/assets/tableScenes/softWood/softWoodSeats2.png"),
      4: require("@/assets/tableScenes/softWood/softWoodSeats4.png"),
      6: require("@/assets/tableScenes/softWood/softWoodSeats6.png"),
      8: require("@/assets/tableScenes/softWood/softWoodSeats8.png"),
    },
    backgroundColor: "#FAF7F1",
    /** Dotted inner/outer ellipse path only (View-based grains, not beads). */
    orbitLineColor: "rgba(180, 150, 110, 0.35)",
    /** Between-user beads on the outer ring and participant stack mid-dot. */
    orbitColor: "rgba(100, 108, 120, 0.72)",
    textColor: "#111827",
    mutedTextColor: "#6B7280",
    borderSoft: "#E5E7EB",
    hostAccent: "#7C3AED",
  },
} as const;

export type TableThemeId = keyof typeof tableThemes;

export type TableTheme = (typeof tableThemes)[keyof typeof tableThemes];

export function resolveTableTheme(id: keyof typeof tableThemes = "softWood") {
  return tableThemes[id];
}
