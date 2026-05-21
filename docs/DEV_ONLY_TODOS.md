# Dev-only code — remove before production

Track items that exist for **local development / POC** only. Search the codebase for `TODO(production)` to find inline markers.

## Fetza (mobile app)

| Item | Location | Action before prod |
|------|----------|-------------------|
| ngrok request header | `src/api/client.ts` | Remove `ngrok-skip-browser-warning`; use production API URL from env/build config |
| localhost API fallback | `app.json` → `extra.apiUrl` | Point production builds at real API; do not ship `http://localhost:3000` |
| Env example / local URLs | `.env`, `.env.example` | Production CI/CD sets `EXPO_PUBLIC_API_URL` to your hosted API |
| `notConnectedYet` stubs | `src/screens/review/ReviewApiScreen.tsx` | Wire merchant edit, clear receipt, rescan image, etc. to API |
| Mock flow reference | `src/reference/mock-flow/` | Design reference only — not in active routes (see folder README) |

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
