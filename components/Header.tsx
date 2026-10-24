"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BRAND } from "@/lib/brand";
import { Icon } from "./Icon";

export function Brand() {
  return <span className="brand"><svg className="brand-mark" viewBox="0 0 32 36" fill="none" aria-hidden="true"><path d="M5 29C5 16 25 18 25 5M10 32C10 20 29 21 29 9M16 23C3 24 2 12 3 6c12 0 18 5 13 17Z" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /><path d="m5 8 11 15" stroke="currentColor" strokeWidth="1.3" /></svg>{BRAND.name}</span>;
}
export function Header({ onCrisis }: { onCrisis: () => void }) {
  const path = usePathname();
  return <header className="site-header"><div className="header-inner"><Link href="/" aria-label={`${BRAND.name} home`}><Brand /></Link><nav className="nav" aria-label="Main navigation">{[["/checkin", "Check-in"], ["/care-path", "Care Path"], ["/find-help", "Find Help"], ["/insights", "Insights"]].map(([url, label]) => <Link key={url} href={url} aria-current={path === url ? "page" : undefined}>{label}</Link>)}</nav><button type="button" className="crisis-button" onClick={onCrisis}><Icon name="phone" size={14} />Need help now?</button></div></header>;
}
