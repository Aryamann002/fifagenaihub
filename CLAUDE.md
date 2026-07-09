# FanHub 26 — AI Coding Agent Handoff Context

## Status: BUILD COMPLETE ✅

**Last Updated:** 2026-07-09  
**Build Status:** PASSING (Next.js build ✅, 58 tests ✅, TypeScript ✅)

---

## Project Location
```
C:\Users\Aryamann Sharma\.gemini\antigravity\scratch\fifa-genai-hub
```

---

## What is this?

FanHub 26 is a **Next.js 16 + TypeScript** GenAI-powered stadium companion for the FIFA World Cup 2026. It provides:
- Fan portal: multilingual AI chat, interactive SVG stadium map, green sustainability score, live match feed
- Staff dashboard: real-time crowd pulse, operational AI, alert feed, stats bar

---

## Current File Tree (Complete)

```
src/
├── __mocks__/
│   └── isomorphic-dompurify.js     ← Jest mock (plain JS, no TS types)
├── app/
│   ├── api/
│   │   ├── chat/route.ts           ← POST /api/chat
│   │   └── crowd/route.ts          ← GET /api/crowd?stadiumId=
│   ├── fan/
│   │   ├── page.tsx                ← Fan portal (3-panel layout)
│   │   └── page.module.css
│   ├── staff/
│   │   ├── page.tsx                ← Staff dashboard
│   │   └── page.module.css
│   ├── globals.css                 ← Full design system (DO NOT DELETE)
│   ├── layout.tsx                  ← Root layout + SEO
│   ├── page.tsx                    ← Landing page (role selector)
│   └── page.module.css
├── components/
│   ├── ChatInterface/
│   │   ├── ChatInterface.tsx       ← Main chat UI (useChat hook)
│   │   └── ChatInterface.module.css
│   ├── CrowdPulse/
│   │   ├── CrowdPulse.tsx          ← Staff crowd density dashboard
│   │   └── CrowdPulse.module.css
│   ├── GreenScore/
│   │   ├── GreenScore.tsx          ← Sustainability score component
│   │   └── GreenScore.module.css
│   ├── MatchCard/
│   │   ├── MatchCard.tsx           ← Match info card
│   │   └── MatchCard.module.css
│   ├── StadiumMap/
│   │   ├── StadiumMap.tsx          ← Interactive SVG stadium map
│   │   └── StadiumMap.module.css
│   └── common/
│       ├── LoadingSkeleton/
│       │   ├── LoadingSkeleton.tsx
│       │   └── LoadingSkeleton.module.css
│       └── SkipNav/
│           ├── SkipNav.tsx
│           └── SkipNav.module.css
├── hooks/
│   ├── useAccessibility.ts
│   ├── useChat.ts                  ← AbortController, optimistic updates
│   └── useDebounce.ts
├── lib/
│   ├── data/
│   │   ├── crowd-simulator.ts      ← Time-aware crowd simulation
│   │   ├── crowd-simulator.test.ts ← 8 passing tests
│   │   ├── matches.ts              ← 20 sample matches
│   │   ├── stadiums.ts             ← All 16 FIFA 2026 venues
│   │   └── sustainability.ts       ← Green score calculator
│   ├── genai/
│   │   ├── mock-data-fan.ts
│   │   ├── mock-data-staff.ts
│   │   ├── mock-provider.ts        ← Full AI simulation engine
│   │   ├── provider.ts             ← Strategy pattern factory
│   │   ├── sanitizer.ts            ← Prompt injection prevention
│   │   ├── sanitizer.test.ts       ← 15 passing tests
│   │   └── types.ts
│   └── security/
│       ├── headers.ts              ← Security HTTP headers
│       ├── input-validator.ts      ← Full context validation (role+stadiumId)
│       ├── input-validator.test.ts ← 18 passing tests
│       ├── rate-limiter.ts         ← Token-bucket rate limiter
│       └── rate-limiter.test.ts    ← 7 passing tests
└── types/
    └── index.ts                    ← All shared TypeScript types

Root:
├── middleware.ts                   ← Edge middleware (rate limit + headers)
├── next.config.ts                  ← AVIF/WebP images, strict mode
├── jest.config.ts                  ← setupFilesAfterEnv, moduleNameMapper
├── jest.setup.ts                   ← Testing-library + jest-axe setup
├── tsconfig.json                   ← paths: { "@/*": ["./src/*"] }
├── .env.local                      ← GENAI_PROVIDER=mock
├── .prettierrc
└── README.md
```

---

## Key Technical Decisions

### Jest Mock for isomorphic-dompurify
`src/__mocks__/isomorphic-dompurify.js` is a **plain JavaScript** file (no TypeScript).
It must stay as `.js` — if you convert to `.ts`, SWC will fail to parse it because the ESM deps cause issues.

### validateChatContext
The function now validates **required** fields:
- `stadiumId`: required, must be non-empty string
- `role`: required, must be `'fan'` or `'staff'`
- `language`: optional

If `null` is passed, returns `isValid: false` (not valid).

### Stadium IDs
Stadiums have short IDs: `metlife`, `sofi`, `att`, `hardrock`, `nrg`, `mercedesbenz`, `levis`, `lincoln`, `gillette`, `lumen`, `arrowhead`, `azteca`, `akron`, `bbva`, `bmo`, `bcplace`

The `validateStadiumId` regex: `/^[a-zA-Z0-9-]{1,50}$/`

### Crowd Simulator
Generates time-aware data based on UTC time relative to a 20:00 kickoff. Six phases: `pre_match`, `kickoff`, `first_half`, `halftime`, `second_half`, `post_match`.

---

## Test Results (as of last run)
```
PASS src/lib/genai/sanitizer.test.ts
PASS src/lib/data/crowd-simulator.test.ts  
PASS src/lib/security/input-validator.test.ts
PASS src/lib/security/rate-limiter.test.ts

Test Suites: 4 passed, 4 total
Tests:       58 passed, 58 total
```

## Build Results
```
Route (app)
┌ ○ /
├ ○ /_not-found
├ ƒ /api/chat
├ ƒ /api/crowd
├ ○ /fan
└ ○ /staff
```

---

## What Still Could Be Done (Optional Improvements)

1. **Component tests** — `MatchCard.test.tsx`, `GreenScore.test.tsx` using `@testing-library/react`
2. **Accessibility tests** — `jest-axe` for ARIA violation checking
3. **E2E tests** — Playwright or Cypress for full user journey tests
4. **Real GenAI integration** — Add Gemini provider in `src/lib/genai/provider.ts`
5. **Error boundaries** — `error.tsx` files in app route segments
6. **Loading states** — `loading.tsx` files for streaming Suspense

---

## Running the App

```bash
# Development
npm run dev

# Tests
npm test

# Build (validates everything)
npm run build

# Type check
npm run type-check
```
