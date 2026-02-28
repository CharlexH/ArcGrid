# ArcGrid Logo Guide Constructor (MVP)

Web app prototype for generating VI-manual-style logo construction guides with a decoupled two-stage input flow.

## Features
- SVG direct input -> analyze -> candidate guides -> layer preview.
- Image input -> `nanabanana2` provider abstraction -> SVG -> same analyze pipeline.
- Mock-first deterministic solver fingerprints:
  - `MOCK_LOGO_ARCGRID_V1`
  - `MOCK_SOLVER_SIGNATURE=AG26`
  - best score `0.8731`
  - fixed candidate count `3`
- Export:
  - SVG (contains `guides-layer`)
  - PDF (contains guides marker)
- API contracts:
  - `POST /api/v1/vectorize`
  - `GET /api/v1/vectorize/:jobId`
  - `POST /api/v1/logo/analyze`
  - `POST /api/v1/logo/export`
  - `GET /api/health`

## Scripts
- `npm run dev` start local server on `http://localhost:3000`
- `npm run lint` syntax lint for JS/MJS files
- `npm test` API contract tests
- `npm run verify:mock` acceptance gate checks (health + contract + export + UI mount)

## Environment
Use `.env.example`.

`NANABANANA2_API_KEY` and `NANABANANA2_API_BASE` are optional. If absent, vectorization falls back to mock provider output while preserving the same API shape.

## Notes
- This is a deterministic mock-driven implementation for fast validation and contract locking.
- Solver internals are structured so a future nonlinear optimizer can replace current scoring without changing route contracts.
