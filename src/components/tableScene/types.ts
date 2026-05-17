import type { StyleProp, ViewStyle } from "react-native";

import type { TableThemeId } from "./tableThemes";

/** Row in the summary table scene (bill split). */
export type TablePerson = {
  id: string;
  name: string;
  initials: string;
  amountCents: number;
  /** @deprecated Legacy single fill; prefer `avatarBackgroundColor`. */
  color?: string;
  avatarBackgroundColor?: string;
  avatarTextColor?: string;
  isHost?: boolean;
  isPaid?: boolean;
};

/** @deprecated Use `TablePerson` */
export type Person = TablePerson;

export type TableSceneProps = {
  theme?: TableThemeId;
  people: TablePerson[];
  totalCents: number;
  itemCount: number;
  onPressTable?: () => void;
  onPressPerson?: (person: TablePerson) => void;
  onLongPressPerson?: (person: TablePerson) => void;
  onPressMorePeople?: () => void;
  /** When false, only chips / +N more are hidden; dashed orbit and table stay visible. */
  showParticipants?: boolean;
  /** Caps pills around the table (1–8). Remaining members use +N more when `onPressMorePeople` is set. Default 8. */
  maxVisibleParticipants?: number;
  /**
   * Scene fill behind orbit/table (e.g. match parent: `"transparent"` with a themed wrapper).
   * When omitted, uses the table theme background (e.g. softWood beige).
   */
  sceneBackgroundColor?: string;
  /** When false, the +N more chip is hidden even if some members are not shown. Default true. */
  showParticipantOverflow?: boolean;
  /** Merged into the outer scene container (size, margins, borderRadius, etc.). */
  style?: StyleProp<ViewStyle>;
};

export type { TableThemeId } from "./tableThemes";
