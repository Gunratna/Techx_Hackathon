"use client";
import Link from "next/link";
import { useApp } from "./AppShell";
export function RequireProfile({ children }: { children: React.ReactNode }) {
  const { state, ready } = useApp();
  if (!ready) return <div className="page narrow loading" role="status">Opening your space…</div>;
  if (!state.profile || !state.consentAt) return <div className="page narrow"><p className="eyebrow">A little about you</p><h1>Let’s start with your choices.</h1><p className="lead">Confirm you’re 18 or older and choose what feels right before adding a check-in.</p><Link className="button" href="/onboarding">Get started</Link></div>;
  return <>{children}</>;
}
