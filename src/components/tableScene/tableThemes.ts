export const tableThemes = {
  softWood: {
    seats: {
      2: require("@/assets/tableScenes/softWood/softWoodSeats2.png"),
      4: require("@/assets/tableScenes/softWood/softWoodSeats4.png"),
      6: require("@/assets/tableScenes/softWood/softWoodSeats6.png"),
      8: require("@/assets/tableScenes/softWood/softWoodSeats8.png"),
    },
    backgroundColor: "#FAF7F1",
    orbitColor: "rgba(120, 128, 140, 0.55)",
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
