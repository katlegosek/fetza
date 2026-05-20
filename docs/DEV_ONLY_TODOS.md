# Dev-only code — remove before production

Track items that exist for **local development / POC** only. Search the codebase for `TODO(production)` to find inline markers.

## Fetza (mobile app)

| Item | Location | Action before prod |
|------|----------|-------------------|
| ngrok request header | `src/api/client.ts` | Remove `ngrok-skip-browser-warning`; use production API URL from env/build config |
| localhost API fallback | `app.json` → `extra.apiUrl` | Point production builds at real API; do not ship `http://localhost:3000` |
| Env example / local URLs | `.env`, `.env.example` | Production CI/CD sets `EXPO_PUBLIC_API_URL` to your hosted API |
| Mock review screen | `src/app/scan/review.tsx` → `ReviewBillMock` | Remove mock path; require `billId` (or create bill via API first) |
| `notConnectedYet` stubs | `src/app/scan/review.tsx` | Wire merchant edit, clear receipt, rescan image, etc. to API |
| Dev “mock review” link | `src/app/scan/index.tsx` (`__DEV__`) | Already stripped from release builds; delete block when mock flow is gone |
| Mock assign flow | `src/app/scan/assign.tsx` (no `billId`) | Remove `SEED_*` / local assignment state; API-only assign |
| Mock summary/share | `src/app/scan/summary.tsx`, `share.tsx` | Route with real `billId` + API data only |
| Draft mock types | `src/mocks/review-draft.mock.ts` | Delete or restrict to test fixtures |

## Rails API

| Item | Location | Action before prod |
|------|----------|-------------------|
| ngrok host allowlist | `config/environments/development.rb` | Dev-only file — do not copy to production; no action if `development.rb` stays dev-only |
| No auth — `User.first` | `app/controllers/api/mobile/v1/base_controller.rb` | Replace with Doorkeeper/JWT (or session) and `current_mobile_user` from token |
| Fake OCR pipeline | `ProcessReceiptJob` → `Receipts::FakeOcrProcessor` | Swap for real OCR provider; keep job + processing_run contract |
| CORS Expo origins | `config/initializers/cors.rb` | Tighten origins in production (already empty outside development) |

## Quick search

```bash
# Fetza
rg 'TODO\(production\)' /Users/katlego/Documents/Develompent/fetza

# Rails
rg 'TODO\(production\)' /Users/katlego/Documents/Develompent/rails
```

## Not dev-only (keep for production)

- `POST /api/mobile/v1/bills` (create draft bill)
- Receipt upload, polling, review/assign/summary API wiring
- `EXPO_PUBLIC_API_URL` pattern (values change per environment, not the pattern itself)
