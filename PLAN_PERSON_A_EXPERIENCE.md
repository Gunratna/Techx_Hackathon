# MannSetu: Build Plan for PERSON A (Experience / Frontend)

> Date written: 24 Oct 2026 (IST). Event: 2-hour "vibethon" (AI-assisted hackathon), Mental Health track. Team of 2.
> Repo: https://github.com/Gunratna/Techx_Hackathon. **Your branch: `a/experience`**. Partner's branch: `b/intelligence`.
> This document is self-contained. If you are a coding agent (Codex etc.), you have NO other context: everything you need is here.
> Your partner (Person B) has a twin document with the same Parts 1–4 and different Part 5 tasks. Parts 1–4 are identical in both docs; Part 5 is yours alone.
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
5. Type a crisis phrase → the hard-coded crisis panel appears instantly ("the AI can never switch this off").

## 1.5 Non-negotiable rules (both people enforce)
| Rule | How |
|---|---|
| 18+ only | Age gate. Under 18 → exit screen showing Tele-MANAS 14416. |
| Consent first | Consent screen covers: check-ins stay in this browser; check-in text is sent to an AI provider for analysis; location is sent to Google for place search; not a diagnosis; not a crisis service. |
| No judgement, no diagnosis | Banned in UI copy and LLM output: depressed, depression, disorder, diagnosis, risk score, suicidal, "you need". Use: "different from your usual", "might help", "options that fit you". |
| Crisis always reachable | A "Need help now?" button in the header on every page. Crisis state = deterministic keyword match OR the LLM saying `urgent`. The model can only escalate, never de-escalate. Crisis text is hard-coded, never generated. |
| Explain every flag | Top 3 reasons, each with exact quotes from the user's own notes. |
| User owns the model | Learned signs are visible, editable and deletable. Every flag gets [I'm struggling] / [I'm fine] feedback. |
| Nothing auto-sent | Session Bridge, call scripts and trusted-person suggestions only work through user copy/print/tap. |
| Fit, not pay-to-rank | Ranking is a deterministic fit score. No paid placement, ever. |
| Credential honesty | Google results get the "Credentials not verified" badge plus RCI/NMC links. Fictional curated listings get the "Demo listing" badge. |
| Personal data stays on device | Profile, check-ins and model weights live in browser localStorage. API routes are stateless and log no content. A "Delete all my data" button exists. Supabase holds ONLY the provider directory (no user data in the MVP). |
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
- `zod` (validate all LLM/API output), `recharts` (charts), `@anthropic-ai/sdk` (LLM), `@supabase/supabase-js` (provider directory).
- **LLM:** Anthropic Claude, model `claude-sonnet-5-5`, isolated in `lib/llm.ts` (swappable).
- **Places:** Google **Places API (New) Text Search** called from a server route. Fallbacks: Maps Embed iframe → curated list.
- **Voice:** browser Web Speech API (`en-IN`, `hi-IN`, `ta-IN`); demo in Chrome; typing is the fallback.
- **User data:** browser localStorage. **Supabase:** only the `providers` table (+ optional `provider_applications`). If Supabase env vars are missing, fall back to `data/providers.json`.
- **Deploy:** Render Web Service (Node) from the `main` branch.
- **Seed script:** Python 3 + `requests` + `tqdm`.

## 2.2 Environment variables (`.env.example` committed; real values never committed)
```
ANTHROPIC_API_KEY=            # server only
GOOGLE_MAPS_API_KEY=          # server only; restrict to Places API (New)
NEXT_PUBLIC_MAPS_EMBED_KEY=   # browser; restrict to Maps Embed API + HTTP referrers (localhost, *.onrender.com)
SUPABASE_URL=                 # server only usage
SUPABASE_ANON_KEY=            # server only usage (read providers; insert applications)
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
│  ├─ mock.ts    llm.ts   prompts.ts   safety.ts   supabase.ts   # B
│  └─ engine/ index.ts features.ts model.ts nudge.ts care-router.ts fit.ts   # B (A imports from engine/index.ts only)
├─ app/
│  ├─ layout.tsx page.tsx onboarding/ checkin/ care-path/ find-help/ bridge/ insights/ providers/join/   # A
│  └─ api/ build-profile/ analyze-checkin/ learn/ places/ providers/ session-bridge/ suggest/ provider-apply/   # B
├─ components/                                      # A
├─ data/ providers.json  resources.json            # B
├─ supabase/schema.sql  supabase/seed.sql          # B
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
  npm i @anthropic-ai/sdk zod recharts @supabase/supabase-js
  # edit package.json: "start": "next start -p ${PORT:-3000}"
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
      - key: ANTHROPIC_API_KEY
        sync: false
      - key: GOOGLE_MAPS_API_KEY
        sync: false
      - key: NEXT_PUBLIC_MAPS_EMBED_KEY
        sync: false
      - key: SUPABASE_URL
        sync: false
      - key: SUPABASE_ANON_KEY
        sync: false
```
Steps: Render dashboard → New → Blueprint → connect the repo → fill the env vars → deploy. Add the `*.onrender.com` URL to the Maps Embed key's HTTP-referrer restriction. `NEXT_PUBLIC_*` vars are baked in at build time, so redeploy after changing them. Free instances sleep when idle: **open the URL 5 minutes before the demo**. Keep `npm run dev` on a laptop as a backup.

