"use client";
export const CONSENT_ITEMS = [
  "My profile, check-ins and preferences stay in this browser. Clearing browser storage removes them.",
  "This version uses local templates. My notes are not sent to an AI provider or cloud database.",
  "If I choose to open a map or search with my location, that information is shared with Google.",
  "This offers options for support. It does not give a medical assessment or replace a professional.",
  "This is not a crisis service. The “Need help now?” button opens phone numbers for immediate support.",
];
export function ConsentBlock({ values, onChange }: { values: boolean[]; onChange: (values: boolean[]) => void }) {
  return <fieldset><legend className="field-label">Your choices come first</legend>{CONSENT_ITEMS.map((item, i) => <label className="checkbox-row" key={item}><input type="checkbox" checked={values[i]} onChange={e => onChange(values.map((v, index) => index === i ? e.target.checked : v))} /><span>{item}</span></label>)}</fieldset>;
}
