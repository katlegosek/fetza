# Business Requirements Document (BRD)

**Product:** Bill-splitting mobile app (**Fetza** — working title)  
**Version:** 1.2 (draft)  
**Audience:** Product owner, engineering, QA  
**Related:** [ROADMAP.md](./ROADMAP.md), [COMPETITIVE-ANALYSIS.md](./COMPETITIVE-ANALYSIS.md)

---

## 1. Purpose

### 1.1 Problem

After a shared meal or group purchase, one person often pays while others owe a share. Manual arithmetic and explaining the receipt are slow, error-prone, and socially awkward.

### 1.2 Goal

Enable someone to **capture a bill**, **correct it**, and close the loop in either of two ways: **(A)** each person pays **their share of what they ate/drank** (itemized assignment), or **(B)** **one or two people cover the tab** with the merchant while **everyone else pays them back**—with **clear sharing** (text, links) so the group knows **who owes whom** and **how much**. Settlement still happens **outside** the app (e.g. PayShap, transfer, cash) until in-app payments exist.

### 1.3 Vision constraint

Primary mental model: **the dinner table** (food, drinks, adjacent cases like bottle-store runs). Broader expense types may follow without changing the core engine.

### 1.4 Two core paths (same receipt engine)

Both paths use **Review** (line items + totals) and usually **Assign**; they differ in **who settled with the merchant** and **how we describe settlement** in Summary and share copy.

| Path | User story (conceptual) | Settlement story |
|------|-------------------------|------------------|
| **A — Itemized (“what we ate”)** | We split the bill fairly: each person is linked to **line items** (or equal split); everyone pays **their portion** of the bill. | Often still **one card at the table**; algebra yields **who should reimburse whom** (or everyone pays the organizer). |
| **B — Payer-backed tab** | **One or two people** pay the restaurant/store; **the rest** reimburse **those payer(s)**. | Summary and share text should make **“Pay [name] R___”** obvious; may combine with Path A math (shares) or a simpler even split. |

**Product note:** Many real nights use **both**: itemized shares **and** “Thabo put down his card.” The data model should allow **designated payer(s)** on the bill so Path B is explicit, not ambiguous in the share message.

### 1.5 Adoption: one phone vs everyone on Fetza

**Ideal (later phases):** **Accounts** + sync so each person can **open the same bill**, confirm their share, or mark paid—reduces “only one person has the app” friction.

**Reality (early phases):** The **organizer** often runs Fetza alone; **friends get text or a read-only link**. Many will assume **they don’t need to install**—that is acceptable for **viewing** amounts, but growth depends on communicating **why** installing helps (e.g. same bill next time, reminders, marking paid, disputes). Copy, web summary **CTA**, and onboarding should be designed deliberately (see Share epic and roadmap Phase 4)—without **blocking** the organizer if friends never install.

---

## 2. Scope

### 2.1 In scope (conceptual)

| Area | Description |
|------|-------------|
| Split concepts | **Path A:** itemized “what we ate.” **Path B:** one/two **payers** covered the tab; others reimburse them (see **§1.4**). Same receipt engine; settlement copy differs. |
| Bill contents | Line items, quantities, prices; merchant/title; adjustments (tax/VAT, service charge, tip). |
| People | Members on the bill; assignment of lines to one or more people. |
| Math | Per-person subtotals, allocated tax/tip (rule-driven), reconciliation vs receipt total. |
| Flow | Review → Assign → Summary; optional Scan entry when OCR exists. |
| History | List and reopen past bills. |
| Settings | Defaults and preferences; data controls as persistence matures. |
| Intelligence (later) | Optional AI **assistants** (see §4); core math remains **deterministic** and user-confirmed. |
| Share & reach (later) | Rich **share to messaging** (e.g. WhatsApp), optional **contacts** for member pickers, **read-only links** when a backend exists. |

### 2.2 Out of scope (early releases)

- In-app payment processing (card rails); the app produces **amounts and instructions**, not money movement.
- Full multi-user real-time collaboration on the same bill (unless added in a later phase).
- Accounting, payroll, or statutory tax filing.

---

## 3. Actors

| Actor | Role |
|--------|------|
| **Organizer** | Leads the bill in Fetza: capture/review, assignments, sharing. Often also a **payer** or participant. |
| **Member** | On the bill; has a computed **owe** amount. May have **no account** (name + shared summary only). |
| **Payer(s)** | **Member(s) who paid the merchant** (Path B); others **reimburse** them unless the product treats everyone as settling into one organizer. At most **two payers** in initial scope unless requirements expand. |