## 2.6 Supabase (provider directory only)
`supabase/schema.sql` (Person B runs it in the Supabase SQL editor):
```sql
create table if not exists providers (
  id text primary key,
  source text not null check (source in ('national','curated')),
  name text not null,
  kind text not null check (kind in ('helpline','counsellor','psychologist','psychiatrist','hospital','emergency')),
  care_levels int[] not null,
  address text, city text, lat double precision, lng double precision,
  phone text, website text, maps_url text,
  languages text[] default '{}', modes text[] default '{}', gender text,
  fee_min int, fee_max int,
  credential text not null check (credential in ('verified','not_verified','public_service')),
  is_demo_listing boolean not null default true,
  is_published boolean not null default true
);
alter table providers enable row level security;
create policy "public read published providers" on providers for select using (is_published);

create table if not exists provider_applications (          -- stretch: "Join as a provider" form
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  name text not null, kind text not null, city text, languages text[], modes text[],
  fee_min int, fee_max int, registration_body text check (registration_body in ('RCI','NMC','Other')),
  registration_number text, email text, phone text
);
alter table provider_applications enable row level security;
create policy "anyone can apply" on provider_applications for insert with check (true);
```
`supabase/seed.sql` inserts the same rows as `data/providers.json`. **No user check-ins or profiles are ever stored in Supabase in the MVP.**

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
| `/api/providers` | `{ level?: CareLevel, city?: string }` | `{ providers: Provider[] }` (Supabase or JSON fallback) |
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

# PART 5 — YOUR TASKS: PERSON A (Experience / Frontend)

**You own:** every page in `app/` (except `app/api/*`), `components/*`, `lib/store.ts`, `lib/speech.ts`, `lib/api-client.ts`, the Render setup, and the T+0 scaffold.
**You do NOT edit:** `lib/engine/*`, `lib/llm.ts`, `lib/prompts.ts`, `lib/safety.ts`, `lib/mock.ts`, `lib/supabase.ts`, `app/api/*`, `data/*`, `supabase/*`, `scripts/*`.
**Build against mocks** until the T+45/T+85 merges. Never block on Person B.

## 5.1 Design direction
- Calm, warm, trustworthy: off-white background, one teal/indigo accent, generous spacing, large tap targets, mobile-first (judges check on phones). No red except the crisis button and modal.
- Tone: second person, gentle, never clinical. "Different from your usual" — never "warning" or "risk".
- Every screen shows the persistent header: brand name (from `BRAND`), nav (Check-in · Care Path · Find Help · Insights), and the red **"Need help now?"** button.

## 5.2 Files to build
**`lib/store.ts`**: `load(): AppState`, `save(state)`, `reset()`, key `"mannsetu:v1"`. Wrap in try/catch and return empty state on failure. `loadDemo()` fetches `/demo-user.json`, then calls `replay()` from the engine and saves the result.

**`lib/speech.ts`**: `startListening(lang, onPartial, onFinal, onError)` / `stop()` over `window.webkitSpeechRecognition` (`interimResults: true`, `continuous: false`). Expose `isSupported()`; if unsupported, hide the mic button.

**`lib/api-client.ts`**: typed `post<T>(route, body)` plus one function per route in §4.1. On a network error, return the mock from `lib/mock.ts`.

