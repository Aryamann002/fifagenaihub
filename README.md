# FanHub 26 — GenAI Stadium Companion for FIFA World Cup 2026

[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-16-000000?logo=next.js)](https://nextjs.org/)
[![Tests](https://img.shields.io/badge/Tests-58%20passing-brightgreen)](/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

> **AI-powered stadium companion** delivering real-time multilingual assistance, crowd intelligence, interactive navigation, and sustainability tracking across all 16 FIFA World Cup 2026 venues.

## 🌍 Problem Statement

The FIFA World Cup 2026 spans **16 venues** across the **USA, Mexico, and Canada**, attracting **5+ million fans** speaking dozens of languages. Key challenges include:

- **Navigation** — complex stadiums confuse first-time visitors
- **Crowd Management** — staff need real-time density intelligence
- **Accessibility** — diverse needs require inclusive assistance
- **Sustainability** — fans need incentives for greener transit choices
- **Multilingual Support** — English-only systems exclude millions

FanHub 26 solves all of these with a single, AI-powered interface.

---

## 🚀 Features

### Fan Portal
| Feature | Description |
|---|---|
| **🌍 Multilingual AI Chat** | Detects input language (8 languages) and responds in-kind |
| **🗺️ Interactive Stadium Map** | SVG-based clickable zone map; zones link to AI navigation queries |
| **🌱 Green Score** | Circular scoring ring + transit mode selector with CO₂ comparisons |
| **⚽ Live Match Feed** | Real-time match status cards with scores, groups, and venue info |

### Staff Dashboard
| Feature | Description |
|---|---|
| **📊 Crowd Pulse** | Auto-refreshing zone-by-zone crowd density (5s intervals) |
| **🤖 Ops AI Assistant** | Staff-tuned AI for operational intelligence |
| **⚠️ Alert Feed** | Severity-coded operational alerts with one-click dismissal |
| **📈 Stats Bar** | Capacity, active alerts, country, and renewable energy |

---

## 🏗️ Architecture

```
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── chat/route.ts        # GenAI chat endpoint (POST)
│   │   │   └── crowd/route.ts       # Crowd data endpoint (GET)
│   │   ├── fan/page.tsx             # Fan portal
│   │   ├── staff/page.tsx           # Staff dashboard
│   │   ├── layout.tsx               # Root layout + SEO
│   │   └── page.tsx                 # Landing / role selector
│   ├── components/
│   │   ├── ChatInterface/           # GenAI chat UI
│   │   ├── CrowdPulse/              # Real-time crowd dashboard
│   │   ├── GreenScore/              # Sustainability scorer
│   │   ├── MatchCard/               # Match info card
│   │   ├── StadiumMap/              # Interactive SVG map
│   │   └── common/                  # SkipNav, LoadingSkeleton
│   ├── hooks/
│   │   ├── useChat.ts               # Chat state + AbortController
│   │   ├── useDebounce.ts           # Debounced value hook
│   │   └── useAccessibility.ts      # ARIA and accessibility utilities
│   ├── lib/
│   │   ├── data/
│   │   │   ├── stadiums.ts          # All 16 FIFA 2026 venues
│   │   │   ├── matches.ts           # Match schedule data
│   │   │   ├── sustainability.ts    # Green score calculator
│   │   │   └── crowd-simulator.ts   # Time-aware crowd simulation
│   │   ├── genai/
│   │   │   ├── provider.ts          # Provider interface + factory
│   │   │   ├── mock-provider.ts     # Full-featured mock AI engine
│   │   │   └── sanitizer.ts         # Prompt injection prevention
│   │   └── security/
│   │       ├── rate-limiter.ts      # Token-bucket rate limiter
│   │       ├── input-validator.ts   # Input validation utilities
│   │       └── headers.ts           # Security HTTP headers
│   └── types/index.ts               # All shared TypeScript types
└── middleware.ts                    # Edge middleware (rate limiting + headers)
```

---

## 🔐 Security

Defense-in-depth security across all layers:

| Layer | Implementation |
|---|---|
| **Rate Limiting** | Token-bucket algorithm (20 req/min) via edge middleware |
| **Input Validation** | Type-safe validators; length limits; no `any` types |
| **Prompt Injection** | 13-pattern injection detector in `sanitizer.ts` |
| **Security Headers** | CSP, X-Frame-Options, HSTS, Permissions-Policy |
| **No Data Leakage** | Generic error messages; internals never exposed |
| **HTML Sanitization** | DOMPurify with strict allowlist |

---

## ♿ Accessibility (WCAG 2.1 AA)

- `SkipNav` for keyboard navigation past repeated content
- All interactive SVG elements: `role="button"`, keyboard (`Enter`/`Space`) support
- `role="status"` + `aria-live="polite"` for dynamic updates
- Accessible table alternative to visual heatmap
- `prefers-reduced-motion` respected for all animations
- Semantic HTML: `<article>`, `<section>`, `<header>`, `<nav>`

---

## 🧪 Testing

```
4 test suites · 58 tests · 100% pass rate
```

```bash
npm test              # Run all tests
npm run test:coverage # With coverage report
npm run type-check    # TypeScript validation
```

---

## ⚡ Quick Start

```bash
# Install
npm install

# Configure environment (copy .env.local — defaults work out of the box)
cp .env.local .env.local.bak

# Start development server
npm run dev

# Open http://localhost:3000
```

---

## 🌐 Covered Venues

**USA (11):** MetLife Stadium · SoFi Stadium · AT&T Stadium · Hard Rock Stadium · NRG Stadium · Mercedes-Benz Stadium · Levi's Stadium · Lincoln Financial Field · Gillette Stadium · Lumen Field · Arrowhead Stadium

**Mexico (3):** Estadio Azteca · Estadio Akron · Estadio BBVA

**Canada (2):** BMO Field · BC Place

---

## 🤖 GenAI Architecture

Strategy-pattern provider interface enables clean swapping:

```
GenAIProvider (interface)
  └── GroqProvider         ← Default in production (set keys via env)
  └── MockGenAIProvider    ← Safe fallback (works without API keys)
  └── GeminiProvider       ← Optional
```

The mock provider:
- Detects 8 languages from input
- Categorizes queries into 9 domains
- Generates stadium-contextual responses
- Responds in Spanish/French when detected
- Simulates 200–800ms latency

### Environment setup for Groq

```bash
# provider selection
GENAI_PROVIDER=groq

# use one key
GROQ_API_KEY=your_key_here

# or key pool (comma-separated) for rotation
GROQ_API_KEYS=key1,key2,key3

# optional model override
GROQ_MODEL=llama-3.1-8b-instant
```

---

*Built for FIFA World Cup 2026 — Covering USA 🇺🇸 · Mexico 🇲🇽 · Canada 🇨🇦*
