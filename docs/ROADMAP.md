# Product & engineering roadmap

**Product:** Bill-splitting app (**Fetza** — working title)  
**Companion:** [BRD.md](./BRD.md)

Phases **1–2** are detailed enough to drive implementation. **3+** are directional and expected to change.

---

## Phase 1 — App rewrite & core flows (detailed)

**Objective:** Reliable **Review → Assign → Summary** loop, **History**, **Settings**, with **manual** bill entry (no OCR yet). Central **theme tokens** from day one. Support **Path A** (itemized “what we ate”) and **Path B** (one/two **payers** covered the tab; others reimburse them)—see [BRD §1.4](./BRD.md).

### Cross-cutting (before / alongside screens)

- [ ] **Dual paths (P1):** data model + UI for **designated payer(s)** ([BRD](./BRD.md) US-29); Summary + **share text** show **who pays whom** when payers are set; Path A still works when payers are unset (organizer-led copy).

- [ ] Expo project + **expo-router** routes: review, assign, summary, history, settings; optional `scan` as placeholder.
- [ ] **`lib/theme.ts`** (or equivalent): semantic colors, spacing scale, radii, typography; avoid raw hex in components where possible.
- [ ] **Types:** `Receipt`, `LineItem`, `Member`, `Assignment`, adjustment fields—single source (`services/schema` or `lib/types`).
- [ ] **State:** Zustand stores (e.g. active bill, members, history list); selectors for derived totals.
- [ ] **Split math:** one module for line split + tax/tip share + reconciliation flags; unit tests for edge cases.
- [ ] **Tab + stack** navigation pattern consistent with product UX.
- [ ] **Intelligence seam (no AI yet):** define `IntelligenceProvider` interface + **NoOp** implementation so OCR/LLM features plug in later without rewiring screens (see Phase 2–3).

### Review screen

- [ ] Empty state → add first line / continue from template.
- [ ] Scrollable **line list**: qty, name, line total; tap opens edit sheet/modal.
- [ ] Actions: add line, delete line, reorder optional (P1).
- [ ] **Header:** merchant/title, date if shown.
- [ ] **Totals panel:** subtotal, tax, service, tip, grand total; reconciliation indicator.
- [ ] **CTA:** proceed to Assign (enable/disable per BRD reconciliation policy).
- [ ] **Edge:** zero lines, single line, many lines; long merchant names.

### Assign screen

- [ ] **Member strip** (chips/avatars): add/remove member for this bill.
- [ ] **Item rows:** show assignment state; tap to multi-select assignees or open assign sheet.
- [ ] **Unassigned** count or filter.
- [ ] Optional **split equally** across all members (BRD US-10).
- [ ] **CTA:** Summary.

### Summary screen

- [ ] **Per-member card/row:** subtotal share, tax/tip allocation, **total owed**.
- [ ] **Sanity check** vs bill grand total (within rounding rule).
- [ ] **Share / copy** plain-text breakdown via **system share sheet** (`Share.share`) so WhatsApp, SMS, and others work without a Meta SDK; optional **`whatsapp://` + `Linking`** encode path if product wants a dedicated “Send to WhatsApp” chip (graceful fallback if not installed).
- [ ] Optional: **mark paid** per member; “all settled” state (P1 polish).

### History screen

- [ ] **List:** title, date, total, optional status.
- [ ] Tap → **reopen** bill (define entry: Review vs Summary).
- [ ] **New bill** entry point if not only in tabs.
- [ ] Optional: delete/archive (P1).

### Settings screen

- [ ] Defaults: currency, default tip %, toggles aligned with BRD.
- [ ] App version / about.
- [ ] Placeholders (disabled): account, export—until Phase 2–4.

### Phase 1 — QA themes

- Navigation backstack does not corrupt active bill id.
- Edit on Review after Assign updates Summary correctly.
- All lines unassigned → clear UX on Summary (block or warn per policy).
- Theme: switching token values updates all primary screens without per-file edits.

---

## Phase 2 — OCR + local persistence (“mock database”) (detailed)

**Objective:** Scan-to-review pipeline with **human confirmation**; bills **survive app restart** via a **repository abstraction** (not a remote server).

### Phase 2 — AI readiness (light, alongside OCR)

