# MannSetu

A personal wellbeing care navigator for adults in India: notice changes from your usual, explore fitting support, and prepare a first-session brief. This hackathon MVP is not a diagnostic tool. Personal data stays in browser storage; API requests are stateless. The fictional Ananya demo is labelled throughout.

## Setup

1. Install Node.js 20 or newer and run `npm ci` after the Next.js scaffold is merged.
2. Copy `.env.example` to `.env.local` and add service keys locally. Never commit `.env.local`.
3. Run `npm run dev`; use `npm run build` before pushing.
4. AI processing is disabled: check-in analysis, profile extraction, learning, suggestions, and briefs use inspectable rules/templates with `degraded: true`. No user content goes to an AI provider; an AI key is unnecessary. Google Places results are never persisted.
5. Deploy the main branch using `render.yaml`; set secrets in Render. Rebuild after changing public environment variables.

## Git workflow

`main` is the integration branch. Person A works on `a/experience`; Person B works on `b/intelligence`. Follow the root plan files for ownership. Shared types, brand, and package changes require agreement. Merge B's mocks first, then each developer merges `origin/main` into their own branch. Open integration PRs at T+20, T+45, T+85 and T+100; B merges first. Never force-push main.
