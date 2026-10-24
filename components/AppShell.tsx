"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { load, reset, save } from "@/lib/store";
import type { AppState } from "@/lib/types";
import { Header } from "./Header";
import { CrisisModal } from "./CrisisModal";
import { Icon } from "./Icon";

const initial: AppState = { profile: null, model: null, checkins: [], consentAt: null };
const Context = createContext<{ state: AppState; ready: boolean; update: (next: AppState) => boolean; reload: () => void; openCrisis: () => void } | null>(null);
export function useApp() { const app = useContext(Context); if (!app) throw new Error("Missing app shell"); return app; }
export function AppShell({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(initial);
  const [ready, setReady] = useState(false);
  const [crisis, setCrisis] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  useEffect(() => { setState(load()); setReady(true); const sync = () => setState(load()); window.addEventListener("storage", sync); return () => window.removeEventListener("storage", sync); }, []);
  function update(next: AppState) { if (!save(next)) { setError("Your browser could not save this. Please allow local storage and try again."); return false; } setState(next); setError(""); return true; }
  function deleteData() { if (!window.confirm("Delete your profile, check-ins and preferences from this browser? This cannot be undone.")) return; if (!reset()) { setError("Your browser could not delete this data. Please try again in browser settings."); return; } setState(initial); router.push("/"); }
  return <Context.Provider value={{ state, ready, update, reload: () => setState(load()), openCrisis: () => setCrisis(true) }}><a className="skip-link" href="#main-content">Skip to content</a><Header onCrisis={() => setCrisis(true)} /><main id="main-content">{error && <div className="page" style={{ paddingBottom: 0, minHeight: 0 }}><p role="alert" className="status">{error}</p></div>}{children}</main><footer className="site-footer"><span className="footer-detail"><Icon name="lock" size={13} />Your space. Your pace. Your data stays in this browser.</span><span>For adults 18+ · Not a therapist. Not for emergencies.</span><button className="text-button footer-delete" onClick={deleteData}>Delete all my data</button></footer><CrisisModal open={crisis} onClose={() => setCrisis(false)} /></Context.Provider>;
}
