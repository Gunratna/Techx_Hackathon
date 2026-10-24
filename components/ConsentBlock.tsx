"use client";
export const CONSENT_ITEMS = [
  "My profile, check-ins and preferences stay in this tab’s memory. Refreshing or closing the page clears them.",
  "When I submit, my notes are processed briefly by this app’s stateless API using limited rules and templates. No AI provider or database is used.",
  "If I choose to open a map or search with my location, that information is shared with Google.",
  "This offers options for support. It does not give a medical assessment or replace a professional.",
  "This is not a crisis service. The “Need help now?” button opens phone numbers for immediate support.",
];
export function ConsentBlock({ values, onChange }: { values: boolean[]; onChange: (values: boolean[]) => void }) {
  return <fieldset><legend className="field-label">Your choices come first</legend>{CONSENT_ITEMS.map((item, i) => <label className="checkbox-row" key={item}><input type="checkbox" checked={values[i]} onChange={e => onChange(values.map((v, index) => index === i ? e.target.checked : v))} /><span>{item}</span></label>)}</fieldset>;
}
