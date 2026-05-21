# Competitive analysis: Splitwise & Splitfair

**Purpose:** Clarify what this product (**Fetza**) shares with established players and where differentiation is realistic.  
**Note:** Competitor features change; verify on official sites and stores before positioning publicly.

**Primary references (non-exhaustive):**

- [Splitwise](https://www.splitwise.com/) — product and Pro features.
- [Splitwise Pro](https://www.splitwise.com/pro) — receipt scanning, paid tier.
- [Splitwise help: How do I use Splitwise?](https://feedback.splitwise.com/knowledgebase/articles/1088920-how-do-i-use-splitwise)
- [Splitfair — App Store listing (Group Expenses)](https://apps.apple.com/us/app/splitfair-group-expenses/id6744828986)
- [Splitfair on Product Hunt](https://www.producthunt.com/posts/splitfair)
- [splitfair marketing site (thebill.dev)](https://thebill.dev/) — feature messaging (some template strings visible in page copy at time of fetch).

---

## 1. Executive summary

| | **Splitwise** | **Splitfair** | **Fetza (this app)** |
|--|----------------|----------------|---------------------------|
| **Core metaphor** | Long-lived **groups** and running **balances**; “who owes whom” over time. | **Receipt-first** AI scan, **item assignment**, groups, balances, import from Splitwise. | **Session-first** bill: **Review → Assign → Summary**; table/dinner wedge; local/ZA settlement habits. |
| **Primary retention loop** | Add many expenses over weeks/months; settle periodically. | Same + receipt scan quota on free tier. | **Finish one bill tonight**; history is archive, not necessarily a multi-month ledger. |
| **OCR / itemization** | **Splitwise Pro**: scan receipt, itemize for assignment (paid). | **Core promise**: AI receipt digitization; assign lines; portion splits. | **Phase 2**: OCR as **prefill** into Review; same item-assignment engine as manual entry. |
| **Scale of product** | Mature: web, mobile, 100+ currencies, debt simplification, recurring expenses, categories, integrations. | Newer; emphasizes fairness, insights, Splitwise import. | **Narrower MVP**: one bill, fair shares, share text; backend later. |

**Bottom line:** Splitwise optimizes **ongoing group accounting**. Splitfair optimizes **fair itemized splits** with AI. This app can overlap **Splitfair’s dinner receipt** use case while staying **smaller and more local** (UX, defaults, settlement copy) until broader features ship.

---

## 2. Splitwise — what it is

### 2.1 Positioning

Splitwise is the de facto **shared expense ledger** for households, trips, and friend groups. Users create **groups**, add **expenses** over time, and rely on **running balances** and **simplified debts** (“debt simplification”) so fewer payments settle the group.

### 2.2 Features relevant to comparison

**Typical free / core flow (from public materials):**

- Account + **groups**; invite members by email/phone.
- **Add expense:** who paid, how split (equal, exact amounts, percentages, shares).
- **Attachments:** receipt photos; backdating.
- **Balances** across groups; **settle up** (record cash or linked payment methods where supported).
- **Multi-currency**, many languages; **offline** usage described in third-party guides; **recurring** expenses.
- **Categories** for expenses.

**Splitwise Pro (paid):**

- **Receipt scanning** with automatic itemization for assignment (marketing emphasis on restaurant/grocery).
- Charts / spending insights.
- Currency conversion (trip use case).
- Some regions: transaction import, ad-free experience (see [splitwise.com/pro](https://www.splitwise.com/pro)).

### 2.3 Product assumptions

- You **live inside Splitwise** for a **long horizon** (roommates, trips).
- The **unit of work** is often “log an expense,” not always “one physical receipt, tonight.”
- **Social graph** is account-based; fairness is supported, but the **hero story** is **balance over time**, not necessarily “thermal receipt in hand at the table.”

### 2.4 Documented / reported limitations (verify before citing in marketing)

Third-party comparisons (e.g. competitor blogs) claim constraints such as:

- Receipt flow may favor **live camera** over gallery in some versions (affects “friend sent me a photo”).
- OCR **depth and accuracy** for messy receipts may trail specialized receipt-first apps.

Treat these as **signals to user-test**, not facts stamped by Splitwise.

---

## 3. Splitfair — what it is

### 3.1 Positioning

Splitfair presents as a **fair, accurate bill splitter** with **AI receipt scanning**, **line-item assignment**, optional **visual portions** (e.g. fractions of an item), **groups**, **balance tracking**, and **settlement guidance**. Public listings mention:

- Unlimited groups/expenses on free tier with a **monthly cap on AI scans**; **Pro** for more scans and priority support.
- **Import** existing data from **Splitwise**.
- **Offline** capability for add/view in some descriptions.
- **Insights**: categories, trends (per store listing summaries).

### 3.2 Features relevant to comparison

Overlapping with your intended product:

- **Scan → itemized lines** → assign to people.
- **Split shared items** (including fractional assignments—check their UX).
- **Who owes whom** and payment recording.
- **Export/share summaries**; friends may see summaries **without** the app (per App Store description).

### 3.3 Product assumptions

- **Receipt-first** and **item-fairness** are central; marketing on [thebill.dev](https://thebill.dev/) emphasizes scan, itemize, assign, insights.
- **Monetization** tied to **scan volume** (freemium), which shapes how aggressively users can rely on OCR.

---

## 4. Similarities: what all three do

These are **table stakes** for the category, not differentiators.

| Theme | Splitwise | Splitfair | Fetza |
|-------|-----------|-----------|-------------------|
| Split group costs | Yes (broad) | Yes | Yes (narrow focus first) |
| Who paid vs who owes | Yes | Yes | Yes |
| Per-person amounts | Yes | Yes (item-driven) | Yes |
| Receipt evidence | Photo attach; Pro OCR | AI scan core | Phase 2 OCR + manual always |
| Share totals externally | Yes / integrations | Summaries / export | Copy/share text; PayShap-friendly copy (product choice) |
| Fairness for itemized meals | Pro itemization | Core | Core via Assign |

---

## 5. Differences: where Fetza can stand apart

Use this internally to avoid **feature-chasing** Splitwise’s decade of scope.

### 5.1 vs Splitwise

| Dimension | Splitwise | Fetza (intended) |
|-----------|-----------|------------------|
| **Time horizon** | Multi-month **ledger** per group | **One bill session** first; history as **archive** |
| **Cognitive load** | Groups, feeds, balances, simplify debts | **Linear flow**: fix receipt → assign → done |
| **Account wall** | Strong (invite, account) | Can stay **single-device first**; accounts in Phase 3+ |
| **Geography / payments** | US/EU defaults (PayPal, Venmo in docs) | **ZAR**, **PayShap**, local wording |
| **OCR** | Behind **Pro** paywall | Your policy: e.g. bundled or limited free tier—**product decision** |
| **Depth of categories/budgeting** | Mature | **Defer** until core loop loved |

**Differentiation story (example):**  
*“Not another group ledger—just tonight’s receipt, fair numbers, and a message you can paste in WhatsApp.”*

### 5.2 vs Splitfair

| Dimension | Splitfair | Fetza (intended) |
|-----------|-----------|------------------|
| **Breadth** | Groups, insights, import, balances | **MVP = dinner-table receipt**; grow deliberately |
| **AI reliance** | Central to value prop; scan quotas | OCR as **accelerator**; **manual path** always first-class |
| **Insights / budgeting** | Highlighted on site | Optional **later**; avoid competing on dashboards early |
| **Brand** | Global “fair bill” | **Food & drinks** emotional context (without excluding adjacent uses) |

**Differentiation story (example):**  
*“Same honesty as item-level assignment, fewer knobs—built for the moment the card machine beeps.”*

### 5.3 Sustainable moat (realistic for a solo builder)

Moats are rarely “idea.” Likely advantages:

- **UX craft** on the **three-screen** path under real SA receipts.
- **Trust**: transparent math, reconciliation, no surprise subscription for core dinner flow.
- **Speed**: open app → correct total → share in under a minute after Phase 2.
- **Local fit**: currency, labels, settlement copy people actually use.

---

## 6. Implications for roadmap

1. **Phase 1** should **win on clarity and speed** without OCR—Splitwise’s free tier is “add expense”; Splitfair still competes on manual paths for users who hit scan limits.  
2. **Phase 2 OCR** should target **your** worst real receipts (thermal, faded, VAT lines)—parity with marketing claims matters less than **your** users’ photos.  
3. **Phase 3–4** if you add **groups/sync**, you **overlap Splitwise more**—sequence carefully so you don’t rebuild their entire product before retention on single bills is proven.

---

## 7. Competitive risks

| Risk | Mitigation |
|------|-------------|
| Splitwise improves free OCR | Double down on **speed + local settlement UX + transparency** |
| Splitfair owns “AI receipt” narrative | Position OCR as **optional**; emphasize **control** and **Review** |
| Both add PayShap | **Be first best** at one region + one flow trumps “also has button” |

---

## 8. Sources & disclaimer

Facts above are synthesized from **public marketing pages**, **App Store listings**, and **help docs**. Feature availability varies by platform and region. Before **external** competitive claims (“only app that…”), verify against current competitor versions and legal guidelines.
