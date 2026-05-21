# Mock flow (reference only)

These files are kept as **design and logic reference** for the pre-API mock/demo flow. They are **not** imported by Expo routes or active app screens.

The running app uses Rails API data only. Missing or invalid `billId` shows `MissingBillState` instead of mock screens.

## Contents

- **Review** — `ReviewMockScreen.tsx`, seed draft (`review-draft.mock.ts`)
- **Assign** — `AssignMockScreen.tsx`, mock hooks, seed members
- **Summary** — table/list mock UI under `summary/`
- **Share** — `ShareMockScreen.tsx` (former `app/scan/share.tsx` mock flow)

Shared draft helpers: `draft-bill.helpers.ts`. Production types live in `src/types/draft-bill.ts`.

Mock-only UI and storage (not used by the API app):

- `components/tableScene/` — table visualization for summary mock
- `components/summary-table-seat.tsx` — legacy seat chrome (unused; kept for reference)
- `lib/member-settlement-storage.ts` — local settlement map (API uses participant `settled`)
- `lib/bill-summary-snapshot-storage.ts` — dev snapshot logging for mock summary

Barrel: `index.ts` re-exports mock screens and helpers for ad-hoc reference imports only.