---

## 4. User stories

Stories are grouped by epic. Priority tags: **P0** = Phase 1 rewrite, **P1** = shortly after, **P2** = OCR/persistence phase.

### Epic: Start a bill

- **US-1 (P0)** As an organizer, I want to **start a new bill** so it is isolated from previous sessions.
- **US-2 (P1)** As an organizer, I want to **label the bill** (merchant or nickname) so I recognize it in history.

### Epic: Bill contents (Review)

- **US-3 (P0)** As an organizer, I want to **add, edit, and delete line items** (name, quantity, price) so the digital bill matches the physical one.
- **US-4 (P0)** As an organizer, I want to **edit subtotal, tax/VAT, service charge, tip, and total** so figures reconcile with what I paid.
- **US-5 (P0)** As an organizer, I want a **clear reconciliation state** (ok vs discrepancy) so I fix errors before splitting.

### Epic: People

- **US-6 (P0)** As an organizer, I want to **add and remove members** on this bill.
- **US-7 (P1)** As an organizer, I want **simple member identity** (name, optional color/avatar) for quick scanning on Assign/Summary.

### Epic: Assign

- **US-8 (P0)** As an organizer, I want to **assign each line to one or more people** (“what we ate”) so shared items split fairly (**Path A**).
- **US-9 (P0)** As an organizer, I want **visibility of unassigned lines** so nothing is missed.
- **US-10 (P1)** As an organizer, I want an optional **equal split across all members** for simple cases.

### Epic: Who paid the merchant (Path B)

- **US-29 (P1)** As an organizer, I want to mark **one or two payers** who **settled with the restaurant/store** so Summary and share text show **who everyone else should reimburse** (not just anonymous “your share”).
- **US-30 (P1)** As an organizer, I want **share copy** that states **amounts owed to each payer** when relevant, so the group does not rely on a single person interpreting the receipt.

### Epic: Summary

- **US-11 (P0)** As an organizer, I want **per-person totals** consistent with assignment and tax/tip rules.
- **US-12 (P0)** As an organizer, I want to **copy or share** a text summary for messaging apps.
- **US-13 (P1)** As an organizer, I want to **mark members as paid** and see **settlement progress**.

### Epic: History

- **US-14 (P0)** As an organizer, I want to **see a list of past bills** with enough context to choose one.
- **US-15 (P0)** As an organizer, I want to **reopen a bill** to review or correct it.

### Epic: Settings

- **US-16 (P0)** As an organizer, I want **defaults** (e.g. currency, tip %) where applicable.
- **US-17 (P2)** As an organizer, I want **export/delete** when data is persisted and policy is defined.

### Epic: Capture (Phase 2+)

- **US-18 (P2)** As an organizer, I want to **scan a receipt** so line items are prefilled, with mandatory confirmation before split.

### Epic: Share & members (Phase 1 baseline + Phase 4+)

- **US-19 (P0–P1)** As an organizer, I want to **share** a preformatted summary to **any app** that accepts text (including WhatsApp) so the group can settle without ambiguity.
- **US-20 (P3–P4)** As an organizer, I want to **pick people from device contacts** (with permission) to **prefill names or labels** on a bill—optional; manual entry always remains.
- **US-21 (P4)** As an organizer, I want a **read-only link** so friends **without the app** can open a **mobile-friendly web page** (browser tab) and see the same summary—**Uber-style**: link works everywhere; if the app is installed, **universal / app links** can jump straight into Fetza. Editing stays in the app; web is **view-only** unless product scope changes later. The page should **invite install** (value prop: follow this bill, mark paid next time—exact CTA TBD) so we combat “only one person needs the app.”
- **US-22 (P5 / optional)** As an organizer, I want **WhatsApp** to be a **first-class share target** (deep link or `whatsapp://` text) so one tap opens a chat with the message **pre-filled**—platform limits apply; no guarantee of a Meta/WhatsApp “official” button without their product surfaces.

### Epic: Intelligence — beyond OCR (Phase 3+)

AI augments the product **only** through a **pluggable provider**; **OCR** is one input. Proposals must **validate** against schemas; **amounts owed** always flow from **core split logic**, not unconstrained model text.

