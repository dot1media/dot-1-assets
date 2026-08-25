import React from "react";
import { Boxes } from "lucide-react";
import { RED, INK, BODY, STONE, FAINT, LINE, PAPER, CREAM, SOLID, display, mono, sans, inputStyle, btnSolid, btnGhost } from "./theme";

function Shell({ title, subtitle, children }) {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, ...sans }}>
      <div style={{ width: "100%", maxWidth: 400 }}>
        <div style={{ textAlign: "center", marginBottom: 26 }}>
          <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 46, height: 46, borderRadius: 12, background: SOLID, marginBottom: 14 }}><Boxes size={24} color="#fff" /></div>
          <div style={{ ...display, fontSize: 30, fontWeight: 700, color: INK, letterSpacing: "-0.01em" }}>{title}</div>
          <div style={{ fontSize: 13.5, color: STONE, marginTop: 6, lineHeight: 1.5 }}>{subtitle}</div>
        </div>
        <div style={{ background: PAPER, border: `1px solid ${LINE}`, borderRadius: 14, padding: "24px 26px" }}>{children}</div>
        <div style={{ ...mono, fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: FAINT, textAlign: "center", marginTop: 20 }}>Dot One · Asset Management</div>
      </div>
    </div>
  );
}

// Asset Management no longer has its own login. Access is the shared Dot One account, so an
// unauthenticated visitor is pointed to the portal to sign in once.
export function PortalSignIn() {
  return (
    <Shell title="Sign in" subtitle="Asset Management uses your Dot One account. Sign in once at the portal and you are recognized here too.">
      <a href="https://portal.dot1.media" style={{ ...btnSolid, background: SOLID, width: "100%", justifyContent: "center", textDecoration: "none", boxSizing: "border-box" }}>Go to the Dot One portal</a>
      <button onClick={() => window.location.reload()} style={{ ...btnGhost, width: "100%", justifyContent: "center", marginTop: 10 }}>I have signed in, reload</button>
      <div style={{ fontSize: 12, color: FAINT, marginTop: 16, lineHeight: 1.55, textAlign: "center" }}>One account for the portal, assets, and news.</div>
    </Shell>
  );
}
