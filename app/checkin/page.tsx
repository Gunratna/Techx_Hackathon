"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { applyFeedback, defaultModel, evaluateCheckin, mergeLearnedSignals } from "@/lib/engine";
import { keywordSafety } from "@/lib/safety";
import { localDate } from "@/lib/store";
import * as api from "@/lib/api-client";
import type { AppState, Checkin, DayLabel, EngineResult } from "@/lib/types";
import { useApp } from "@/components/AppShell";
import { RequireProfile } from "@/components/RequireProfile";
import { StateCard } from "@/components/StateCard";
import { Icon } from "@/components/Icon";

export default function CheckinPage() { return <RequireProfile><CheckinForm /></RequireProfile>; }
function CheckinForm() {
  const { state, update, openCrisis } = useApp();
  const router = useRouter();
  const [good, setGood] = useState("");
  const [hard, setHard] = useState("");
  const [label, setLabel] = useState<DayLabel | null>(null);
  const [sleep, setSleep] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState<Checkin | null>(null);
  const [result, setResult] = useState<EngineResult | null>(null);
  const [suggestions, setSuggestions] = useState<api.SuggestResponse | null>(null);
  const loaded = useRef(false);
  const crisisSeen = useRef(false);
  const today = localDate();
  const profile = state.profile!;
  useEffect(() => {
    if (loaded.current) return; loaded.current = true;
    const existing = state.checkins.find(c => c.date === today);
    if (existing) { setGood(existing.goodNote); setHard(existing.hardNote); setLabel(existing.userLabel); setSleep(existing.sleepHoursInput); setSaved(existing); setResult(evaluateCheckin({ ...state, checkins: state.checkins.filter(c => c.id !== existing.id) }, existing)); }
  }, [state, today]);
  useEffect(() => {
    const urgent = keywordSafety(`${good}\n${hard}`) === "urgent";
    if (urgent && !crisisSeen.current) { crisisSeen.current = true; openCrisis(); }
    if (!urgent) crisisSeen.current = false;
  }, [good, hard, openCrisis]);
  async function smallSteps(currentResult: EngineResult, checkin: Checkin) { try { setSuggestions(await api.suggest({ explanations: currentResult.explanations, themes: checkin.features?.themes ?? [], helpfulActions: profile.helpfulActions })); } catch { setSuggestions(null); } }
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setError("");
    if (!good.trim() && !hard.trim()) { setError("Add a few words in either note before saving."); return; }
    setBusy(true);
    try {
      const prior: AppState = { ...state, checkins: state.checkins.filter(c => c.date !== today) };
      const analyzed = await api.analyzeCheckin({ goodNote: good.trim(), hardNote: hard.trim(), sleepHoursInput: sleep, signals: profile.signals });
      const deterministic = keywordSafety(`${good}\n${hard}`);
      const features = { ...analyzed.features, safety: deterministic === "urgent" ? "urgent" as const : analyzed.features.safety };
      const checkin: Checkin = { id: state.checkins.find(c => c.date === today)?.id ?? crypto.randomUUID(), date: today, goodNote: good.trim(), hardNote: hard.trim(), inputMode: "text", userLabel: label, sleepHoursInput: sleep, features, modelP: null, driftFeedback: null };
      let evaluated = evaluateCheckin(prior, checkin);
      if (features.safety === "urgent") evaluated = { ...evaluated, state: "crisis" };
      checkin.modelP = evaluated.p;
      let model = state.model ?? defaultModel();
      let nextProfile = profile;
      if (label === "good" || label === "bad") model = applyFeedback(model, prior, checkin, label === "bad" ? 1 : 0);
      if (label === "bad") { const learned = await api.learn({ text: `${checkin.goodNote}\n${checkin.hardNote}`, signals: profile.signals }); nextProfile = mergeLearnedSignals(profile, learned.matchedExistingIds, learned.newCandidates); }
      const next = { ...state, profile: nextProfile, model, checkins: [...prior.checkins, checkin].sort((a, b) => a.date.localeCompare(b.date)) };
      if (!update(next)) return;
      setSaved(checkin); setResult(evaluated);
      if (evaluated.state === "crisis") openCrisis(); else await smallSteps(evaluated, checkin);
    } catch { setError("Your note could not be saved. It’s still here so you can try again."); } finally { setBusy(false); }
  }
  async function feedback(y: 0 | 1) {
    if (!saved || !result) return; setBusy(true); setError("");
    try {
      const checkin: Checkin = { ...saved, driftFeedback: y ? "struggling" : "fine" };
      const prior = { ...state, checkins: state.checkins.filter(c => c.id !== saved.id) };
      const model = applyFeedback(state.model ?? defaultModel(), prior, checkin, y);
      let nextProfile = profile;
      if (y) { const learned = await api.learn({ text: `${saved.goodNote}\n${saved.hardNote}`, signals: profile.signals }); nextProfile = mergeLearnedSignals(profile, learned.matchedExistingIds, learned.newCandidates); }
      if (!update({ ...state, profile: nextProfile, model, checkins: state.checkins.map(c => c.id === saved.id ? checkin : c) })) return;
      setSaved(checkin);
      if (y) router.push("/care-path");
    } catch { setError("Your choice could not be saved. Please try again."); } finally { setBusy(false); }
  }
  return <div className="page"><div className="checkin-heading"><div><p className="eyebrow">{new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}</p><h1 style={{ fontSize: "clamp(36px, 5vw, 52px)" }}>A little space for today.</h1><p className="lead">{profile.name ? `Hi ${profile.name}. ` : ""}You don’t have to make sense of everything. Start with a few words.</p></div><span className="badge"><Icon name="lock" size={12} />Only in this browser</span></div><div className="checkin-grid"><section><form className="panel" onSubmit={submit}><div className="actions" style={{ justifyContent: "space-between", marginBottom: 22 }}><h2 style={{ margin: 0 }}>30-second check-in</h2><span className="helper">{saved ? "You can update today’s note" : "A moment for you"}</span></div><div className="field"><label htmlFor="good-note">One good thing today</label><textarea id="good-note" value={good} maxLength={8000} onChange={e => setGood(e.target.value)} placeholder="Something small counts, too…" /></div><div className="field"><label htmlFor="hard-note">One hard thing today <span className="muted">(optional)</span></label><textarea id="hard-note" value={hard} maxLength={8000} onChange={e => setHard(e.target.value)} placeholder="What’s been taking up a little space?" /></div><fieldset className="field"><legend className="field-label" style={{ marginBottom: 12 }}>How would you describe today? <span className="muted">(optional)</span></legend><div className="chips">{(["good", "okay", "bad"] as const).map(value => <button type="button" key={value} className="chip" aria-pressed={label === value} onClick={() => setLabel(label === value ? null : value)}>{value === "good" ? "Good" : value === "okay" ? "Okay" : "Bad"}</button>)}</div></fieldset><div className="sleep-row"><span className="field-label">Hours of sleep <span className="muted">(optional)</span></span><div className="actions" style={{ gap: 8 }}><button type="button" className="icon-button" aria-label="Less sleep" disabled={sleep === 0} onClick={() => setSleep(Math.max(0, (sleep ?? 7) - .5))}>−</button><output aria-live="polite" style={{ width: 40, textAlign: "center", fontSize: 13 }}>{sleep === null ? "—" : sleep}</output><button type="button" className="icon-button" aria-label="More sleep" disabled={sleep === 24} onClick={() => setSleep(Math.min(24, (sleep ?? 7) + .5))}>+</button>{sleep !== null && <button type="button" className="text-button" onClick={() => setSleep(null)}>Clear</button>}</div></div>{error && <p className="status" role="alert">{error}</p>}<div className="button-row"><span className="helper">One note per day. You can change it.</span><button type="submit" className="button" disabled={busy}>{busy ? <><span className="spinner" />Saving your note…</> : saved ? "Update check-in" : "Save check-in"}<Icon name="arrow" size={15} /></button></div></form>{saved && <p role="status" className="helper" style={{ marginTop: 12 }}><Icon name="check" size={12} /> Your check-in is saved in this browser.</p>}</section><aside className="stack" style={{ alignContent: "start" }}>{result ? <StateCard result={result} checkins={state.checkins} onFeedback={feedback} openCrisis={openCrisis} busy={busy} feedback={saved?.driftFeedback ?? null} /> : <section className="panel soft-panel"><Icon name="leaf" size={26} /><h2 className="serif" style={{ fontSize: 30, marginTop: 18 }}>No perfect words needed.</h2><p className="muted">A small moment, a mixed day, something you haven’t said out loud. There’s room for all of it here.</p><p className="helper" style={{ marginBottom: 0 }}>Save a note when you’re ready. No AI is used in this version.</p></section>}<section className="panel"><p className="eyebrow">One gentle next step</p><h2>Start with what helps you.</h2><div className="chips">{profile.helpfulActions.slice(0, 3).map(action => <span className="chip" key={action}>{action}</span>)}</div><p className="helper" style={{ marginTop: 18, marginBottom: 0 }}>A little is enough. You get to choose what feels manageable.</p></section></aside></div>{result && result.state !== "crisis" && <section id="small-steps" style={{ marginTop: 36 }}><p className="eyebrow">At your own pace</p><h2>Today’s small steps</h2><p className="muted">Your own ideas come first. Take what fits and leave the rest.</p><div className="small-step-grid">{(suggestions?.ownActions ?? profile.helpfulActions).map(action => <article className="panel soft-panel" key={action}><Icon name="heart" size={20} /><h3 style={{ marginTop: 15 }}>{action}</h3><span className="helper">Something you said helps</span></article>)}{suggestions?.cards.slice(0, 2).map(({ card }) => <article className="panel" key={card.id}><h3>{card.title}</h3><p className="helper" style={{ marginBottom: 0 }}>{card.body}</p></article>)}</div></section>}<p className="helper" style={{ marginTop: 28 }}>Prefer to talk? <a className="text-button" href="tel:14416">Call Tele-MANAS 14416</a> · Free, 24×7. Or <Link className="text-button" href="/care-path">explore your care path</Link>.</p></div>;
}
