"use client";
import { useEffect, useRef } from "react";
import { Icon } from "./Icon";

// Fixed content: generated content must never replace emergency help.
export function CrisisModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => { const dialog = ref.current; if (open && dialog && !dialog.open) dialog.showModal(); else if (!open && dialog?.open) dialog.close(); }, [open]);
  return <dialog ref={ref} aria-labelledby="crisis-title" aria-describedby="crisis-description" onClose={onClose}><button type="button" autoFocus className="icon-button crisis-close" aria-label="Close help panel" onClick={onClose}><Icon name="close" /></button><p className="eyebrow">Help is here</p><h2 id="crisis-title" className="crisis-heading">You don’t have to face this alone.</h2><p id="crisis-description">If you might act on thoughts of harming yourself, call now or go to the nearest hospital emergency department.</p><a className="crisis-call" href="tel:14416"><span>Tele-MANAS</span><strong>14416</strong><small>Free · 24×7 · 20 languages</small></a><a className="crisis-call" href="tel:18008914416"><span>Tele-MANAS alternate number</span><strong>1-800-891-4416</strong></a><a className="crisis-call" href="tel:112"><span>Emergency</span><strong>112</strong></a><a className="button secondary" href="https://www.google.com/maps/search/hospital+emergency+near+me" target="_blank" rel="noopener noreferrer"><Icon name="pin" />Nearest hospital emergency</a><p className="helper" style={{ marginTop: 18, marginBottom: 0 }}>Calling or opening Maps is your choice. Nothing is sent automatically.</p></dialog>;
}
