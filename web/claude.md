# Spring Couplet Generator (春联生成器)

## Project Overview
A Next.js web app that generates personalized Spring Festival couplets (对联) with a user's name hidden in the text (acrostic/middle/end). Uses DeepSeek API for AI generation. Traditional calligraphy-style UI with red and gold theme.

## Tech Stack
- **Framework**: Next.js 16 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS 4
- **AI**: DeepSeek API (OpenAI-compatible format, model: `deepseek-chat`)
- **Image Export**: Canvas 2D API (not html2canvas — Tailwind v4's `lab()`/`oklch()` colors are incompatible with html2canvas)
- **Package Manager**: npm

## Project Structure
```
src/
  app/
    layout.tsx              # Root layout, zh-CN lang, viewport meta, suppressHydrationWarning
    page.tsx                # Main client page, wires all components together
    globals.css             # Tailwind import only
    api/generate/route.ts   # POST endpoint proxying to DeepSeek API
  components/
    CoupletForm.tsx         # Name input (1-4 chars) + position selector (藏头/藏中/藏尾)
    CoupletDisplay.tsx      # Traditional vertical red-banner display (CSS writing-mode)
    CoupletHistory.tsx      # History list from localStorage
    ShareButton.tsx         # Canvas 2D rendering + download/native share
  lib/
    types.ts                # TypeScript interfaces (Couplet, HistoryEntry, HidePosition, GenerateRequest)
    prompts.ts              # System/user prompt templates for DeepSeek
    history.ts              # localStorage CRUD helpers (max 50 entries)
```

## Key Design Decisions
- **Canvas 2D for image export**: html2canvas cannot parse Tailwind CSS v4's `lab()` color functions. ShareButton draws couplets directly onto a canvas with hex colors instead.
- **suppressHydrationWarning**: Added to `<html>` and `<body>` in layout.tsx to suppress warnings caused by browser extensions (e.g., Grammarly) injecting attributes.
- **No forwardRef on CoupletDisplay**: ShareButton receives the `Couplet` data object directly, not a DOM ref.
- **Non-streaming API**: The DeepSeek API route uses non-streaming completion for simplicity. Response is parsed as JSON (with fallback for markdown code block wrapping).

## Environment Variables
```
DEEPSEEK_API_KEY=sk-xxx   # Set in .env.local (dev) or Vercel dashboard (prod)
```

## Commands
- `npm run dev` — Start dev server
- `npm run build` — Production build
- `npm run start` — Start production server
- `npm run lint` — Run ESLint

## API Route: POST /api/generate
- **Request**: `{ name: string, position: "head" | "middle" | "tail" }`
- **Response**: `{ upper: string, lower: string, horizontal: string, position: string }`
- **Validation**: name must be 1-4 characters, position must be head/middle/tail
- **Endpoint**: `https://api.deepseek.com/v1/chat/completions`

## Theme Context
- 2026丙午马年 (Year of the Horse)
- Traditional Chinese New Year color palette: red (#CC0000, red-700, red-900), gold (#F6C445, amber-300/500), dark red (#7f1d1d)
- Calligraphy font stack: STKaiti, KaiTi, SimSun, Songti SC, serif
- Vertical text rendering via `writing-mode: vertical-rl`

## WeChat Compatibility
- Viewport meta configured for mobile webview
- No features that break in WeChat `<web-view>`
- Responsive layout tested for 375px+ widths
