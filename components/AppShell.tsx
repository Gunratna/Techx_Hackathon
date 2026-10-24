"use client";
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
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
  const deletion = useRef<HTMLDialogElement>(null);
  const openCrisis = useCallback(() => setCrisis(true), []);
  const router = useRouter();
  useEffect(() => { setState(load()); setReady(true); }, []);
  const latest = state.checkins[state.checkins.length - 1];
  useEffect(() => { if (latest?.features?.safety === "urgent") openCrisis(); }, [latest?.id, latest?.features?.safety, openCrisis]);
  function update(next: AppState) { if (!save(next)) { setError("This tab could not keep your changes. Please try again."); return false; } setState(load()); setError(""); return true; }
  function deleteData() { reset(); setState(initial); setError(""); setCrisis(false); deletion.current?.close(); router.push("/"); }
  return <Context.Provider value={{ state, ready, update, reload: () => setState(load()), openCrisis }}>
    <a className="skip-link" href="#main-content">Skip to content</a><Header onCrisis={openCrisis} />
    <main id="main-content">{error && <div className="page" style={{ paddingBottom: 0, minHeight: 0 }}><p role="alert" className="status">{error}</p></div>}{children}</main>
    <footer className="site-footer"><span className="footer-detail"><Icon name="lock" size={13} />Only in this tab’s memory. Refreshing clears your space.</span><span>For adults 18+ · Not a therapist. Not for emergencies.</span><button className="text-button footer-delete" onClick={() => deletion.current?.showModal()}>Delete all my data</button></footer>
    <CrisisModal open={crisis} onClose={() => setCrisis(false)} />
    <dialog ref={deletion} aria-labelledby="delete-title" className="plain-dialog"><h2 id="delete-title">Clear your space?</h2><p>Your profile, check-ins and preferences will be removed from this tab. This can’t be undone.</p><div className="actions"><button type="button" className="button secondary" onClick={() => deletion.current?.close()}>Keep my data</button><button type="button" className="button" onClick={deleteData}>Yes, delete my data</button></div></dialog>
  </Context.Provider>;
}
