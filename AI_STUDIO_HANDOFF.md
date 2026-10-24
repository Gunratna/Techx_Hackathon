# AI Studio handoff

Import `https://github.com/Gunratna/Techx_Hackathon`, branch **main**, into Google AI Studio Build mode using **Add files (+) → Import from GitHub**. Then paste the prompt below. GitHub import and deployment documentation: https://ai.google.dev/gemini-api/docs/aistudio-build-mode

## Prompt to paste

Continue the existing Next.js 15 App Router + TypeScript + Tailwind app in this imported repository. Do not rebuild it from scratch or change the visual direction. Read `HANDOFF_PERSON_B.md`, both updated root plan files, `lib/types.ts`, `lib/brand.ts`, and the current frontend before editing. This prompt authorizes a future AI enhancement to the existing rules-based MVP; it does not authorize replacing its safety rules or privacy model.

The product is MannSetu, a wellbeing care navigator for adults in India. It has consent and an 18+ gate, onboarding and editable personal signs, daily check-ins, exact-quote personal explanations, feedback, stepped Care Path, a fit-ranked provider finder, an editable/printable Session Bridge, and Insights. The name must always come from `lib/brand.ts`. Keep the warm off-white/teal, mobile-first design and the working deterministic engine.

Current runtime has NO AI provider and NO database. Personal state lives only in browser tab memory; client navigation preserves it and refresh clears it. Provider data comes from bundled JSON. All own API calls go through `lib/api-client.ts`. Preserve the eight API request/response contracts and the seven public engine exports. Do not add accounts, persistence, analytics, note logging, automatic sharing, booking, or payments. Provider applications remain disabled.

Add optional Gemini assistance, behind explicit user opt-in, to improve language understanding of check-ins and polish the first-session brief/call script. First show the exact planned files and consent change, then implement. Keep the existing deterministic rules/templates as the default and as the fallback for missing keys, timeouts, invalid output or provider failure. Do not hard-code an obsolete model name: choose an available stable model supported by this environment and make it configurable.

Every Gemini request must run on the server using a server-only secret such as `GEMINI_API_KEY`. Never place secrets in client code, public environment variables, source control, URLs, or logs. Use bounded request sizes, timeouts and zod validation on every generated structure. Update consent to name the external provider, say exactly which text leaves the app and why, and require a separate opt-in before sending anything. Never transmit trusted-person contact details or precise location to Gemini. AI remains optional and the full app must still work without it.

Safety is non-negotiable: keep immediate client-side `keywordSafety`, server-side keyword detection, the hard-coded crisis panel and its header button on every page. Final safety is the maximum of deterministic and generated safety. AI, feedback and learned weights can only escalate safety, never switch urgent help off. Preserve the existing crisis numbers/text unchanged. Never generate therapy, medication advice, clinical labels, or diagnostic conclusions. Avoid the banned UI/generated terms listed in the plans.

Evidence must be exact substrings from the user's submitted notes. Check each quote against its source and date; discard invented or paraphrased evidence. Keep care routing and provider ranking deterministic. Never invent clinicians, credentials, fees, availability, insurance coverage or verification. Keep fictional directory entries visibly marked Demo listing, including when their mock credential field says verified. Google results remain transient view state, never persisted; location goes to Google only on an explicit search. Attribution appears only alongside Google content.

Session Bridge must stay user-editable. Nothing is sent to a provider automatically. Copy and print are explicit user actions. Preserve the one-page A4 print view and the English/Hindi/Tamil template fallback. Ask a native speaker to review non-English phrases; do not claim clinical or language validation.

Before publishing, run `npm ci`, `npm test`, `npm run lint`, `npm run build`, then test the complete flow at 375px: age/consent, fictional demo replay exactly once from the original fixture, hero check-in `Skipped dinner again, stayed up till 3, didn't reply to Riya. Work was fine.`, quoted reasons, fine/struggling feedback, Care Path, keyless provider directory, preference reranking, editable bridge, call-script copy, print, crisis panel even with an API outage, reset and refresh clearing memory. The positive comparison note is `Went for a run, dinner with Riya, slept 8 hours`. Keep all existing engine and API tests.

Prepare deployment in AI Studio/Cloud Run using the full server runtime, not static hosting: this app has POST API routes. Keep `npm start` reading the platform's `PORT`. If Next.js is unsupported by the selected runtime, explain the constraint before proposing a migration; do not silently discard routes, types, tests, memory ownership or the deterministic engine. Configure only server-side secrets and optional Maps keys. Check the deployed health and demo flow, and report the actual public URL, model/configuration used, validation results and remaining limitations. Sync the final source back to this repository without force-pushing.

## Current limitations to retain honestly

- Limited phrase rules/templates, not broad language understanding or a clinical assessment.
- Bundled curated providers are fictional. Live Maps requires optional keys.
- Browser memory deliberately disappears on full refresh.
- Provider applications, accounts, persistence and booking are intentionally absent.
- Voice input can remain deferred; typing is the complete fallback.
- A public URL exists only after a hosting deployment is actually completed and verified.
