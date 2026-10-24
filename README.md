# MannSetu

A personal wellbeing care navigator for adults in India: notice changes from your usual, explore fitting support, and prepare a first-session brief. This hackathon MVP is not a diagnostic tool. Personal data belongs in browser memory; API requests are stateless. The fictional Ananya demo is labelled throughout.

## Setup

1. Install Node.js 20 or newer and run `npm ci`.
2. Copy `.env.example` to `.env.local` and add service keys locally. Never commit `.env.local`.
3. Run `npm run dev`; use `npm test` and `npm run build` before pushing. `npm start` runs the built app on `PORT` or 3000 and works on Windows and Linux.
4. AI processing is disabled: check-in analysis, profile extraction, learning, suggestions, and briefs use inspectable rules/templates with `degraded: true`. No user content goes to an AI provider; an AI key is unnecessary. Google Places results are never persisted.
5. Deploy the main branch using `render.yaml`; set secrets in Render. Rebuild after changing public environment variables.

The owner has superseded the original plan: **no AI and no database service in this MVP**. Provider data comes from bundled JSON via `lib/directory.ts`. Provider applications return `{ok:false,degraded:true}` and are never uploaded. Person A owns implementing browser memory storage (including clearing data on refresh) and adjusting frontend consent copy to these decisions.

## Git workflow

`main` is the integration branch. Person A works on `a/experience`; Person B works on `b/intelligence`. Follow the root plan files for ownership. Shared types, brand, and package changes require agreement. Merge B's mocks first, then each developer merges `origin/main` into their own branch. Open integration PRs at T+20, T+45, T+85 and T+100; B merges first. Never force-push main.

For the laptop handoff, read `HANDOFF_PERSON_B.md` and both updated plan files. The completed intelligence work is on `b/intelligence`; integration into main is intentionally left to the receiving laptop. The owner approved removing the unused SDK dependencies and adding reproducible tests in this handoff branch.

## Demo and checks

`public/demo-user.json` contains 28 fictional check-ins across 30 days, including two silent days. Load it, call `replay`, and use the returned profile/model with its check-ins. The hero note should produce drift with `signalCount3d` first. Run `npm test` to verify this, exact quotes, keyless crisis detection, care routing, ranking, and route contracts. To regenerate history, run the app locally and then `python scripts/seed_demo_user.py` (Python packages: requests and tqdm).

Live Google results require the optional Places key; without it, the directory and an embed search query are returned with `degraded:true`. Do not persist Google result content in browser storage or on the server. The dataset's eight curated listings are fictional and must show their demo badge; their verification field is only a demonstration.
