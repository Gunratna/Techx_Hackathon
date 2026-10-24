# MannSetu: Build Plan for PERSON B (Intelligence / APIs / Data)

> Date written: 24 Oct 2026 (IST). Event: 2-hour "vibethon" (AI-assisted hackathon), Mental Health track. Team of 2.
> Repo: https://github.com/Gunratna/Techx_Hackathon. **Your branch: `b/intelligence`**. Partner's branch: `a/experience`.
> This document is self-contained. If you are a coding agent (Codex etc.), you have NO other context: everything you need is here.
> Your partner (Person A) has a twin document with the same Parts 1–4 and different Part 5 tasks. Parts 1–4 are identical in both docs; Part 5 is yours alone.
> Laptop handoff: finish intelligence on `b/intelligence`, then integrate both branches into `main` on the receiving laptop. Do not merge from this session. Shared dependency cleanup was approved for this handoff branch. Read `HANDOFF_PERSON_B.md`.
> Scope updated 24 Oct 2026 by the owner: no AI service and no database service in this MVP. Use deterministic rules/templates, browser memory for personal state, and bundled JSON for providers. AI assistance is a future proposal only.
> Working name "MannSetu" is a placeholder. The app name lives ONLY in `lib/brand.ts` so it can be renamed in one line (name options in §1.8).

---

# PART 1 — PRODUCT CONTEXT (identical in both docs)

## 1.1 What we are building
**MannSetu is a personal mental-health care navigator for adults in India.** "Setu" = bridge: the bridge between *noticing you're drifting* and *reaching the right human help, prepared*.

It is **NOT** a journal app, a chatbot, a therapist, or a diagnostic tool. It never gives therapy and never judges or labels the user.

The flow, in five steps:
1. **Notice**: a 30-second daily check-in ("one good thing / one hard thing", typed or spoken). A **personal pattern-detection pipeline** (not a trained ML model) learns *this user's* baseline and warning signs. Over time it can flag "this looks different from your usual" even when the user doesn't say they feel bad.
2. **Suggest**: small, vetted first steps, always starting with the user's *own* coping actions.
3. **Route**: a **stepped-care router** recommends the lowest sufficient level of help: self-care → trusted person → free helpline (Tele-MANAS 14416) → counsellor/psychologist → psychiatrist/hospital → emergency.
4. **Connect**: finds nearby and online help (live **Google Maps/Places** results + national services + curated providers), ranked by **fit** (language, budget, online/in-person, provider gender, distance), with a "Why this match" explanation and **credential transparency**.
5. **Bridge**: generates a **Session Bridge**. This is a one-page brief the user edits and approves (built from their own check-ins) plus a "what to say when you call" script, so the first appointment actually happens and goes well. Nothing is ever sent automatically.

**One-line pitch:** "Most Indians who need mental-health care never reach it, and many who do drop out after the first visit. MannSetu notices your personal warning signs early and walks you all the way to the right human, prepared."

## 1.2 Why (evidence for the pitch)
- India's mental-health treatment gap is ~84.5% (National Mental Health Survey 2015-16). There are ~0.75 psychiatrists per 1 lakh people vs the WHO norm of 3.
- Tele-MANAS, the free government helpline 14416, crossed 47.75 lakh calls by Oct 2026. A free entry point exists; onward routing is the gap.
- First-visit dropout: in a Rohtak (Haryana) tertiary-care study, 53 of 139 patients dropped out after the first visit. Patients referred to a clinical psychologist at the first visit were ~8× less likely to drop out (PMC5709873). Meta-analytic therapy dropout averages ~20%, and poor therapist fit is a major reason.
- Insurance rarely covers outpatient mental health: only 23 of 268 policies reviewed covered OPD (CMHLP). Cost-aware routing matters.
- Google Maps lists "psychologists" with no credential check. In India "Clinical Psychologist" is a protected title requiring Rehabilitation Council of India (RCI) registration (searchable at rehabcouncil.nic.in). Psychiatrists are registered with NMC (nmc.org.in).

## 1.3 USPs (what's new vs what exists)
| Feature | What exists | Our twist | MVP? |
|---|---|---|---|
| Personal Drift Signature | Mood charts vs generic norms (Wysa, Amaha, trackers) | Learns *your* baseline and warning signs *in your words*. Every flag is explained with your own past quotes. You can see, edit and delete what it learned. | ✅ |
| Stepped-care router | Apps push their own therapists | Lowest sufficient level first, always offers one level up, free/public options first, never diagnostic | ✅ |
| Fit-first finder | Directories / Google Maps lists | Merges Google + national + curated. Ranks by fit with "Why this match" and "Confirm by phone" unknowns, plus a credential badge with RCI/NMC links | ✅ |
| Session Bridge | Clinician-side scribes | Patient-side, user-approved first-session brief plus a call script in the user's language | ✅ |
| Cost & coverage clarity | Scattered | Fee ranges, free options, MHCA s.21(4) insurance-parity note | ✅ (static) |
| Post-session fit check ("switch, don't quit") | Rare | 3 questions after a session; a poor fit leads to switching therapists | Future |
| Discreet mode, trusted-person nudge, insurance helper | Rare | — | Future |

