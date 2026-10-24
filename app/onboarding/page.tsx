"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import * as api from "@/lib/api-client";
import { loadDemo } from "@/lib/store";
import type { Preferences, Profile, UserModel } from "@/lib/types";
import { useApp } from "@/components/AppShell";
import { ConsentBlock, CONSENT_ITEMS } from "@/components/ConsentBlock";
import { EditableChipList } from "@/components/Chip";
import { Icon } from "@/components/Icon";

const languages = ["English", "Hindi", "Tamil", "Telugu", "Kannada", "Malayalam", "Marathi", "Bengali"];
const wellbeing = ["I have felt cheerful and in good spirits", "I have felt calm and relaxed", "I have felt active and vigorous", "I woke up feeling fresh and rested", "My daily life has been filled with things that interest me"];
const scale = ["At no time", "Some of the time", "Less than half of the time", "More than half of the time", "Most of the time", "All of the time"];
const emptyPrefs: Preferences = { languages: ["English"], budgetPerSession: 0, mode: "either", providerGender: "any", readiness: "tips_first", city: "", location: null };
export default function Onboarding() {
  const { state, ready, update, reload } = useApp();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [consents, setConsents] = useState(CONSENT_ITEMS.map(() => false));
  const [adult, setAdult] = useState(false);
  const [under18, setUnder18] = useState(false);
  const [who5, setWho5] = useState<(number | null)[]>([null, null, null, null, null]);
  const [name, setName] = useState("");
  const [hardDay, setHardDay] = useState("");
  const [signs, setSigns] = useState("");
  const [helps, setHelps] = useState("");
  const [trusted, setTrusted] = useState({ name: "", relation: "", phone: "" });
  const [prefs, setPrefs] = useState<Preferences>(emptyPrefs);
  const [review, setReview] = useState<Profile | null>(null);
  const [model, setModel] = useState<UserModel | null>(null);
  const [busy, setBusy] = useState(false);
  const [geoBusy, setGeoBusy] = useState(false);
  const [geoMessage, setGeoMessage] = useState("");
  const [error, setError] = useState("");
  const heading = useRef<HTMLHeadingElement>(null);
  const reviewing = review !== null;
  useEffect(() => { if (step > 0 || reviewing || under18) { heading.current?.focus(); window.scrollTo({ top: 0, behavior: "instant" }); } }, [step, reviewing, under18]);
  function preference<K extends keyof Preferences>(key: K, value: Preferences[K]) { setPrefs(current => ({ ...current, [key]: value })); }
  async function next() {
    setError("");
    if (step === 0) {
      if (!adult || !consents.every(Boolean)) { setError("Please confirm you’re 18 or older and agree to each item to continue."); return; }
      if (!update({ ...state, consentAt: new Date().toISOString() })) return;
      if (new URLSearchParams(window.location.search).get("demo") === "1") {
        setBusy(true);
        try { await loadDemo(); reload(); router.push("/checkin"); return; } catch (e) { setError(e instanceof Error ? `${e.message} You can continue below.` : "The demo is not ready. You can continue below."); } finally { setBusy(false); }
      }
    }
    if (step === 1 && who5.some(value => value === null)) { setError("Choose one answer for each of the five items. There are no right or wrong answers."); return; }
    if (step === 2 && (!hardDay.trim() || !signs.trim() || !helps.trim())) { setError("Add a few words about a hard day, your early signs and what helps."); return; }
    if (step === 2 && Boolean(trusted.name.trim()) !== Boolean(trusted.relation.trim())) { setError("For a trusted person, add both a name and relationship, or leave both blank."); return; }
    if (step < 3) { setStep(step + 1); return; }
    if (!prefs.languages.length) { setError("Choose at least one language that feels comfortable."); return; }
    if (!prefs.city.trim() && !prefs.location) { setError("Add your city or choose to use your location."); return; }
    setBusy(true);
    try { const response = await api.buildProfile({ name, who5: who5 as number[], badDayDescription: hardDay, earlySigns: signs, helpfulActions: helps, trustedPerson: trusted.name.trim() ? { name: trusted.name.trim(), relation: trusted.relation.trim(), ...(trusted.phone.trim() ? { phone: trusted.phone.trim() } : {}) } : null, prefs }); setReview(response.profile); setModel(response.model); } catch { setError("Your choices could not be prepared. Please try again."); } finally { setBusy(false); }
  }
  function locate() {
    if (!navigator.geolocation) { setGeoMessage("Location isn’t available in this browser. You can enter your city instead."); return; }
    setGeoBusy(true); setGeoMessage("");
    navigator.geolocation.getCurrentPosition(position => { preference("location", { lat: position.coords.latitude, lng: position.coords.longitude }); setGeoMessage("Location added. It stays here unless you choose to open a map."); setGeoBusy(false); }, () => { setGeoMessage("Location wasn’t shared. You can still enter your city."); setGeoBusy(false); }, { timeout: 12000, maximumAge: 300000, enableHighAccuracy: false });
  }
  function finish() {
    if (!review || !model) return;
    const cleaned = review.signals.filter(s => s.text.trim()).map(s => ({ ...s, text: s.text.trim() }));
    if (cleaned.length < 3) { setError("Add at least three personal signs before saving. You can change or remove them later."); return; }
    const actions = review.helpfulActions.map(s => s.trim()).filter(Boolean);
    if (!actions.length) { setError("Add at least one thing that helps you."); return; }
    if (state.profile && !window.confirm("Replace the profile in this browser and clear its check-ins?")) return;
    if (update({ profile: { ...review, signals: cleaned, helpfulActions: actions }, model, checkins: [], consentAt: state.consentAt })) router.push("/checkin");
  }
  if (!ready) return <div className="page narrow loading">Opening your space…</div>;
  if (under18) return <div className="page narrow"><p className="eyebrow">Support is still here</p><h1 tabIndex={-1} ref={heading}>A different place to start.</h1><div className="panel"><p>This space is for adults 18 and older. You can talk to a trusted adult or reach Tele-MANAS for support.</p><a className="button" href="tel:14416"><Icon name="phone" size={16} />Call Tele-MANAS 14416</a><p className="helper" style={{ marginTop: 14 }}>Free · 24×7</p><button type="button" className="text-button" onClick={() => setUnder18(false)}>I chose the wrong option</button></div></div>;
  return <div className="page narrow"><p className="eyebrow">A beginning that feels like you</p><h1 tabIndex={-1} ref={heading} style={{ fontSize: "clamp(34px, 5vw, 46px)" }}>{review ? "Does this sound like you?" : ["Your space. Your choices.", "A little about your days.", "You know yourself best.", "Support that fits your life."][step]}</h1><p className="lead">{review ? "These are your words. Edit anything before saving it to this browser." : ["Before we begin, here’s what you’re choosing. Take your time.", "Over the last two weeks, how often have these felt true for you?", "A few words about what you notice and what helps. Nothing has to be perfectly worded.", "There’s no commitment to an appointment. These choices can change with you."][step]}</p>{!review && <div className="stepper" aria-label={`Step ${step + 1} of 4`}>{["Your choices", "Your days", "Your signs", "Your preferences"].map((label, i) => <span key={label} className={i <= step ? "active" : ""} aria-current={i === step ? "step" : undefined}>{i + 1}. {label}</span>)}</div>}
    <form className="panel" onSubmit={e => { e.preventDefault(); if (review) finish(); else void next(); }}>
      {!review && step === 0 && <><ConsentBlock values={consents} onChange={setConsents} /><div style={{ borderTop: "1px solid var(--line)", marginTop: 12, paddingTop: 10 }}><label className="checkbox-row"><input type="checkbox" checked={adult} onChange={e => setAdult(e.target.checked)} /><strong>I am 18 or older</strong></label><button type="button" className="text-button" onClick={() => { if (update({ profile: null, model: null, checkins: [], consentAt: null })) setUnder18(true); }}>I’m under 18</button></div></>}
      {!review && step === 1 && <>{wellbeing.map((item, i) => <fieldset key={item} className="wellbeing-row"><legend>{item}</legend><div className="scale">{scale.map((label, n) => <label key={label}><input type="radio" name={`wellbeing-${i}`} aria-label={`${item}: ${label}`} checked={who5[i] === n} onChange={() => setWho5(who5.map((v, index) => index === i ? n : v))} /><span>{label}</span></label>)}</div></fieldset>)}<p className="helper" style={{ marginTop: 18 }}>This is a starting point for your own reflection. No score or label is shown.</p></>}
      {!review && step === 2 && <><div className="field"><label htmlFor="name">What would you like to be called? <span className="muted">(optional)</span></label><input id="name" autoComplete="given-name" maxLength={80} value={name} onChange={e => setName(e.target.value)} /></div><div className="field"><label htmlFor="hard-day">What does a hard day look like for you?</label><textarea id="hard-day" maxLength={4000} value={hardDay} onChange={e => setHardDay(e.target.value)} placeholder="In your own words…" /></div><div className="field"><label htmlFor="early-signs">What are the early signs, before it gets bad?</label><textarea id="early-signs" maxLength={4000} value={signs} onChange={e => setSigns(e.target.value)} placeholder={"For example: staying up late, skipping meals, going quiet"} aria-describedby="signs-help" /><span id="signs-help" className="helper">Add at least three signs, separated by commas or new lines. You’ll review them next.</span></div><div className="field"><label htmlFor="helpful-actions">What usually helps?</label><textarea id="helpful-actions" maxLength={4000} value={helps} onChange={e => setHelps(e.target.value)} placeholder="A short walk, a familiar meal, calling someone…" /><span className="helper">Separate ideas with commas or new lines.</span></div><details><summary className="field-label" style={{ cursor: "pointer", padding: "10px 0" }}>Someone you trust <span className="muted">(optional)</span></summary><div className="grid-two" style={{ marginTop: 14 }}><div className="field"><label htmlFor="trusted-name">Their name</label><input id="trusted-name" maxLength={80} value={trusted.name} onChange={e => setTrusted({ ...trusted, name: e.target.value })} /></div><div className="field"><label htmlFor="trusted-relation">Your relationship</label><input id="trusted-relation" maxLength={80} value={trusted.relation} onChange={e => setTrusted({ ...trusted, relation: e.target.value })} /></div></div><div className="field"><label htmlFor="trusted-phone">Their phone <span className="muted">(optional)</span></label><input id="trusted-phone" type="tel" maxLength={30} value={trusted.phone} onChange={e => setTrusted({ ...trusted, phone: e.target.value })} /><span className="helper">We never contact them. Calling or messaging is always your choice.</span></div></details></>}
      {!review && step === 3 && <><fieldset className="field"><legend className="field-label" style={{ marginBottom: 12 }}>Languages you’re comfortable with</legend><div className="chips">{languages.map(language => <button type="button" key={language} className="chip" aria-pressed={prefs.languages.includes(language)} onClick={() => preference("languages", prefs.languages.includes(language) ? prefs.languages.filter(l => l !== language) : [...prefs.languages, language])}>{prefs.languages.includes(language) && <Icon name="check" size={13} />}{language}</button>)}</div></fieldset><div className="field"><label htmlFor="budget">Budget per session: {prefs.budgetPerSession === 0 ? "Free only" : `up to ₹${prefs.budgetPerSession.toLocaleString("en-IN")}`}</label><input id="budget" type="range" min="0" max="3000" step="100" value={prefs.budgetPerSession} onChange={e => preference("budgetPerSession", Number(e.target.value))} /><div className="actions" style={{ justifyContent: "space-between" }}><span className="helper">₹0 · Free only</span><span className="helper">₹3,000</span></div></div><div className="grid-two"><div className="field"><label htmlFor="mode">How would you like to talk?</label><select id="mode" value={prefs.mode} onChange={e => preference("mode", e.target.value as Preferences["mode"])}><option value="either">Either is fine</option><option value="online">Online</option><option value="in_person">In person</option></select></div><div className="field"><label htmlFor="gender">Provider preference</label><select id="gender" value={prefs.providerGender} onChange={e => preference("providerGender", e.target.value as Preferences["providerGender"])}><option value="any">No gender preference</option><option value="female">Female</option><option value="male">Male</option></select></div></div><div className="field"><label htmlFor="readiness">What feels right at the moment?</label><select id="readiness" value={prefs.readiness} onChange={e => preference("readiness", e.target.value as Preferences["readiness"])}><option value="tips_first">Small steps for myself first</option><option value="talk_to_someone">Talk to someone</option><option value="see_professional">Explore professional support</option></select></div><div className="field"><label htmlFor="city">Your city</label><input id="city" autoComplete="address-level2" maxLength={100} value={prefs.city} onChange={e => preference("city", e.target.value)} placeholder="For example, Chennai" /></div><div className="actions"><button type="button" disabled={geoBusy} className="button secondary" onClick={locate}><Icon name="pin" size={16} />{geoBusy ? "Finding your location…" : prefs.location ? "Update my location" : "Use my location"}</button>{prefs.location && <button type="button" className="text-button" onClick={() => { preference("location", null); setGeoMessage("Location removed."); }}>Remove location</button>}</div>{geoMessage && <p className="helper" role="status" style={{ marginTop: 10 }}>{geoMessage}</p>}<p className="helper" style={{ marginTop: 14 }}>Your city is enough. Precise location is optional.</p></>}
      {review && <><div className="notice" style={{ marginBottom: 24 }}>Your words are organised using simple rules. This profile stays only in this tab’s memory and clears on refresh.</div><EditableChipList label="Your early signs" values={review.signals.map(s => s.text)} onChange={values => setReview({ ...review, signals: values.map((text, i) => ({ id: review.signals[i]?.id ?? crypto.randomUUID(), text, source: "survey", count: 0, active: true })) })} /><p className="helper">Keep at least three signs to start. You can change them later.</p><EditableChipList label="What helps you" values={review.helpfulActions} onChange={values => setReview({ ...review, helpfulActions: values })} /><p className="helper">Preferences: {review.prefs.languages.join(", ")} · {review.prefs.budgetPerSession === 0 ? "Free only" : `Up to ₹${review.prefs.budgetPerSession}`} · {review.prefs.city || "Your chosen location"}</p></>}
      {error && <p role="alert" className="status">{error}</p>}<div className="button-row">{review ? <button type="button" className="text-button" onClick={() => { setReview(null); setError(""); }}>Edit my answers</button> : step > 0 ? <button type="button" className="text-button" onClick={() => { setStep(step - 1); setError(""); }}>Back</button> : <span className="helper"><Icon name="lock" size={14} /></span>}<button type="submit" className="button" disabled={busy}>{busy ? <><span className="spinner" />Preparing…</> : review ? "Save and begin" : step === 3 ? "Review my choices" : "Continue"}<Icon name="arrow" size={15} /></button></div>
    </form><p className="helper" style={{ textAlign: "center", marginTop: 20 }}>You can edit your signs or delete your data at any time.</p></div>;
}
