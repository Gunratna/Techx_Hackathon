# Laptop handoff: complete intelligence MVP

## Owner decisions that override the original plan

- No AI service, AI key, or AI SDK. AI features are a future proposal only.
- No database service. Provider data is bundled JSON; personal state must live in browser memory and clear on reload.
- Keep every API stateless, never log notes, never persist Google results, and keep keyword safety independent of learned weights and network availability.
- Finish on `b/intelligence` here. The receiving laptop integrates both branches and continues on `main`. No merge is performed by this finishing session.
- The owner approved the shared dependency cleanup and test scripts included in this handoff branch. Shared types and brand remain unchanged.

## Completed on b/intelligence

- All seven engine exports: baseline features, logistic scoring, bounded feedback updates, signal merging, exact-quote explanations, historical replay, stepped care routing, and fit ranking. The engine is pure TypeScript with no I/O.
- All eight POST API routes with zod validation, safe HTTP 200 failure responses, and no-store headers. Analysis/profile/learn/bridge/suggest are deliberately limited local rules/templates and report `degraded:true`.
- Keyword crisis detection works without any key, including malformed request shapes that still contain string notes.
- Session Bridge uses exact dated quotes and editable English/Hindi/Tamil call templates, with no diagnostic wording introduced.
- Eleven directory entries: three national/public entries and eight clearly fictional curated listings. Ten resource cards. Google Places normalization, deduplication, distance filtering, credential honesty, and directory fallback are implemented.
- Provider applications intentionally return `{ok:false,degraded:true}` and never submit contact details.
- `public/demo-user.json`: 28 fictional check-ins spanning 30 calendar days, two silent days, two hard stretches, and precursor behaviours. Generated through the running local analyzer, not hand-filled features. `scripts/seed_demo_user.py` reproduces it using India-local dates.
- Both root plan files updated. Their Parts 1–4 match and Part 3 still matches `lib/types.ts` verbatim.
- Unused external-service SDKs removed, Windows/Linux-compatible `npm start`, pinned test runner, and PostCSS patch override while retaining Next.js 15.5.28.

## Verification on this laptop

- `npm test`: engine and all eight API contract tests pass, including malformed requests, zero external requests without keys, keyless crisis detection, evidence substrings, feedback, care levels, provider ranking, and mocked Places success/outage behavior.
- Fictional demo replay passed under 100 ms (27–38 ms in observed runs). The hero check-in produces `drift` with `signalCount3d` as the top explanation. Positive-day and future-data-isolation checks pass.
- Final `npm run build` and `npm run lint` passed. `npm start` works on Windows. Actual production HTTP checks passed for the 28-check-in demo, 11-provider directory, exact evidence, keyless crisis detection, and all eight malformed-input fallback responses.
- `npm audit` reported zero vulnerabilities after the compatible PostCSS patch override.
- Only `.env.example` is tracked; no real credentials or private notes were added.

Live Places and deployment were not tested with real keys. No frontend integration is claimed: at the last inspection, remote `a/experience` contained the scaffold and B's initial mocks but no pushed frontend pages/store/client yet. Ask the teammate to commit and push any remaining local UI work before integration.

## Receiving-laptop workflow

1. Read this file and both updated root plan files. Inspect `git status` first; preserve any existing local work. Fetch origin. Ensure the teammate has pushed all frontend changes.
2. Integrate `origin/b/intelligence` into `main` first, then `origin/a/experience`, or merge PR #1 followed by the frontend PR. Never force-push. Resolve UI/store/speech/api-client conflicts in favour of A and engine/API/data conflicts in favour of B. Preserve the revised no-AI/no-database plans and package cleanup.
3. Run `npm ci`, `npm test`, `npm run lint`, `npm run build`, and `npm run dev`. Continue implementation directly on main as the owner requested.
4. Complete/verify A's memory store: no localStorage, sessionStorage, IndexedDB, or cookies for personal data; keep state during client navigation and clear it on full refresh. Update consent to say notes are processed transiently by the app's own deterministic API, with no AI provider. Location reaches Google only when the user opts into place search.
5. Wire `lib/api-client.ts` to the stable route shapes and `MOCK_RESPONSES` exports. In the client-side analyzer network fallback, run `keywordSafety` and drop mock quotes absent from the submitted notes. Treat `degraded:true` as expected rules/template mode, not a blocking error. Do not silently replace personalized output with mock Ananya content when a valid deterministic response exists.
6. Load `/demo-user.json`, call `replay`, and save the returned model/profile alongside the original check-ins in memory. Then check the hero note, positive note, crisis note, feedback, care path, finder, and editable/printable bridge. Do not replay an already-trained state repeatedly, which would apply feedback again.
7. `carePath` uses serializable `shortSleepNightsLast7` metadata on the evaluated result to honor the five-short-nights rule without changing the fixed public function signature. Pass the complete result object, not a hand-picked subset.
8. Show `isDemoListing` prominently, even when `credential` is `verified`; those are fictional demonstrations, not verified real clinicians. Show Google attribution only when Google content or an embed is visible; keep live result content only in transient view state. Do not show provider-application success because submission is deferred.
9. Optional live Maps check: configure `GOOGLE_MAPS_API_KEY` and optionally `NEXT_PUBLIC_MAPS_EMBED_KEY` in local env/Render, never Git. With no keys the directory remains usable. Test actual venue results only if keys are available.
10. Run the full flow at mobile width, repeat tests/build, push main, and verify the Render deployment. No AI/database account setup is needed. Ask a native Hindi/Tamil speaker to review the fixed call templates and safety phrases before presenting.

## Useful commands

```sh
git fetch origin
git switch main
git pull --ff-only origin main
git merge origin/b/intelligence
git merge origin/a/experience
npm ci
npm test
npm run lint
npm run build
npm run dev
```

Only run those Git commands after checking and preserving local changes. Start the app before optionally regenerating the demo with `python scripts/seed_demo_user.py` (requires `requests` and `tqdm`). The committed demo is ready to use without regeneration.

PR: https://github.com/Gunratna/Techx_Hackathon/pull/1
