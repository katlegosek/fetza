import { File, Paths } from "expo-file-system";

export type MemberSettlementRow = {
  settled: boolean;
  paidAtIso: string | null;
};

/** memberId → settlement row */
export type SettlementMap = Record<string, MemberSettlementRow>;

/** billId → per-member settlements */
type RootV1 = Record<string, SettlementMap>;

const FILE_NAME = "fetza-settlements-v1.json";

function settlementsFile(): File {
  return new File(Paths.document, FILE_NAME);
}

async function readRoot(): Promise<RootV1> {
  try {
    const file = settlementsFile();
    if (!file.info().exists) return {};
    const raw = await file.text();
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return {};
    return parsed as RootV1;
  } catch {
    return {};
  }
}

function writeRoot(root: RootV1): void {
  try {
    settlementsFile().write(JSON.stringify(root));
  } catch {
    /* document dir unavailable (e.g. some web builds) */
  }
}

export async function loadSettlementMap(
  billId: string,
): Promise<SettlementMap> {
  if (!billId) return {};
  const root = await readRoot();
  const map = root[billId];
  return map && typeof map === "object" ? map : {};
}

export async function saveMemberSettlement(
  billId: string,
  memberId: string,
  settled: boolean,
  paidAtIso: string | null,
): Promise<void> {
  if (!billId || !memberId) return;
  const root = await readRoot();
  const prev = root[billId] ?? {};
  root[billId] = {
    ...prev,
    [memberId]: { settled, paidAtIso },
  };
  writeRoot(root);
}

export async function loadMemberSettlement(
  billId: string,
  memberId: string,
): Promise<MemberSettlementRow | null> {
  const map = await loadSettlementMap(billId);
  return map[memberId] ?? null;
}

export function isMemberSettled(map: SettlementMap, memberId: string): boolean {
  return map[memberId]?.settled === true;
}
