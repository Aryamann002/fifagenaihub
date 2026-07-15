# FanHub 26

A web app for the FIFA World Cup 2026 that helps fans and stadium staff. It uses
generative AI for a chat assistant, and for staff it feeds live crowd numbers into
the AI so its answers reflect what is happening at the venue right now.

[![Tests](https://img.shields.io/badge/tests-206%20passing-brightgreen)](/)
[![Coverage](https://img.shields.io/badge/coverage-85%25-brightgreen)](/)
[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)

---

## What it does

**Fan portal**
- Chat assistant that answers questions about getting around, food, accessibility, transport, sustainability, and the match.
- Stadium map you can click. Clicking a zone asks the assistant about it. A "Directions" link opens Google Maps.
- Green score that compares travel options by how much carbon they use.
- List of the day's matches.
- Language picker with 8 languages. The assistant replies in the one you pick.

**Staff dashboard**
- Live crowd level for each zone, refreshed every 5 seconds.
- Chat assistant that reads the current crowd numbers, so its advice is based on the live situation.
- Alerts and a summary bar (capacity, active alerts, venue country, renewable energy share).

**On every page:** a toolbar to turn on high contrast and change the font size.

The AI runs the chat on both portals. The map, green score, crowd meter, and match
list are normal features that the assistant can also answer questions about.

---

## Run it

```bash
npm install

# Set one key in .env.local:
#   GENAI_PROVIDER=groq
#   GROQ_API_KEY=your_key          (get a free key at groq.com)
# or
#   GENAI_PROVIDER=gemini
#   GEMINI_API_KEY=your_key

npm run dev        # start the dev server at http://localhost:3000
npm test           # run the tests
npm run build      # production build
npm run type-check # TypeScript check
npm run lint       # ESLint
```

A real key is needed. Without one the chat replies with a short "not configured"
message instead of failing.

---

## How it is built, by judging area

### Problem statement alignment

The task is a GenAI solution that helps fans, organizers, volunteers, or venue staff,
and uses generative AI for things like navigation, crowd management, accessibility,
transport, sustainability, multilingual help, operations, or real-time decisions.

What this app does for each:

| Area | In the app |
|---|---|
| Navigation | Clickable stadium map; the assistant answers "where is / how do I get to" questions |
| Crowd management | Staff dashboard shows live crowd levels; the assistant advises on gate flow using them |
| Accessibility | Site-wide contrast and font controls; the assistant answers accessibility questions |
| Transport | Google Maps directions to the venue; the assistant answers transit questions |
| Sustainability | Green score for travel choices; the assistant answers sustainability questions |
| Multilingual help | 8-language picker; the assistant replies in the chosen language |
| Operations and real-time decisions | Staff assistant reads the live crowd snapshot before answering |

Covers all 16 FIFA 2026 venues and 19 sample matches.

### Google services

- **Google Gemini** is the default AI provider (set `GEMINI_API_KEY`).
- **Google Maps** gives one-tap directions to any venue from the stadium map. This is a plain link, so it needs no key.

### Code quality

- TypeScript in strict mode across the whole app.
- Providers use one small interface with a factory that picks Gemini or Groq. Adding another provider means adding one file.
- Prompt text and query sorting live in one shared file (`lib/genai/shared.ts`) so providers do not repeat them.
- Files are grouped by role: `app/`, `components/`, `hooks/`, `lib/data/`, `lib/genai/`, `lib/security/`.
- ESLint passes with no warnings.

### Security

Checks happen at each layer:

- **Rate limiting.** 20 requests per minute per IP on the chat route, using a token bucket in the middleware.
- **Input validation.** The message is capped at 500 characters. The stadium id must match a strict pattern. The language must be a language code. An unknown stadium id is rejected with a 400.
- **Prompt injection.** A 14-pattern filter removes things like "ignore previous instructions" and script tags before the text reaches the AI. Conversation history from the client is filtered the same way.
- **Response headers.** A per-request nonce Content-Security-Policy, plus X-Frame-Options, HSTS, Referrer-Policy, Permissions-Policy, and the cross-origin headers, all set in the middleware.
- **API keys** stay on the server and are sent in request headers, never in a URL.
- **Errors** return a short generic message; internal details are never sent to the client.

### Efficiency

- A new chat request cancels the one before it (AbortController), so old replies do not overwrite new ones.
- The user's message shows right away, before the reply comes back.
- The chat context is memoized so the send function keeps a stable identity and does not re-run effects.
- The crowd endpoint is left out of rate limiting because the staff dashboard polls it every 5 seconds and it only returns cheap simulated data.
- Images are served as AVIF or WebP.

### Testing

- 206 tests in 20 suites. About 85% line coverage. The coverage gate (80% statements, 80% lines, 75% branches, 70% functions) is enforced, so `npm run test:coverage` fails if coverage drops.
- Security: validators, the injection filter, and the rate limiter (refill timing, limits, wrong types).
- Data: crowd simulator phases, matches, green score.
- AI: provider selection, and the Gemini and Groq providers with a stubbed network call (key handling, history trimming, error handling).
- API routes: both handlers, including bad input and wrong method.
- Components: every UI component, each with a jest-axe accessibility check.

### Accessibility

- Skip link to jump past the header.
- Toolbar for high contrast and font size. Choices are saved and the contrast setting follows the system setting.
- Motion is reduced through CSS when the system asks for it.
- Map zones work with the keyboard (Enter and Space).
- Live regions announce updates for screen readers.
- The crowd heatmap has a matching data table for non-visual use.
- Semantic HTML: `header`, `nav`, `section`, `article`.
- Every component is checked with jest-axe in the tests.

### Edge cases handled

- Invalid JSON, missing fields, an over-long message, and a wrong role all return 400.
- Injection text in the message or in the stadium id is rejected or stripped.
- An unknown but well-formed stadium id returns 400 instead of being passed to the AI.
- A malformed conversation history is ignored instead of causing an error.
- Matches near midnight are compared in UTC so an evening match is not dropped when the local date and the UTC date differ. A bad date value cannot crash the page.
- If the AI provider has no key, the app shows a clear message instead of failing.

---

## Tech

- Next.js 16 (App Router), React 19, TypeScript 5.
- CSS Modules for styling.
- Jest 30 with Testing Library and jest-axe.
- Google Gemini or Groq for the AI.

---

## Project layout

```
src/
  app/
    api/chat/route.ts      POST /api/chat
    api/crowd/route.ts     GET  /api/crowd?stadiumId=
    fan/page.tsx           Fan portal
    staff/page.tsx         Staff dashboard
    layout.tsx             Root layout, SEO, accessibility toolbar
    page.tsx               Landing page
  components/
    ChatInterface/         Chat UI
    CrowdPulse/            Staff crowd view
    GreenScore/            Travel carbon score
    MatchCard/             Match card
    StadiumMap/            Clickable SVG map + Maps directions
    common/                SkipNav, LoadingSkeleton, A11yToolbar
  hooks/
    useChat.ts             Chat state and request handling
    useAccessibility.ts    Contrast and font-size settings
  lib/
    data/                  Stadiums, matches, crowd simulator, green score
    genai/                 Providers (Gemini, Groq), factory, shared prompts, sanitizer
    security/              Input validation, rate limiter
  types/index.ts           Shared types
middleware.ts              Rate limiting, CSP nonce, security headers
```

---

## Environment options

```bash
# Which provider to use: gemini (default) or groq
GENAI_PROVIDER=gemini

# Google Gemini
GEMINI_API_KEY=your_key
GEMINI_MODEL=gemini-2.0-flash      # optional

# Groq
GROQ_API_KEY=your_key              # one key
GROQ_API_KEYS=key1,key2,key3       # or several, used in rotation
GROQ_MODEL=llama-3.1-8b-instant    # optional

# Rate limit (optional; defaults shown)
RATE_LIMIT_MAX_REQUESTS=20
RATE_LIMIT_WINDOW_MS=60000
```

---

## Venues

United States: MetLife, SoFi, AT&T, Hard Rock, NRG, Mercedes-Benz, Levi's, Lincoln Financial, Gillette, Lumen, Arrowhead.
Mexico: Estadio Azteca, Estadio Akron, Estadio BBVA.
Canada: BMO Field, BC Place.