## 1.4 Demo hero sequence (what judges must see)
1. Load the fictional demo user "Ananya" (30 days of history). Type a check-in with **no negative words**: "Skipped dinner again, stayed up till 3, didn't reply to Riya. Work was fine." The app shows **"Different from your usual"** with 2–3 reasons quoting her own past entries.
2. Tap **[I'm struggling]** → **Care Path**: "This has been different from your usual on 4 of the last 7 days → talking to a counsellor could help." Tele-MANAS (free) is shown alongside paid options.
3. **Find Help**: real Google Maps results near the venue, ranked by her language/budget/mode, with "Why this match" chips, "Confirm by phone: fee, language" and "⚠ Credentials not verified, check RCI".
4. **[Prepare for this]** → **Session Bridge**: a one-page brief in her own words plus a Tamil call script → edit a line → Print.
5. Type a crisis phrase → the hard-coded crisis panel appears instantly ("the learning engine can never switch this off").

## 1.5 Non-negotiable rules (both people enforce)
| Rule | How |
|---|---|
| 18+ only | Age gate. Under 18 → exit screen showing Tele-MANAS 14416. |
| Consent first | Consent screen covers: personal state stays in this browser tab memory and clears on reload; notes are processed transiently by our own stateless API using deterministic rules, with no AI provider; location is sent to Google for place search; not a diagnosis; not a crisis service. |
| No judgement, no diagnosis | Banned in UI copy and generated output: depressed, depression, disorder, diagnosis, risk score, suicidal, "you need". Use: "different from your usual", "might help", "options that fit you". |
| Crisis always reachable | A "Need help now?" button in the header on every page. Crisis state = deterministic keyword matching. Learned weights and feedback can never disable an urgent keyword match. Crisis text is hard-coded, never generated. |
| Explain every flag | Top 3 reasons, each with exact quotes from the user's own notes. |
| User owns the model | Learned signs are visible, editable and deletable. Every flag gets [I'm struggling] / [I'm fine] feedback. |
| Nothing auto-sent | Session Bridge, call scripts and trusted-person suggestions only work through user copy/print/tap. |
| Fit, not pay-to-rank | Ranking is a deterministic fit score. No paid placement, ever. |
| Credential honesty | Google results get the "Credentials not verified" badge plus RCI/NMC links. Fictional curated listings get the "Demo listing" badge. |
| Personal data stays on device | Profile, check-ins and model weights live in browser memory only, with no persistence across reloads. API routes are stateless and log no content. A "Delete all my data" button exists. The provider directory is bundled JSON; no database service is used. |
| Google data rules | Don't persist Google place content (only place IDs may be stored). Show "Results from Google Maps" attribution. |
| Synthetic demo data | "Ananya" is fictional and labelled as such. |

**Crisis panel (hard-coded; verify numbers on the day):** Tele-MANAS **14416** or **1-800-891-4416** (free, 24×7, 20 languages) · Emergency **112** · Text: "If you might act on thoughts of harming yourself, call now or go to the nearest hospital emergency department." · Button "Nearest hospital emergency" → `https://www.google.com/maps/search/hospital+emergency+near+me`.

## 1.6 Business model (for the pitch)
How others earn: Amaha earns from B2C therapy/psychiatry payments, an app subscription and inpatient care; B2B employee programmes are ≈20% of its revenue. YourDOST offers free text support, paid voice/video sessions, and contracts with colleges and corporates. EAP vendors sell per-employee programmes to HR.
**Ours: free for individuals; institutions and providers pay; never pay-to-rank, never sell data, no ads.**
1. Colleges/coaching institutes (primary): the Supreme Court's Sukdeb Saha guidelines (25 Jul 2025) require counsellors or formal referral linkages, and MannSetu can be that referral and early-notice layer. Proposed per-student annual licence plus an aggregate-only (k≥20) dashboard.
2. Employers/EAP add-on: per employee per month.
3. Verified Provider plan: therapists/clinics pay a subscription to get an RCI/NMC-verified badge (earned by verification, not by payment), richer fit fields, and to receive user-approved Session Bridges.
4. Minor: individual premium (extended history, caregiver mode).
All prices are hypotheses to validate.

## 1.7 Future improvements (NOT in MVP; mention in pitch only)
Post-session fit check; real provider onboarding with RCI/NMC verification; booking and payments; Indian-language speech (Sarvam/Bhashini) and full localisation; WhatsApp check-ins; opt-in passive signals (sleep/screen-time/wearables); user-sent trusted-person nudges; caregiver mode; insurance-denial helper; institution dashboards; accounts plus encrypted opt-in cloud sync; DPDP consent-manager integration (DPDP obligations fully apply from 13 May 2027); clinical advisory board and an Indian validation study; offline PWA; discreet mode.

## 1.8 Name options (pick one; change `lib/brand.ts` only)
| Name | Meaning | Note |
|---|---|---|
| **MannSetu** | "mind-bridge" | Placeholder; describes the product exactly |
| **Pehel** | "first step / initiative" | Strong fit with the first-session focus |
| **Kinaara** | "shore" | Reaching safe ground; calm brand |
| **Raasta** | "the way" | Simple, navigational |
| **Thaam** | from *thaamna*, "to hold" | Warm, short |
| **Saathi Path** | "companion's path" | Friendly; "Saathi" is very common |
| **Dhaaga** | "thread" that connects | Distinctive |
| **Sahaara** | "support" | Very common, likely taken |
Check domain, Play Store and trademark collisions before committing. Avoid names close to "Tele-MANAS" to prevent confusion with the government service.

---

# PART 2 — TECH, REPO, GIT, DEPLOYMENT (identical in both docs)

## 2.1 Stack (fixed; don't debate during the event)
- **Next.js 15 (App Router) + TypeScript + Tailwind**, one app (frontend + API routes).
- `zod` (validate API inputs/outputs), `recharts` (charts). No AI or database SDK is required.
- **Analysis:** inspectable TypeScript phrase rules, keyword safety, and local templates. No model-provider requests, prompts, or keys. Future AI features require a separate product/consent decision.
- **Places:** Google **Places API (New) Text Search** called from a server route. Fallbacks: Maps Embed iframe → curated list.
- **Voice:** browser Web Speech API (`en-IN`, `hi-IN`, `ta-IN`); demo in Chrome; typing is the fallback.
- **User data:** browser memory only, owned by Person A. **Provider data:** `data/providers.json`, read through `lib/directory.ts`. No database, schema, remote writes, or provider application storage.
- **Deploy:** Render Web Service (Node) from the `main` branch.
- **Seed script:** Python 3 + `requests` + `tqdm`.

## 2.2 Environment variables (`.env.example` committed; real values never committed)
```
GOOGLE_MAPS_API_KEY=          # server only; restrict to Places API (New)
NEXT_PUBLIC_MAPS_EMBED_KEY=   # browser; restrict to Maps Embed API + HTTP referrers (localhost, *.onrender.com)
```
Google keys need a Google Cloud project with billing enabled. Since March 2025 each SKU has its own free monthly cap (e.g. Text Search Pro 5,000/month, then ~$32 per 1,000), which is plenty for a demo. Requesting phone/website/rating fields bills at a pricier tier with a smaller free cap; fine for a demo. **Create the keys and test one call BEFORE the event.**

## 2.3 Repo layout and file ownership
```
Techx_Hackathon/
├─ docs/PLAN_PERSON_A_EXPERIENCE.md, docs/PLAN_PERSON_B_INTELLIGENCE.md
├─ .env.example  render.yaml  README.md            # setup (T0, on main)
├─ lib/
│  ├─ types.ts   brand.ts                          # SHARED (T0, on main; change only by agreement)
│  ├─ store.ts   speech.ts   api-client.ts         # A
│  ├─ mock.ts    safety.ts   directory.ts   # B
│  └─ engine/ index.ts features.ts model.ts nudge.ts care-router.ts fit.ts   # B (A imports from engine/index.ts only)
├─ app/
│  ├─ layout.tsx page.tsx onboarding/ checkin/ care-path/ find-help/ bridge/ insights/ providers/join/   # A
│  └─ api/ build-profile/ analyze-checkin/ learn/ places/ providers/ session-bridge/ suggest/ provider-apply/   # B
├─ components/                                      # A
├─ data/ providers.json  resources.json            # B
├─ public/demo-user.json                           # B (seed output)
└─ scripts/seed_demo_user.py                       # B
```

## 2.4 Git workflow (one `main` + two personal branches)
- `main`: always runnable and deployable; **Render auto-deploys from `main`**.
- `a/experience`: Person A's branch. `b/intelligence`: Person B's branch.
- **Golden rule:** edit only files you own (§2.3). Shared files (`lib/types.ts`, `lib/brand.ts`, `package.json`) change only after a 30-second chat, and are committed directly to `main`.
- **T+0–5 (Person A, on main):**
  ```bash
  git clone https://github.com/Gunratna/Techx_Hackathon.git && cd Techx_Hackathon
  git rm README.md && git commit -m "remove placeholder readme"     # create-next-app refuses non-empty dirs with conflicting files
  npx create-next-app@latest . --ts --tailwind --app --eslint --src-dir=false --import-alias "@/*" --use-npm
  npm i zod recharts
  # edit package.json: "start": "next start" (Next reads PORT automatically; Windows/Linux compatible)
  git add -A && git commit -m "scaffold next app" && git push origin main
  ```
- **T+5–10 (Person B, on main):** pull; add `lib/types.ts` (exactly §3), `lib/brand.ts`, `.env.example`, `render.yaml`, README, `docs/` (both plan files); push to `main`.
- **T+10 both:** `git checkout -b a/experience` (A) / `git checkout -b b/intelligence` (B); push with `-u`.
- **T+20 (B):** open PR `b/intelligence → main` containing mocks + stub routes + stub engine; merge immediately. A runs `git fetch && git merge origin/main` to get the mocks.
- **Checkpoints T+45, T+85, T+100:** each person opens a PR into `main`. B merges first, A merges second; after each merge the other person runs `git merge origin/main` into their branch. Resolve conflicts in favour of the file's owner.
- Never force-push to `main`. Never commit `.env.local`.
- Commit small and often: `feat(checkin): ...`, `fix(engine): ...`.

## 2.5 Render deployment (showcase)
`render.yaml` (Blueprint) at the repo root:
```yaml
services:
  - type: web
    name: mannsetu
    runtime: node
    plan: free
    branch: main
    buildCommand: npm ci && npm run build
    startCommand: npm run start
    autoDeploy: true
    envVars:
      - key: NODE_VERSION
        value: "20"
      - key: GOOGLE_MAPS_API_KEY
        sync: false
      - key: NEXT_PUBLIC_MAPS_EMBED_KEY
        sync: false
```
Steps: Render dashboard → New → Blueprint → connect the repo → fill the env vars → deploy. Add the `*.onrender.com` URL to the Maps Embed key's HTTP-referrer restriction. `NEXT_PUBLIC_*` vars are baked in at build time, so redeploy after changing them. Free instances sleep when idle: **open the URL 5 minutes before the demo**. Keep `npm run dev` on a laptop as a backup.

## 2.6 Browser memory and bundled directory
Person A implements `lib/store.ts` with an in-memory state object, defensive copies, and explicit reset. Do not use browser persistence, cookies, IndexedDB, accounts, or a remote database. Reloading the page clears personal state; say this clearly in consent copy. The fictional demo can be reloaded from `public/demo-user.json`.

Person B implements `lib/directory.ts` to filter `data/providers.json` by care level and city, always preserving national services. All API requests are stateless, responses use `Cache-Control: no-store`, and user content is never logged. The provider application endpoint validates its input and returns `{ok:false,degraded:true}`; it does not submit or save contact details.

---

# PART 3 — SHARED CONTRACT `lib/types.ts` (identical in both docs; committed to main at T+10)

```ts
export type DayLabel = "good" | "okay" | "bad";
export type Safety = "none" | "concern" | "urgent";
export type DriftState = "learning" | "steady" | "drift" | "crisis"; // UI: Learning / As usual / Different from usual / Need help now

export const THEMES = ["work","study","family","friends","relationship","sleep","food",
  "health","money","self_worth","loneliness","achievement","rest"] as const;
export type Theme = typeof THEMES[number];

export interface Evidence { feature: string; quote: string }   // quote MUST be an exact substring of the note

export interface CheckinFeatures {
  valence: number; energy: number; social: number;             // each -1..1; social 0 if people not mentioned
  sleepHours: number | null;
  themes: Theme[];
  matchedSignalIds: string[];
  safety: Safety;
  evidence: Evidence[];
}

export interface Checkin {
  id: string; date: string;                                     // YYYY-MM-DD; one per day, latest wins
  goodNote: string; hardNote: string;                           // either may be ""
  inputMode: "text" | "voice";
  userLabel: DayLabel | null;
  sleepHoursInput: number | null;
  features: CheckinFeatures | null;
  modelP: number | null;
  driftFeedback: "struggling" | "fine" | null;
}

export interface PersonalSignal { id: string; text: string; source: "survey" | "learned"; count: number; active: boolean }

export interface Preferences {
  languages: string[];
  budgetPerSession: number;                                     // INR max; 0 = free only
  mode: "online" | "in_person" | "either";
  providerGender: "any" | "female" | "male";
  readiness: "tips_first" | "talk_to_someone" | "see_professional";
  city: string;
  location: { lat: number; lng: number } | null;
}

export interface Profile {
  name: string; who5Raw: number;                                // WHO-5 sum 0..25 (never shown as a score)
  badDayDescription: string; helpfulActions: string[];
  trustedPerson: { name: string; relation: string; phone?: string } | null;
  signals: PersonalSignal[];
  prefs: Preferences;
  createdAt: string;
}

export type FeatureKey = "valenceDrop" | "energyDrop" | "socialDrop" | "lowSleep"
  | "signalCount3d" | "gapDays" | "badThemeLoad";
export interface UserModel { weights: Record<FeatureKey | "bias", number>; nLabels: number; updatedAt: string }
export interface Explanation { feature: FeatureKey; contribution: number; message: string; quotes: string[] }
export interface EngineResult { p: number; state: DriftState; driftDaysLast7: number; explanations: Explanation[] }

export type CareLevel = 0 | 1 | 2 | 3 | 4 | 5;
// 0 self-care · 1 trusted person · 2 free helpline · 3 counsellor/psychologist · 4 psychiatrist/hospital OPD · 5 emergency
export const CARE_LEVEL_LABELS: Record<CareLevel, string> = {
  0: "Small steps for today", 1: "Reach out to someone you trust", 2: "Talk to a free helpline",
  3: "Talk to a counsellor or psychologist", 4: "See a psychiatrist or hospital clinic", 5: "Get help right now" };
export interface CarePath { recommended: CareLevel; alsoOffer: CareLevel[]; reasons: string[] }

export type ProviderKind = "helpline" | "counsellor" | "psychologist" | "psychiatrist" | "hospital" | "emergency";
export interface Provider {
  id: string; source: "google" | "national" | "curated";
  name: string; kind: ProviderKind; careLevels: CareLevel[];
  address?: string; city?: string; lat?: number; lng?: number; distanceKm?: number;
  phone?: string; website?: string; mapsUrl?: string; rating?: number;
  languages?: string[]; modes?: ("phone" | "online" | "in_person")[]; gender?: "female" | "male";
  feeMin?: number; feeMax?: number;
  credential: "verified" | "not_verified" | "public_service";
  isDemoListing: boolean;
}
export interface ProviderMatch { provider: Provider; score: number; reasons: string[]; unknowns: string[] }

export interface SessionBridge {
  inMyWords: string;
  whatsBeenHappening: { date: string; text: string; quote?: string }[];
  patternsINoticed: string[];
  whatHelps: string[]; whatHasntHelped: string[];
  whatIWantFromSupport: string;
  practical: { languages: string[]; budget: string; mode: string; availability: string };
  questionsToAsk: string[];
  callScript: string;
  generatedAt: string;
}

export interface ResourceCard { id: string; title: string; body: string; tags: string[]; kind: "self_help" | "info" }

export interface AppState { profile: Profile | null; model: UserModel | null; checkins: Checkin[]; consentAt: string | null }

export interface Degradable { degraded?: boolean }
```

`lib/brand.ts`:
```ts
export const BRAND = { name: "MannSetu", tagline: "Notice early. Reach the right help." };
```

---

# PART 4 — INTERFACES BETWEEN A AND B (identical in both docs)

## 4.1 HTTP API routes (B implements, A calls via `lib/api-client.ts`)
All are POST with JSON in and JSON out, stateless, and log no content. On any failure they return the mock response with `degraded: true` (HTTP 200) so the UI never breaks.

| Route | Request | Response |
|---|---|---|
| `/api/build-profile` | `{ name, who5: number[5], badDayDescription, earlySigns, helpfulActions: string, trustedPerson, prefs: Preferences }` | `{ profile: Profile, model: UserModel }` |
| `/api/analyze-checkin` | `{ goodNote, hardNote, sleepHoursInput, signals: PersonalSignal[] }` | `{ features: CheckinFeatures }` |
| `/api/learn` | `{ text, signals }` | `{ matchedExistingIds: string[], newCandidates: {id,text}[] }` (≤2) |
| `/api/places` | `{ level: CareLevel, location: {lat,lng}\|null, city, radiusKm }` | `{ providers: Provider[], embedQuery: string, attribution: string }` (Google + national + curated, merged, deduped, with distance) |
| `/api/providers` | `{ level?: CareLevel, city?: string }` | `{ providers: Provider[] }` (bundled JSON directory) |
| `/api/session-bridge` | `{ profile, checkins (≤30 days), inMyWords, whatIWantFromSupport, availability, language }` | `{ bridge: SessionBridge }` |
| `/api/suggest` | `{ explanations, themes, helpfulActions }` | `{ ownActions: string[], cards: {card: ResourceCard, framing: string}[] }` |
| `/api/provider-apply` (stretch) | provider application fields | `{ ok: boolean }` |

## 4.2 Engine functions (B implements pure TS in `lib/engine/*`; A imports ONLY from `@/lib/engine`)
```ts
export function defaultModel(): UserModel;
export function evaluateCheckin(state: AppState, checkin: Checkin): EngineResult;   // uses all prior check-ins in state
export function applyFeedback(model: UserModel, state: AppState, checkin: Checkin, y: 0 | 1): UserModel;
export function mergeLearnedSignals(profile: Profile, matchedIds: string[], candidates: {id:string;text:string}[]): Profile;
export function replay(state: AppState): { model: UserModel; profile: Profile; results: Record<string, EngineResult> }; // for "Load demo user"
export function carePath(result: EngineResult, profile: Profile): CarePath;
export function rankProviders(providers: Provider[], level: CareLevel, prefs: Preferences): ProviderMatch[];
```
**Mocks:** at T+20, B merges `lib/mock.ts` plus stub routes and a stub `lib/engine/index.ts` (stubs return plausible fixed data) into `main`, so A can build every screen against stable shapes.

## 4.3 Client save flow (A implements using B's functions)
```
1. features = await api.analyzeCheckin(...)               → checkin.features
2. result   = evaluateCheckin(state, checkin)             → checkin.modelP = result.p
3. if userLabel ∈ {good, bad}: model = applyFeedback(model, state, checkin, bad?1:0)
4. if userLabel == bad: r = await api.learn(text, signals); profile = mergeLearnedSignals(profile, r.matchedExistingIds, r.newCandidates)
5. persist (store.save) → render the state card
6. on [I'm struggling]: driftFeedback="struggling"; model = applyFeedback(..., 1); learn(...); go to /care-path
   on [I'm fine]:       driftFeedback="fine";       model = applyFeedback(..., 0)
```

---

# PART 5 — YOUR TASKS: PERSON B (Intelligence / APIs / Data)

**You own:** `lib/types.ts` + `lib/brand.ts` (initial commit; later changes by agreement), `lib/mock.ts`, `lib/safety.ts`, `lib/directory.ts`, `lib/engine/*`, `app/api/*`, `data/*`, `public/demo-user.json`, `scripts/*`, `.env.example`, `render.yaml`, README.
**You do NOT edit:** pages, components, `lib/store.ts`, `lib/speech.ts`, `lib/api-client.ts`.
**Priority:** unblock A first (mocks by T+20), then make the hero demo work end to end (engine + places + bridge).

## 5.1 T+5–10: commit to `main`
`lib/types.ts` (Part 3 exactly), `lib/brand.ts`, `.env.example` (§2.2), `render.yaml` (§2.5), README (one paragraph + setup steps + git workflow), `docs/` with both plan files. Push. Create branch `b/intelligence`.

## 5.2 T+10–20: mocks and stubs (merge to main by T+20)
- `lib/mock.ts`: realistic fixed objects for every route response in §4.1 (one `Profile` with 3 signals, `CheckinFeatures` with 2 evidence quotes, 6 `Provider`s covering all badges, one full `SessionBridge`, 3 suggestion cards).
- `app/api/*/route.ts`: each returns its mock (`export async function POST(req) { return Response.json(mock…) }`).
- `lib/engine/index.ts`: stub implementations with the exact signatures in §4.2 (e.g. `evaluateCheckin` returns state `"drift"` with 2 explanations).
- PR → main, merge, tell A.

## 5.3 Deterministic analysis, safety, and profile extraction
No AI calls are made. `lib/safety.ts` exports `keywordSafety(text)` and `maxSafety(a,b)`. Normalize case, curly apostrophes and whitespace. Urgent phrases: `kill myself, end my life, want to die, wanna die, suicide, suicidal, self harm, self-harm, cut myself, hurt myself, no reason to live, better off dead, marna hai, mar jaana, mar jaun, jeena nahi, khud ko khatam, saaga poren, saaganum, uyir vida`. Concern phrases: `hopeless, no point, can't go on, give up on everything, kuch matlab nahi`. Ask a native Hindi/Tamil speaker to sanity-check coverage. Safety can only escalate.

`/api/analyze-checkin` validates the request, then uses the inspectable phrase rules in `app/api/analyze-checkin/_local.ts`. Match supplied signals literally plus the documented meal, late-night and social-withdrawal phrase families. Extract sleep only from explicit hours or an explicit sleep/wake interval; manual sleep input wins. Unknown features remain neutral. Every evidence quote is an exact substring from one submitted note, max 15 words, at most four items. Return `degraded:true` to indicate the intentionally limited rule-based mode. Invalid input still checks any string notes for crisis keywords and returns a safe neutral fallback, HTTP 200. Never imply comprehensive language understanding.

`/api/build-profile` splits the user's own early-sign descriptions into at most six editable signals, preserving their words. Split helpful actions without inventing advice. Sum the five WHO-5 answers and build preferences/trusted-person fields verbatim. Initialize `defaultModel()` and multiply the matching weights by 1.3 for sleep/night/late, friend/reply/message/call/people, eat/food/meal/dinner, and tired/energy/bed respectively. Return `degraded:true`. Review/edit remains required in Person A's UI.

## 5.4 T+40–60: the pattern-detection engine (`lib/engine/*`, pure, no I/O)
**Default model** (`model.ts`): `bias -2.0, valenceDrop 1.0, energyDrop 0.6, socialDrop 0.8, lowSleep 0.8, signalCount3d 0.9, gapDays 0.5, badThemeLoad 0.4`.

**Features for check-in t** (`features.ts`), using only check-ins dated before t plus t itself:
- Baseline over the last 14 prior check-ins where `userLabel !== "bad"` and `features` exist. If fewer than 5, use all prior check-ins with features. If fewer than 3, use prior mean 0.2 and std 0.4. Compute mean/std of valence, energy, social. `std = max(std, 0.15)`.
- `valenceDrop = clip(max(0,(mean−v)/std), 0, 3)`; `energyDrop` and `socialDrop` are computed the same way (if social is 0 because not mentioned, socialDrop = 0).
- `lowSleep`: sleepHours null → 0; <5 → 1.5; <6 → 0.75; else 0.
- `signalCount3d`: number of distinct **active** signal ids in `matchedSignalIds` across check-ins within the last 3 calendar days (including t). Clip 0..3.
- `gapDays`: (date(t) − date(previous check-in)) in days − 1. Clip 0..3; 0 if first.
- `badThemeLoad`: 0.5 × count of themes ∩ {loneliness, self_worth, sleep, food}. Clip 0..3.

**Score:** `p = sigmoid(bias + Σ w_k·x_k)`.

**Learning** (`applyFeedback`): `p = score(x)`; for each k `w_k += 0.25·(y−p)·x_k`; `bias += 0.25·(y−p)`; clip w to [−1, 3] and bias to [−4, 1]; `nLabels += 1`; update `updatedAt`. Pure: return a new object.

**Explanations:** contributions `c_k = w_k·x_k`; take the top 3 with `c_k > 0.15`. Message templates (quotes = evidence quotes from the check-ins that triggered the feature; for signals, quotes from the past 3 days' matching check-ins):
- `signalCount3d`: "You've said {signal texts joined} tend to come before your harder weeks."
- `socialDrop`: "You're mentioning people less than you usually do."
- `valenceDrop`: "Your notes sound flatter than your usual."
- `energyDrop`: "Your notes sound more drained than usual."
- `lowSleep`: "Short sleep recently ({h} hours)."
- `gapDays`: "It's been {n} days since your last check-in."
- `badThemeLoad`: "Today touches on {themes}, which has come up on harder days."

**Drift state** (`nudge.ts`):
```
if checkin.features?.safety === "urgent" → "crisis"
else if priorCheckinsWithFeatures < 4 && model.nLabels < 3 → "learning"
else if p ≥ 0.7 || (p ≥ 0.55 && (pYesterday ≥ 0.45 || signalCount3d ≥ 2)) → "drift"
else → "steady"
if safety === "concern" and state === "steady" → "drift"
driftDaysLast7 = number of check-ins in the last 7 days (incl. t) whose evaluated state was drift/crisis
```

**`evaluateCheckin(state, checkin)`** computes features → p → state → explanations (for prior p, evaluate the previous check-in with the current model, or use its stored `modelP`).

**`mergeLearnedSignals`:** for matched ids, `count++`; for candidates, add if new (`source:"learned", count:1, active:false`) or `count++` if the id/text exists. Learned signals become `active` when `count ≥ 2`. Survey signals are always active.

**`replay(state)`:** sort check-ins by date; start from `profile` and `state.model ?? defaultModel()`; for each check-in: evaluate → store the result; if `userLabel` is good/bad or `driftFeedback` is set → `applyFeedback`; if bad → increment the counts of `matchedSignalIds` (no network call during replay). Return the final model, profile and the results map. Must run in under 100 ms for 30 days.

**Care router** (`care-router.ts`), deterministic:
```
crisis → {recommended:5, alsoOffer:[2]}
drift && (driftDaysLast7 ≥ 5 || short sleep (<5h) on ≥5 of last 7) → {4, [2,3]}
drift && driftDaysLast7 ≥ 3 → {3, [2,1]}
drift → {trustedPerson ? 1 : 0, [2,3]}
steady/learning → by prefs.readiness: tips_first→0, talk_to_someone→2, see_professional→3; alsoOffer [2,3] minus recommended
Then: if prefs.readiness === "see_professional" and recommended < 3 → recommended = 3 (users can move UP, never forced down).
Always include 2 (free helpline) in alsoOffer unless it is the recommended level.
reasons (plain, no clinical terms): "Different from your usual on {n} of the last 7 days", "You said you'd like to talk to someone", "Short sleep on {n} nights".
```

**Fit ranking** (`fit.ts`) `rankProviders(providers, level, prefs)`:
```
score = 0; reasons = []; unknowns = []
kind matches level (L2: helpline · L3: counsellor/psychologist · L4: psychiatrist/hospital · L5: emergency/hospital) → +3 "Right kind of help for this step"
languages known: overlap with prefs.languages → +3 "Speaks {lang}"; no overlap → −2; unknown → unknowns.push("Languages they speak")
fees known: feeMax ≤ budget (or free) → +2 "Within your budget" / "Free"; above → −1; unknown → unknowns.push("Session fee")
modes known & match prefs.mode → +2 "Offers {online|in-person}"; unknown → unknowns.push("Online or in-person")
gender matches prefs.providerGender (when not "any") → +1
distanceKm ≤5 → +2 "{d} km away"; ≤15 → +1
credential verified → +2 "Registration verified"; public_service → +1 "Government/public service"
Sort by score desc, then distance asc. For level 2–3, national free services are pinned first. Never sort by rating.
```

**Engine tests** (`lib/engine/engine.test.ts`; run with `npx tsx` or vitest if fast to set up). Use `public/demo-user.json` once seeded, plus hand fixtures:
1. Demo user + new check-in hardNote "Skipped dinner again, stayed up till 3, didn't reply to Riya." goodNote "Work was fine." → `drift`, top explanation `signalCount3d` (tune the default weights/thresholds until it passes).
2. "Went for a run, dinner with Riya, slept 8 hours" → `steady`.
3. `keywordSafety("i want to end my life")` → urgent; `/api/analyze-checkin` with no API key still returns safety urgent.
4. 3× `applyFeedback(..., 0)` on the same borderline check-in → p strictly decreases.
5. `driftDaysLast7` = 4 → care level 3; = 6 → care level 4.
6. Every evidence quote returned by analyze-checkin is a substring of the input.

## 5.5 Provider directory and Google Places
**`data/providers.json`** (bundled static directory):
- National/public, `credential:"public_service"`, `isDemoListing:false`, city "national":
  - Tele-MANAS: helpline, careLevels [2,3], phone "14416", languages ["English","Hindi","Tamil","Telugu","Kannada","Malayalam","Marathi","Bengali"], modes ["phone"], feeMin 0, feeMax 0.
  - iCALL (TISS): helpline, careLevels [2]. **Verify phone/hours on the day before adding the number**; otherwise website only.
  - "Government hospital psychiatry OPD (district/medical college)": hospital, careLevels [4], fee 0–100, mapsUrl `https://www.google.com/maps/search/government+hospital+psychiatry+OPD+near+me`.
- 8 **fictional** curated providers (`source:"curated"`, `credential:"verified"`, `isDemoListing:true`): 3 in Chennai (one Tamil+English female counsellor ₹800–1,200 online+in-person; one clinical psychologist ₹1,500–2,000; one psychiatrist ₹1,000–1,500), 2 in Bengaluru, and 1 each in Mumbai, Delhi and Hyderabad, with realistic lat/lng and varied languages, modes and genders. Names clearly fictional (e.g. "Demo: Kaveri Counselling Studio").

**`lib/directory.ts`**: `getProviders(level?, city?)` filters bundled JSON by care level and case-insensitive city, retaining national services. No remote database connection or persistence.

**`/api/providers`**: returns `getProviders(level, city)`.

**`/api/places`**
1. Queries by level: L2 → [] (helplines only from the directory); L3 → ["psychologist", "counselling centre"]; L4 → ["psychiatrist", "mental health hospital"]; L5 → ["hospital emergency"].
2. For each query (max 2, in parallel), if `GOOGLE_MAPS_API_KEY` is set:
   ```
   POST https://places.googleapis.com/v1/places:searchText
   Headers: Content-Type: application/json
            X-Goog-Api-Key: <GOOGLE_MAPS_API_KEY>
            X-Goog-FieldMask: places.id,places.displayName,places.formattedAddress,places.location,places.types,places.googleMapsUri,places.nationalPhoneNumber,places.websiteUri,places.rating
   Body: { "textQuery": "<query> in <city>", "maxResultCount": 10, "languageCode": "en",
           "locationBias": { "circle": { "center": { "latitude": <lat>, "longitude": <lng> }, "radius": <radiusKm*1000, max 50000> } } }
   (omit locationBias if location is null)
   ```
3. Normalise: `id: "g_"+place.id`, `source:"google"`, `name: displayName.text`, `kind` from the query (psychologist/counsellor/psychiatrist/hospital/emergency), `careLevels:[level]`, address, lat/lng, phone, website, mapsUrl, rating, `credential:"not_verified"`, `isDemoListing:false`. Languages/fees/modes stay undefined (they become "Confirm by phone" unknowns).
4. Merge with `getProviders(level, city)`; dedupe by lowercase name + first 20 chars of address; compute `distanceKm` (haversine) where both coordinates exist; drop Google results with distance > radiusKm × 1.5.
5. Return `{ providers, embedQuery: "<first query> near <city>", attribution: "Results from Google Maps" }`. On Google error or a missing key: directory-only + `degraded:true`.
6. **Never store Google results** (no database writes, browser persistence, or files). Cache nothing server-side.

**`/api/provider-apply`** (deferred): zod-validate, then return `{ok:false,degraded:true}`. No contact data is transmitted or stored.

## 5.6 Learning, Session Bridge, and suggestions without AI
- `/api/learn`: match existing signals using the analyzer's phrase rules and propose at most two new matched behavioural phrases copied from the submitted note. Never invent signals; learned signals activate only after two supporting days through the engine.
- `/api/session-bridge`: organize up to eight relevant entries from the latest 30-day window. Text and quotes come only from that date's notes; exact-substring checks are mandatory. Fill active signs, helpful actions, user goals, practical preferences, availability and timestamp deterministically. Do not infer what has not helped. Filter prohibited generated wording. Supply five fixed first-appointment questions and English/Hindi/Tamil call templates. The user edits and approves; nothing is sent automatically. Return `degraded:true` for template mode.
- `/api/suggest`: return submitted helpful actions verbatim first, then at most three cards whose tags match explanation features or themes; `framing` is empty. Return `degraded:true`. No AI framing is attempted.
- Future proposal only: semantic extraction and additional-language brief assistance may be evaluated later with new consent. There is no AI runtime dependency or key in this MVP.

## 5.7 `data/resources.json` (write plain, non-clinical, 2–4 sentences each)
`walk_10min` [energyDrop, rest] · `sleep_winddown` [lowSleep, sleep] · `tiny_task` [energyDrop, work, study] · `grounding_54321` [valenceDrop] · `reach_out` [socialDrop, loneliness, friends] · `simple_meal` [food, badThemeLoad] · `write_three_lines` [gapDays] · `what_is_telemanas` (info: free, 24×7, 14416, 20 languages) · `what_first_session_is_like` (info: you can ask questions, you can switch if it isn't a fit) · `cost_and_coverage` (info: fees vary by city; free options are Tele-MANAS and govt hospital OPD; MHCA 2017 s.21(4) insurance parity, but OPD often not covered, so check your policy).

## 5.8 Seed the fictional demo user
`scripts/seed_demo_user.py` calls the running local `/api/analyze-checkin` for every note and writes `public/demo-user.json`. Fictional Ananya is 24, a software engineer in Chennai. Generate 30 calendar days, two hard stretches (days 8–12 and 20–24), each preceded 2–3 days by skipped meals, late nights and not replying to Riya, and silent days 15 and 26 (28 check-ins total). Use random seed 7, reproducible IDs and India-local dates. Preferences: English + Tamil, budget INR 1500, either mode, talk_to_someone. The JSON is labelled fictional and contains no real user data.

Run `python -m pip install requests tqdm`, start the app, then `python scripts/seed_demo_user.py`. Fail visibly if the analyzer is unavailable instead of seeding null features. Verify every quote and run `npx --yes tsx lib/engine/engine.test.ts`; replay must finish in under 100 ms. If the hero fails, adjust the documented engine weight/threshold within the allowed bounds rather than changing synthetic notes. No AI calls are required.

## 5.9 Your timeline (T = minutes from start)
| T | Task |
|---|---|
| 0–5 | Confirm browser-memory scope; Google keys are optional and tested only if available. |
| 5–10 | Commit types/brand/env/render/README/docs to main; create branch `b/intelligence`. |
| 10–20 | Mocks + stub routes + stub engine → PR → main (**by T+20**). |
| 20–40 | `safety.ts`, local phrase extraction, `/api/analyze-checkin`, `/api/build-profile`. |
| 40–60 | Engine (features, model, nudge, explanations, replay, merge) + tests 2–4. |
| 45 | Checkpoint 1: PR → main (merge before A). |
| 60–80 | `providers.json`, `lib/directory.ts`, `/api/providers`, `/api/places`, `care-router.ts`, `fit.ts`, test 5. |
| 80–95 | `/api/session-bridge`, `/api/suggest`, `/api/learn`, `resources.json`; run the seed script (~T+85) and test 1. |
| 85 | Checkpoint 2: PR → main (real engine). |
| 95–100 | Help A with integration; `/api/provider-apply` only if everything else works. |
| 100–110 | Together: demo ×2; fix demo-breaking bugs only; final PR → main; set Render env vars; test Places near the venue on the deployed URL. |
| 110–120 | Together: rehearse; freeze. |

**Cut order if behind:** provider-apply → suggest framing (cards without framing) → personalised Bridge questions. **Never cut:** keyword safety, analyze-checkin with quote check, engine + explanations, care router, places/providers merge with badges, session-bridge.

## 5.10 Your definition of done
- [ ] All routes return valid shapes with no API keys; rule/template endpoints clearly mark `degraded:true`. Live Places is optional and directory-only mode remains usable.
- [ ] A crisis phrase → `safety: "urgent"` without any external key.
- [ ] Evidence quotes are always exact substrings.
- [ ] Engine tests 1–6 pass; `replay` of the demo user < 100 ms.
- [ ] `/api/places` returns live Google results near the venue merged with the directory, with correct badges and distances; nothing from Google is stored.
- [ ] Session Bridge contains no diagnostic words (grep the output for the banned list in §1.5).
- [ ] `public/demo-user.json` is committed and loads in the UI.
- [ ] No user content is logged; `.env.local` is not committed; only optional Maps keys are configured for Render.

## 5.11 Integration notes for the implemented MVP
Engine exports remain exactly the seven signatures in section 4.2. Dates provide deterministic model timestamps; no clock or I/O is used in the engine. Engine results additionally carry serializable `shortSleepNightsLast7` metadata so `carePath(result, profile)` can honor the five-short-nights rule without global state or changing shared types. Explanations without exact supporting quotes are omitted. Browser memory implementation and consent-copy alignment remain Person A ownership.