**`components/`**: `Header`, `CrisisModal` (hard-coded content from §1.5), `StateCard`, `ReasonChip` (quote + date), `ProviderCard`, `CredentialBadge`, `CareLevelCard`, `Chip`/`EditableChipList`, `ConsentBlock`.

## 5.3 Screens (in build order)
1. **`app/layout.tsx` + Header + CrisisModal** (T+10–20). The crisis modal opens from the header on any page, and also opens automatically when `state === "crisis"`.
2. **Landing `app/page.tsx`**: `BRAND.tagline`, "Not a therapist. Not for emergencies.", buttons [Get started] → /onboarding and [Load demo user] → `loadDemo()` → /checkin.
3. **Onboarding `app/onboarding/page.tsx`** (T+20–40), a 4-step wizard:
   - Step 1 Consent + age: checkbox list (§1.5 consent items) + "I am 18 or older" (No → exit screen with 14416).
   - Step 2 WHO-5: five items, 0–5 each, as radio rows (wording: "Over the last two weeks… I have felt cheerful and in good spirits / calm and relaxed / active and vigorous / woke up feeling fresh and rested / my daily life has been filled with things that interest me"; scale: At no time 0 … All of the time 5). Store the sum; never show it as a score.
   - Step 3 Your signs: textareas "What does a hard day look like for you?", "What are the early signs, before it gets bad?", "What usually helps?"; optional trusted person (name, relation, phone).
   - Step 4 Help preferences: languages (multi-select: English, Hindi, Tamil, Telugu, Kannada, Malayalam, Marathi, Bengali), budget slider (₹0 "free only" → ₹3,000), mode, provider gender, readiness (3 options), [Use my location] (geolocation) + city text.
   - Submit → `api.buildProfile` → **Review** screen with editable chips for signals and helpful actions → Save → /checkin.
4. **Check-in `app/checkin/page.tsx`** (T+40–60, the home screen):
   - Title "30-second check-in". Fields: "One good thing today" and "One hard thing today (optional)". Mic button per field + language select (en-IN/hi-IN/ta-IN). Optional label buttons [Good][Okay][Bad], optional sleep-hours stepper. [Save].
   - Run the save flow (§4.3). Show a spinner ("Reading your note…").
   - **StateCard:** Learning ("Still learning your pattern: a few more days") · As usual (calm) · **Different from your usual**: up to 3 `ReasonChip`s (message + quotes + dates) with buttons [I'm struggling] [I'm fine, thanks] · Crisis → auto-open CrisisModal.
   - Below: "Today's small steps" from `api.suggest` (own actions first, then cards).