- [ ] **`IntelligenceProvider`**: methods stubbed for future use, e.g. `refineParsedReceipt`, `suggestReconciliationPatches`, `formatShareMessage` — all return **validated** patches or plain text; default **NoOp**.
- [ ] Optional **rules-only** refine step (no LLM): duplicate detection, simple total-diff hints — can ship before remote AI.
- [ ] **Optional (late Phase 2 / Phase 3):** first **remote** implementation behind flag + API key on server — client sends **minimal** structured payload; responses validated before UI apply.

### OCR

- [ ] Camera + gallery intake; crop UX if needed.
- [ ] OCR integration (on-device SDK or API—decision recorded in ADR or README).
- [ ] **Parser:** raw text → candidate `LineItem[]` + totals; plug into **Review** as prefilled draft.
- [ ] **Never** auto-finalize: user must confirm/edit (BRD US-18).

### Persistence / repository

- [ ] Interface: `ReceiptRepository` — `save`, `get`, `list`, `delete` (names as appropriate).
- [ ] Implementation: **expo-sqlite** and/or **MMKV/AsyncStorage** with **schema version**.
- [ ] Wire **History** and reopen to repository; migration strategy for schema bumps.

### Phase 2 — QA themes

- Sample corpus of real receipts (blur PII); measure correction time.
- Force-quit → relaunch → data intact.
- OCR offline/online behavior documented.

---

## Phase 3 — Backend (outline)

- Authentication (if required) and user identity.
- Data model: users, receipts, line items, members, assignments, settlements; optional blob metadata for images.
- REST or GraphQL API; error contracts and versioning.
- Security: TLS, at-rest encryption for sensitive fields; retention policy.
- Optional **AI gateway** (recommended before any LLM in prod): **server-side** API keys, **prompt/version** control, rate limits, logging; client sends **minimal** structured context; responses stay **schema-validated** before the app applies patches (align with BRD Intelligence epic).

*Details to refine after Phase 2 usage patterns are clear.*

---

## Phase 4 — Integration (outline)

- Replace local-only repository with **syncing client**; conflict strategy (e.g. last-write-wins vs merge).
- **Read-only share links** for friends without the app: **tokenized** URLs, expiry policy, optional PIN; **universal / app links** so the **same URL** opens the **native app** when installed, otherwise a **lightweight mobile web** summary (think **Uber-style** ride/share links: browser tab is enough; no install required to **view**). Prominent **“Get Fetza”** / **Open in app** affordance on web for later installs.
- **Contacts (device)**: permission UX; **pick from contacts** to prefill **member display names** (and optionally phone hints for PayShap-style copy)—always **opt-in**; manual names remain.
- **Messaging**: treat **system share sheet** as baseline; optional dedicated **“WhatsApp”** action using `whatsapp://send?text=` + `Linking` with **encodeURIComponent**, graceful fallback if WhatsApp is missing (iOS/Android quirks documented in implementation notes).
- Optional **push** reminders / email—product-dependent.
- **Intelligence (remote)**: wire **IntelligenceProvider** to backend **AI gateway** for parse repair, reconciliation hints, NL **share copy**—feature-flagged per user/build.

---

## Phase 5 — Visual system & growth polish (outline)

- **Dark mode** and high-contrast pass using semantic tokens only.
- Marketing site / store assets; onboarding.
- Optional **design refresh** without rewriting business logic (tokens + component library).

### Optional — WhatsApp Business / bot surfaces (Phase 5+ or separate spike)

- **WhatsApp Business Platform (Cloud API)** is **not** the same as “share text from app”: it needs a **Meta Business** asset, **template** messages for outbound marketing/utility where required, **per-conversation pricing**, and a **reliable webhook server**. Best fit for **Fetza**: **deep link** or **read-only summary link** handoff (“Open in Fetza”) rather than rebuilding **Assign/Review** inside chat. **Channels** are broadcast-first; ill-suited for interactive bill editing.
- A **thin bot** (e.g. “here’s your total”, “tap to view”, payment reminder) **plus** the **native app** is a common pattern; the **app stays the source of truth** for complex flows.

---

## Dependency sketch

```text
Phase 1 (UX + manual + theme)
    → Phase 2 (OCR + local DB)
        → Phase 3 (API + tables)
            → Phase 4 (sync + integrations)
                → Phase 5 (theming & brand scale)
```

Parallel work *within* a phase is allowed (e.g. theme tweaks while building Assign), but **split math and types** should stabilize early in Phase 1 to avoid rework.
