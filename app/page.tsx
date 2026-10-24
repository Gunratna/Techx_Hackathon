"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { BRAND } from "@/lib/brand";
import { loadDemo } from "@/lib/store";
import { useApp } from "@/components/AppShell";
import { Icon } from "@/components/Icon";

export default function Home() {
  const { state, ready, reload } = useApp();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function demo() {
    if (!state.consentAt) { router.push("/onboarding?demo=1"); return; }
    if (state.profile && !window.confirm("Replace the profile and check-ins in this browser with fictional demo data?")) return;
    setBusy(true); setError("");
    try { await loadDemo(); reload(); router.push("/checkin"); } catch (e) { setError(e instanceof Error ? e.message : "The demo could not be opened."); } finally { setBusy(false); }
  }
  return <div className="page">
    <section className="hero" aria-labelledby="welcome-title">
      <div><p className="eyebrow">A small beginning, a little support</p><h1 id="welcome-title">A little clarity.<br />One gentle step.</h1><p className="lead">Some days feel a little different. Make room to notice, find what helps, and reach the right person when you’re ready.</p><p className="helper" style={{ marginBottom: 24 }}>{BRAND.tagline}</p><div className="actions"><Link className="button" href={ready && state.profile && state.consentAt ? "/checkin" : "/onboarding"}>{ready && state.profile && state.consentAt ? "Your daily check-in" : "Get started"}<Icon name="arrow" size={16} /></Link><button className="button secondary" disabled={!ready || busy} onClick={demo}>{busy ? <><span className="spinner" />Opening demo…</> : "Load demo user"}</button></div><p className="helper" style={{ marginTop: 16 }}>For adults 18+ · No account needed · Your pace, always</p>{error && <p className="status" role="status">{error}</p>}</div>
      <div className="hero-art" aria-hidden="true"><div className="arch"><svg viewBox="0 0 265 330" fill="none"><circle cx="159" cy="86" r="35" fill="#d4dfca" /><path d="M-20 278C70 220 179 222 290 286v60H-20Z" fill="#c7d8bc" /><path d="M-10 318c65-64 118-57 200-12l88 35H-10Z" fill="#b0c9a4" /><path d="M115 273c0-64 37-107 42-165M132 218c-36 4-49-16-50-33 33-4 53 7 50 33ZM146 178c38 3 57-19 56-39-30 0-50 14-56 39ZM154 143c-25-4-36-23-32-42 28 3 38 18 32 42Z" stroke="#648161" strokeWidth="2" strokeLinecap="round" /><path d="M107 312c10-18 30-21 42-17m-37 2c-9-12-21-17-35-11" stroke="#648161" strokeWidth="2" strokeLinecap="round" /></svg></div><div className="art-note top"><span className="badge">A MOMENT FOR YOU</span><strong style={{ marginTop: 9 }}>How has today felt?</strong><span className="muted">A few words is enough.</span></div><div className="art-note bottom"><strong>Little steps count.</strong><span className="muted">A walk. A meal. A hello.</span><div style={{ height: 4, borderRadius: 4, background: "#e3eadd", marginTop: 12 }}><div style={{ width: "60%", height: "100%", background: "#9bb28d", borderRadius: 4 }} /></div></div></div>
    </section>
    <section className="journey" aria-label="Your path to support">{[["01", "Notice your days", "A short check-in, in your own words. No perfect answers."], ["02", "Find your next step", "Start with what helps you, with room to choose something else."], ["03", "Reach someone, prepared", "Explore support and bring your own words to a first conversation."]].map(([n, title, body]) => <div className="journey-item" key={n}><div className="journey-num">{n}</div><h3>{title}</h3><p>{body}</p></div>)}</section>
    <div className="notice"><div className="actions" style={{ alignItems: "flex-start", flexWrap: "nowrap" }}><Icon name="lock" /><div><strong style={{ fontSize: 13 }}>A space that belongs to you.</strong><p style={{ marginTop: 4 }}>Your notes stay in this browser. This version uses local templates, with no AI or cloud storage. You choose what to copy or share.</p></div></div></div><p className="helper" style={{ marginTop: 18 }}>Not a therapist. Not for emergencies. The demo user, Ananya, is fictional.</p>
  </div>;
}
