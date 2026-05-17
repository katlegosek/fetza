/** Surface + text + icon for a member “assigning to…” banner (matches `Member.tone`). */
export type MemberAssignHighlight = {
  surfaceClassName: string;
  textClassName: string;
  iconColor: string;
};

export function memberAssignHighlight(tone: string): MemberAssignHighlight {
  if (tone.includes("violet"))
    return {
      surfaceClassName:
        "border border-violet-200/80 bg-violet-500/15 shadow-sm shadow-violet-900/5 dark:border-violet-500/30 dark:bg-violet-500/25 dark:shadow-none",
      textClassName: "text-violet-800 dark:text-violet-200",
      iconColor: "#7c3aed",
    };
  if (tone.includes("sky"))
    return {
      surfaceClassName:
        "border border-sky-200/80 bg-sky-500/15 shadow-sm shadow-sky-900/5 dark:border-sky-500/30 dark:bg-sky-500/25 dark:shadow-none",
      textClassName: "text-sky-800 dark:text-sky-200",
      iconColor: "#0284c7",
    };
  if (tone.includes("emerald"))
    return {
      surfaceClassName:
        "border border-emerald-200/80 bg-emerald-500/15 shadow-sm shadow-emerald-900/5 dark:border-emerald-500/30 dark:bg-emerald-500/25 dark:shadow-none",
      textClassName: "text-emerald-800 dark:text-emerald-200",
      iconColor: "#059669",
    };
  if (tone.includes("amber"))
    return {
      surfaceClassName:
        "border border-amber-200/80 bg-amber-500/15 shadow-sm shadow-amber-900/5 dark:border-amber-500/30 dark:bg-amber-500/25 dark:shadow-none",
      textClassName: "text-amber-900 dark:text-amber-200",
      iconColor: "#d97706",
    };
  if (tone.includes("rose"))
    return {
      surfaceClassName:
        "border border-rose-200/80 bg-rose-500/15 shadow-sm shadow-rose-900/5 dark:border-rose-500/30 dark:bg-rose-500/25 dark:shadow-none",
      textClassName: "text-rose-800 dark:text-rose-200",
      iconColor: "#e11d48",
    };
  return {
    surfaceClassName:
      "border border-neutral-300/80 bg-neutral-200/80 shadow-sm shadow-neutral-900/5 dark:border-neutral-600 dark:bg-neutral-800 dark:shadow-none",
    textClassName: "text-foreground",
    iconColor: "#737373",
  };
}
