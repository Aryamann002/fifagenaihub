# FanHub 26 — Context Handoff Document

> **Last Updated**: 2026-07-09T12:39:00+05:30
> **Status**: 🚧 Phase 1 — Foundation (In Progress)

## What This Project Is

**FanHub 26** is a GenAI-enabled web application for the FIFA World Cup 2026 that serves two audiences:
1. **Fans**: Multilingual AI chat concierge, interactive stadium maps, sustainability scoring
2. **Staff**: Crowd density intelligence dashboard, operational AI assistant, real-time alerts

It is built for a hackathon/assessment where an **AI evaluator** scores on six criteria:
- Code Quality, Security, Efficiency, Testing, Accessibility, Problem Statement Alignment

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript (strict mode) |
| Styling | Vanilla CSS with CSS Modules |
| Testing | Jest + React Testing Library + jest-axe |
| GenAI | Mock provider (no API key needed) with pluggable interface |

## Architecture

- `src/app/` — Pages and API routes (Next.js App Router)
- `src/components/` — React components (co-located CSS modules + tests)
- `src/lib/genai/` — GenAI provider interface, mock engine, sanitizer
- `src/lib/security/` — Rate limiter, input validator, security headers
- `src/lib/data/` — Stadium, match, sustainability, and crowd simulation data
- `src/hooks/` — Custom React hooks (useChat, useDebounce, useAccessibility)
- `src/types/` — Shared TypeScript interfaces
- `middleware.ts` — Security headers + rate limiting middleware

## Key Design Decisions

1. **Mock GenAI by default**: The app works out of the box with `GENAI_PROVIDER=mock`. A real LLM can be swapped in by changing `.env`.
2. **CSS Modules over Tailwind**: Maximizes code quality score — demonstrates CSS mastery, avoids utility class bloat.
3. **Dark-mode-first**: Deep navy + glassmorphism aesthetic with electric cyan and gold accents.
4. **Semantic HTML everywhere**: Native elements preferred over ARIA. Skip-nav, landmarks, live regions all implemented.
5. **Defense-in-depth security**: Rate limiting, input validation, prompt injection prevention, CSP headers, DOMPurify sanitization.

## Current Progress

### ✅ Completed
- Implementation plan approved
- Task tracker created
- Project scaffolding initiated

### 🚧 In Progress
- Phase 1: Foundation setup

### ⬜ Not Started
- Phase 2-10 (see task.md for full checklist)

## How to Continue Building

1. Check `task.md` in the artifacts directory for the detailed checklist
2. Check `implementation_plan.md` for the full architecture and file listing
3. Run `npm run dev` to start the dev server
4. Run `npm test` to run tests
5. Run `npm run lint` to check code quality

## Important Files to Know About

- `.env.example` — All environment variables documented
- `src/lib/genai/provider.ts` — The GenAI abstraction layer (start here to add a real LLM)
- `src/lib/genai/mock-provider.ts` — The mock engine that makes the app work without API keys
- `middleware.ts` — Security middleware (rate limiting + headers)
- `src/app/globals.css` — The entire design system (CSS custom properties)

## Assessment Scoring Strategy

| Criterion | Strategy |
|---|---|
| Code Quality | Strict TS, ESLint zero-error, JSDoc, <300 LOC/file, SRP |
| Security | Rate limiting, sanitization, CSP, no leaked errors, prompt injection prevention |
| Efficiency | SSR, React.memo, debounced inputs, lazy loading, skeleton states |
| Testing | 75%+ coverage, jest-axe a11y tests, integration tests for API routes |
| Accessibility | WCAG 2.1 AA, skip-nav, ARIA live regions, keyboard-nav, high-contrast mode |
| Problem Alignment | 6/8 FIFA domains: navigation, crowd mgmt, accessibility, sustainability, multilingual, ops intelligence |
