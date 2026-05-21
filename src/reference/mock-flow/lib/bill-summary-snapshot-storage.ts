import { File, Paths } from "expo-file-system";

const FILE_NAME = "fetza-saved-summaries-v1.json";

export type SavedSummaryRow = {
  savedAtIso: string;
  /** Same JSON string as Summary / Share `data` param */
  dataJson: string;
};

function snapshotsFile(): File {
  return new File(Paths.document, FILE_NAME);
}

async function readRows(): Promise<SavedSummaryRow[]> {
  try {
    const file = snapshotsFile();
    if (!file.info().exists) return [];
    const raw = await file.text();
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (x): x is SavedSummaryRow =>
        x != null &&
        typeof x === "object" &&
        typeof (x as SavedSummaryRow).savedAtIso === "string" &&
        typeof (x as SavedSummaryRow).dataJson === "string",
    );
  } catch {
    return [];
  }
}

function writeRows(rows: SavedSummaryRow[]): void {
  try {
    snapshotsFile().write(JSON.stringify(rows));
  } catch {
    /* document dir unavailable */
  }
}

/** Most recent first; caps list size. */
export async function appendSummarySnapshot(
  dataJson: string,
  maxRows = 50,
): Promise<void> {
  if (!dataJson || dataJson.length === 0) return;
  const prev = await readRows();
  const next: SavedSummaryRow[] = [
    { savedAtIso: new Date().toISOString(), dataJson },
    ...prev.filter((r) => r.dataJson !== dataJson),
  ].slice(0, maxRows);
  writeRows(next);
}