- **US-23 (P3+)** As an organizer, I want **parse repair** after OCR (duplicate lines, merged rows, merchant cleanup **suggestions**) that I can **accept or reject** per suggestion.
- **US-24 (P3+)** As an organizer, I want a **reconciliation hint** when totals don’t match (e.g. missing service line **suggested**, not auto-applied).
- **US-25 (P3+)** As an organizer, I want a **natural-language summary** for messengers generated **only from finalized** per-person numbers (model formats copy; it does not invent totals).
- **US-26 (P4+)** As an organizer, I want **assignment hints** from item text (e.g. drink types) that I **confirm** before they affect the bill.
- **US-27 (P4+)** As an organizer, I may want **voice or typed NL** to **draft** line items, always landing in **Review** for confirmation (heavy UX; after core loop is stable).

### Epic: Optional WhatsApp / Meta surfaces (Phase 5+ / research)

- **US-28 (optional)** **WhatsApp Business Platform** (Cloud API) or similar: send templated messages, receive inbound commands, or hand off to a **deep link** into the app—subject to **Meta policies**, **verification**, **cost per conversation**, and **server** ownership. Treat as **distribution + notification**, not a full replacement for Assign/Review on-device unless scope is intentionally narrow.

---

## 5. Business rules

Rules below are **canonical** for implementation and QA. Numeric policies (rounding, tolerance) must match `lib/split.ts` (or successor module).

1. **Bill identity**  
   A bill has: metadata (title, dates), line items, adjustment fields, member list, assignments, **optional designated payer(s)** for Path B, optional settlement flags.

2. **Line items**  
   Quantity and prices follow schema validation (e.g. non-negative line totals unless discounts are modeled as negative lines—product choice must be one consistent approach).

3. **Assignment (Path A)**  
   A line is *unassigned* or assigned to ≥1 member. For multi-assign, each assignee’s **share of that line** follows the documented rule (default: **equal split of line total**).

4. **Payers (Path B)**  
   Zero, one, or two **payers** may be designated as **paid the merchant**. **Non-payers’** owed amounts must **sum consistently** with **who receives reimbursement** (implementation: net-to-payer totals, or explicit “owes [Payer] R x” per member). Edge case: **no** payer set → treat as **organizer-led** summary only or require payer before share (product decision, must be consistent in copy).

5. **Tax / service / tip allocation**  
   Allocate to members **proportionally to their assigned subtotal share** after line splits (or the single rule encoded in code). Summary must match Assign + Review inputs.

6. **Reconciliation**  
   Computed subtotal + adjustments must match the stated **grand total** within a defined **tolerance**; otherwise show discrepancy. Product decision: block progression vs warn-only—must be consistent.

7. **Rounding**  
   Internal representation (e.g. minor units or fixed decimals) vs display rounding must be documented. Person totals may differ from receipt total by at most the agreed rounding slack.

8. **History lifecycle**  
   Define when a bill appears in history (on save, on exit, on explicit “done”). **No duplicate** records for the same logical session unless explicitly “duplicate bill.”

9. **Privacy (future backend)**  
   Receipt images and PII are user data; access control applies when accounts and sync exist.

---

## 6. Non-functional requirements

| NFR | Target |
|-----|--------|
| **Offline-first (early phases)** | Core flows work without network after install. |
| **Theming** | Colors, spacing, and typography driven from a **single theme module**; semantic tokens (e.g. `surface`, `textPrimary`) to ease dark mode later. |
| **Testability** | Pure functions for allocation and reconciliation; golden tests for edge cases. |
| **Accessibility** | Touch targets and Dynamic Type considered for primary flows. |
| **Intelligence boundary** | `IntelligenceProvider` (or equivalent): **NoOp** in early phases; remote/on-device implementations later. AI outputs **JSON validated** to patch types; **human-in-the-loop** for money. |
| **Contacts & messaging** | OS **permission** prompts and **privacy policy** for contact access; share flows must **not** assume WhatsApp is installed (fallback to system share sheet). |
| **Adoption** | **Single-device** use must remain viable; shared surfaces (text, web) should **invite** multi-user installs **without** breaking the organizer flow. Full **accounts** deferred per roadmap. |

---

## 7. Success criteria (MVP)

- Organizer can complete **Review → Assign → Summary** without losing state.
- Changing any line or assignment **deterministically** updates Summary.
- Share/copy text is readable without the app installed.
- Theme changes are feasible by **editing centralized tokens**, not per-screen hex hunts.

---

## 8. Glossary

| Term | Meaning |
|------|---------|
| **Bill / receipt** | The structured data for one outing, not only the paper image. |
| **Payer** | Member who paid the merchant; others may owe them reimbursement (Path B). |
| **Reconcile** | Align computed totals with the amount actually paid. |
