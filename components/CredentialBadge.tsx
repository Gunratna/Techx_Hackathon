import type { Provider } from "@/lib/types";
import { Icon } from "./Icon";
export function CredentialBadge({ provider }: { provider: Provider }) {
  if (provider.isDemoListing) return <div><span className="badge demo-badge">Demo listing · Fictional</span><p className="helper" style={{ marginTop: 6, marginBottom: 0 }}>An example for exploring fit. This is not a real provider; any registration status is illustrative.</p></div>;
  if (provider.credential === "public_service") return <span className="badge"><Icon name="check" size={12} />Public service</span>;
  if (provider.credential === "verified" && provider.source !== "google") return <span className="badge"><Icon name="check" size={12} />Verified</span>;
  return <div className="credential-unknown">Credentials not verified, check <a href="https://rehabcouncil.nic.in" target="_blank" rel="noopener noreferrer">RCI</a> / <a href="https://www.nmc.org.in" target="_blank" rel="noopener noreferrer">NMC</a>.</div>;
}