5. **Care Path `app/care-path/page.tsx`** (T+60–70): call `carePath(latestResult, profile)`. Show the recommended `CareLevelCard` (big) with reasons, then the `alsoOffer` cards. CTAs: L0 → suggestions; L1 → "Maybe message {name}?" (`sms:`/`tel:` links only if a phone was given; otherwise text only); L2 → [Call Tele-MANAS 14416] (`tel:14416`); L3/L4 → [Find options] → `/find-help?level=3|4`; L5 → CrisisModal. Footer: "You can always choose a different level."
6. **Find Help `app/find-help/page.tsx`** (T+70–80):
   - Filters: level (3/4/2), language, budget, mode, gender, distance (5/10/25 km). A "Use my location" button if missing.
   - Call `api.places({level, location, city, radiusKm})` → `rankProviders(providers, level, prefs)` (re-rank client-side when filters change; no new API call).
   - `ProviderCard`: name, kind, distance, rating (if Google), **"Why this match"** chips (`reasons`), **"Confirm by phone"** list (`unknowns`), `CredentialBadge` (✔ Verified · 🏛 Public service · ⚠ "Credentials not verified, check" with links to https://rehabcouncil.nic.in and https://www.nmc.org.in · "Demo listing"), buttons [Call] [Website] [Open in Maps] **[Prepare for this]** → `/bridge?providerId=…`.
   - A cost & coverage info box (static): typical fees vary by city; free options are Tele-MANAS and government hospital psychiatry OPD; under the Mental Healthcare Act 2017 s.21(4) insurers must cover mental illness on par with physical illness, but outpatient cover is often missing, so check your policy.
   - Map: `<iframe src="https://www.google.com/maps/embed/v1/search?key=${NEXT_PUBLIC_MAPS_EMBED_KEY}&q=${encodeURIComponent(embedQuery)}">`. Hide it if the key is missing. Show the attribution text "Results from Google Maps".
7. **Session Bridge `app/bridge/page.tsx`** (T+80–95):
   - Inputs: "In my words: what's going on?" (textarea, user-written), "What I want from support", availability, language for the call script.
   - [Generate] → `api.sessionBridge(...)` → render each section as editable text areas/lists. `whatsBeenHappening` items show date + quote chips.
   - Banner: "This is yours. Nothing is sent to anyone." Buttons [Copy call script] [Print / Save as PDF] (`window.print()`; add a `@media print` stylesheet that hides nav/buttons and prints a clean one-pager with the brand name and date).
8. **Insights `app/insights/page.tsx`** (T+95, if time allows): a 30-day line chart (recharts) of `modelP` with dots coloured by `userLabel`; **"What MannSetu has learned about you"** list (signal text, source badge, count, active/pending, delete ✕ → update profile); "What matters most for you" (top 3 weights translated to words, e.g. `socialDrop` → "Going quiet with people"); [Delete all my data] (confirm → `reset()` → landing).
9. **Join as provider `app/providers/join/page.tsx`** (stretch only): a form → `/api/provider-apply`. Text: "We verify RCI/NMC registration before showing a Verified badge."

## 5.4 Your timeline (T = minutes from start)
| T | Task |
|---|---|
| 0–5 | Scaffold + push to main (§2.4). |
| 5–10 | Review B's `types.ts`; create branch `a/experience`. Set up Render service (env vars can be added later). |
| 10–20 | Layout, Header, CrisisModal, `store.ts`, `api-client.ts` skeleton. |
| 20 | Merge B's mocks from main (`git merge origin/main`). |
| 20–40 | Onboarding wizard + review screen. |
| 40–60 | Check-in page + speech + StateCard + suggestions. |
| 45 | Checkpoint 1: PR → main (after B's PR). |
| 60–70 | Care Path. |
| 70–80 | Find Help (+ embed map). |
| 80–95 | Session Bridge + print stylesheet. |
| 85 | Checkpoint 2: merge main (real engine) and test with "Load demo user". |
| 95–100 | Insights (or cut). |
| 100–110 | Together: full demo run ×2, fix demo-breaking bugs only, final PR → main, verify the Render deploy, test Places near the venue on the deployed URL. |
| 110–120 | Together: rehearse (§5.6). Freeze. |

**Cut order if behind:** Insights chart → provider join page → embed map → voice input → suggestion framing. **Never cut:** crisis button/modal, StateCard with quoted reasons + feedback buttons, Care Path, Find Help with reasons/unknowns/badges, Session Bridge.

## 5.5 Your definition of done
- [ ] Onboarding saves a profile with ≥3 signs and preferences; under-18 exit works.
- [ ] "Load demo user" → check-in "Skipped dinner again, stayed up till 3, didn't reply to Riya. Work was fine." shows "Different from your usual" with ≥2 quoted reasons.
- [ ] [I'm struggling] → Care Path with Tele-MANAS always visible.
- [ ] Find Help shows ranked cards with reasons, unknowns and correct badges; filters re-rank instantly.
- [ ] Session Bridge generates, can be edited, and prints as a clean one-pager.
- [ ] The crisis modal opens from every page and auto-opens on a crisis phrase.
- [ ] Delete-all clears localStorage.
- [ ] Works at 375 px width; deployed Render URL works.

## 5.6 Demo script (3 min; you drive the UI)
1. (20 s) Problem: 84.5% get no care; many who do reach care drop out after visit one. Two gaps: noticing early, and reaching the *right* help prepared.
2. (15 s) Load Ananya (fictional) → Insights glimpse: "what it learned about her, in her words."
3. (30 s) Type the hero check-in → "Different from your usual" with her own quotes. No judgement, no label.
4. (20 s) [I'm struggling] → Care Path: "4 of the last 7 days → a counsellor could help"; Tele-MANAS free.
5. (35 s) Find Help near the venue → "Why this match", "Confirm by phone", "⚠ check RCI".
6. (30 s) [Prepare for this] → Session Bridge + Tamil call script → edit → print. "Nothing leaves her phone unless she chooses."
7. (15 s) Crisis phrase → hard-coded panel. "The AI can never switch this off."
8. (15 s) Business: free for people; colleges, employers and verified providers pay; no pay-to-rank, no data selling.
