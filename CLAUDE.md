# FanHub 26 — AI Coding Agent Handoff Context

## Status: BUILD COMPLETE ✅

**Last Updated:** 2026-07-15
**Build Status:** PASSING (Next.js build ✅, 113 tests ✅, TypeScript ✅)

---

## What is this?

FanHub 26 is a **Next.js 16 + TypeScript** GenAI-powered stadium companion for the FIFA World Cup 2026:
- Fan portal: multilingual AI chat, interactive SVG stadium map (with Google Maps directions), green sustainability score, live match feed
- Staff dashboard: real-time crowd pulse, operational AI grounded in live crowd data, alert feed, stats bar
- Floating accessibility toolbar (high contrast + font size) on every page

---

## File Tree (source only)

```
src/
├── app/
│   ├── api/
│   │   ├── chat/route.ts           ← POST /api/chat (+ route.test.ts)
│   │   └── crowd/route.ts          ← GET /api/crowd?stadiumId= (+ route.test.ts)
│   ├── fan/page.tsx                ← Fan portal (chat + map/green tabs)
│   ├── staff/page.tsx              ← Staff dashboard
│   ├── globals.css                 ← Full design system (DO NOT DELETE)
│   ├── layout.tsx                  ← Root layout + SEO + A11yToolbar
│   └── page.tsx                    ← Landing page (role selector)
├── components/
│   ├── ChatInterface/              ← Chat UI; accepts pendingQuery prop
│   ├── CrowdPulse/                 ← Staff crowd dashboard (5s polling)
│   ├── GreenScore/                 ← Sustainability score
│   ├── MatchCard/                  ← Match info card
│   ├── StadiumMap/                 ← SVG map; zone click → chat query;
│   │                                 Google Maps directions link
│   └── common/
│       ├── A11yToolbar/            ← High contrast + font size controls
│       ├── LoadingSkeleton/
│       └── SkipNav/
├── hooks/
│   ├── useAccessibility.ts         ← Used by A11yToolbar
│   └── useChat.ts                  ← AbortController, optimistic updates
├── lib/
│   ├── data/
│   │   ├── crowd-simulator.ts      ← Time-aware crowd simulation (+ tests)
│   │   ├── matches.ts              ← 20 sample matches
│   │   ├── stadiums.ts             ← All 16 FIFA 2026 venues
│   │   └── sustainability.ts       ← Green score calculator
│   ├── genai/
│   │   ├── gemini-provider.ts      ← Google Gemini (DEFAULT provider)
│   │   ├── groq-provider.ts        ← Groq alternative
│   │   ├── mock-provider.ts        ← Offline fallback engine (+ tests)
│   │   ├── provider.ts             ← Strategy-pattern factory
│   │   ├── shared.ts               ← Shared prompts, detectCategory,
│   │   │                             extractSuggestions (+ tests)
│   │   ├── sanitizer.ts            ← Prompt injection prevention (+ tests)
│   │   └── types.ts
│   └── security/
│       ├── input-validator.ts      ← Message/context validation (+ tests)
│       └── rate-limiter.ts         ← Token-bucket rate limiter (+ tests)
└── types/index.ts                  ← All shared TypeScript types

Root:
├── middleware.ts                   ← Rate limiting + nonce-based CSP + security headers
├── next.config.ts                  ← AVIF/WebP images, strict mode (no headers here)
├── jest.config.ts / jest.setup.ts
└── .env.local                      ← Local provider config (not committed)
```

---

## Key Technical Decisions

### GenAI provider selection
`GENAI_PROVIDER` env var: `gemini` (default) | `groq` | `mock`.
The factory in `provider.ts` falls back to the mock provider whenever the
selected provider's API key is missing — the app must always work offline.
Shared prompt templates and query categorization live in `lib/genai/shared.ts`;
providers must not duplicate them.

### Real-time decision support
`/api/chat` resolves the stadium name via `getStadiumById` and, for staff
queries, injects a live crowd snapshot (`GenAIContext.liveOpsSummary`) so
LLM providers ground operational answers in current zone data.

### Security headers
All security headers (including the nonce-based CSP) are set in
`middleware.ts`. `next.config.ts` intentionally has none. The nonce flows
to `layout.tsx` via the `x-nonce` request header.

### validateChatContext
Required fields: `stadiumId` (non-empty string) and `role` (`fan`|`staff`);
`language` is optional. `null` input → `isValid: false`.

### Stadium IDs
`metlife`, `sofi`, `att`, `hardrock`, `nrg`, `mercedesbenz`, `levis`,
`lincoln`, `gillette`, `lumen`, `arrowhead`, `azteca`, `akron`, `bbva`,
`bmo`, `bcplace`. Format regex: `/^[a-zA-Z0-9-]{1,50}$/`.

### Crowd Simulator
Time-aware data keyed to a 20:00 UTC kickoff. Six phases: `pre_match`,
`kickoff`, `first_half`, `halftime`, `second_half`, `post_match`.

---

## Test Results (as of last run)
```
Test Suites: 8 passed, 8 total
Tests:       113 passed, 113 total
```
API route tests run under `@jest-environment node` (docblock per file).

---

## Running the App

```bash
npm run dev          # Development
npm test             # Tests
npm run build        # Build (validates everything)
npm run type-check   # TypeScript
```
