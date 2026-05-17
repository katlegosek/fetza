# Fetza — Backlog

Open ideas and polish for **this** repo (`fetza`). Deeper product context: [docs/BRD.md](./docs/BRD.md), [docs/ROADMAP.md](./docs/ROADMAP.md).

The **Implemented** section at the bottom was **carried over from the earlier Split POC** for reference (features shipped there, not necessarily in Fetza yet). Trim or replace as this codebase catches up.

## Receipt aesthetic refinements

- [ ] **Thermal paper fade** — subtle linear gradient near the top and bottom
      zigzag edges so the ink looks like it's slowly fading off the edge of
      the paper. Needs `expo-linear-gradient`.
- [ ] **Paper grain texture** — very faint noise pattern on the receipt
      surface. Either a tiled PNG asset or a sparse `<View />` overlay with
      randomly-positioned semi-transparent dots.
- [ ] **`ReceiptZigzagRow` all-Tailwind revisit** — today the tear-strip
      triangles use `style` for geometry and the dynamic `color` prop (border
      colors). Revisit whether we can drop `style` entirely: e.g. restrict
      `color` to named receipt tokens / theme classes, or adopt a pattern
      NativeWind supports for runtime colors; keep constants DRY with
      `RECEIPT_ZIGZAG_*`.
- [ ] **Scan-faithful review (beyond the template)** — Review today uses a
      **fixed thermal-style template** (`ThermalReceipt`) for editing. QoL
      stretch goal: the **body of the review** (sections, line grouping,
      alignment, typographic rhythm, headers vs line items) **tracks the
      captured ticket** so it feels like the same slip, not a generic receipt
      mock-up. Likely needs structured layout hints from the scan pipeline,
      per-merchant or per-image overrides, and **AI** (e.g. vision / document
      layout models on the crop) to infer columns, emphasis, and blocks—then
      map those to components or style tokens. Spike cost, privacy, and
      offline vs on-device trade-offs before committing.

## Settle-up & celebration polish

- [ ] **Per-member stamp animation** — when a single member is marked paid,
      a small `<PaidStamp size="sm" />` animates onto their row card,
      replacing the green checkmark. (Currently only the bill-wide stamp is
      shown on the SettlementBanner.)
- [ ] **Capture shutter sound** — soft tick on capture, toggleable in
      Settings.

## Helpful additions

- [ ] **First-time hint overlays** — small floating bubble on first visit to
      Assign: "Pick a member, then tap items. Long-press for options."
      Dismisses on tap, never shown again.
- [ ] **Recent members chips** — on the add-member prompt, surface pills of
      recently-used members from past bills.
- [ ] **Bill nickname** — tiny edit pen next to the merchant name on
      Summary, so a bill can be renamed (e.g. "Friday drinks").
- [ ] **Pull-to-refresh on History** — feels right even though storage is
      local-only, and primes UX for a future backend.
- [ ] **Search on History** — once a user has 10+ bills.

## Smarter splits

- [ ] **Re-balance warning** — soft badge on a member's row when their
      share is wildly out of proportion (>4×) compared to others.
- [ ] **Select-everyone toggle on the Assign chip bar** — quick toggle to
      assign the next tap to all members at once.
- [ ] **Bulk assigning** — multi-select lines on Assign (or “apply to all
      unassigned”) and add/remove the same member(s) in one confirm step;
      optional: select all / invert selection, and undo for the last bulk
      action.

## Settings polish

- [ ] **Default currency + tip mode** in Settings — persisted across bills,
      pre-fills manual entry.
- [ ] **Member color picker** — tap a member in Settings to recolor them
      (current logic auto-assigns from `MEMBER_PALETTE`).
- [ ] **Export bill as a real receipt image** — render the receipt view to
      PNG and save to camera roll. Cool to share visually.

## Benchmarking (big-app patterns)

- [ ] **Steal ideas responsibly** — periodically review how top-tier apps
      handle flows we care about (e.g. Uber-style **share links** + web
      fallback, permission prompts, empty states, haptics, share sheets,
      receipt-like UIs elsewhere) and lift **patterns** (not branding or
      proprietary assets) so Fetza stays modern **on top of**
      [docs/BRD.md](./docs/BRD.md) and [docs/ROADMAP.md](./docs/ROADMAP.md).
      Track candidates in this backlog or a short rotating checklist when
      kicking off a phase.

## Growth & adoption

- [ ] **“Why install?” microcopy** — share text + web summary footer that
      explains value when **only the organizer** has the app (e.g. open this
      link next time, mark paid, same group—wording TBD). Align with BRD §1.5
      and US-21. Combat assumptions that friends never need Fetza.

---

## Implemented (legacy Split POC — reference)

_Shipped in the sibling `Split` prototype; use as a checklist when porting to Fetza._

- [x] **`lib/haptics.ts`** — centralised haptic vocabulary
      (`tap`/`stamp`/`success`/`warning`/`error`).
- [x] Haptics wired to: capture, OCR fallback warning, capture failure,
      item assignment, split-equally, mark-paid (both summary cards and
      member detail sheet), save bill, all-settled celebration.
- [x] **`<PaidStamp />`** — rotated red rubber-stamp graphic with sizes
      `sm` / `md` / `lg` and spring-zoom entrance.
- [x] **`<ConfettiBurst />`** — falling-confetti overlay for celebrations.
      Trigger-keyed so each new burst remounts fresh particles.
- [x] PAID stamp now sits on the SettlementBanner when fully settled, and
      replaces the green pill on settled history rows.
- [x] Confetti drops when a bill transitions to fully settled (guarded so
      reopening an already-settled bill from history does **not** retrigger).
- [x] Review receipt now has `* * *` ornaments around the merchant name,
      tabular numerals on all prices, a subtle 1.4° tilt, and a faux
      barcode + bill-id near the bottom.
- [x] History rows tilt alternately by ±0.6° so the list reads as a stack.
- [x] **`lib/sync-receipt-totals.ts`** — after OCR fixes, re-runs reconcile
      hygiene and sets `subtotal` / `total` from items + tax + tip.
- [x] **Review: fix OCR before assign** — tap item lines to edit description,
      line total, quantity; add lines; remove lines (min 1); tap merchant for
      name; tap tax row to set tax; totals stay consistent.
- [x] **`ReviewItemSheet`** — bottom sheet for per-line edits on Review.
- [x] **Assign: Split equally** (header) assigns every line to everyone; user
      taps **Summary** when ready. (Removed extra Review / BottomBar
      “even split → summary” shortcuts as redundant.)
