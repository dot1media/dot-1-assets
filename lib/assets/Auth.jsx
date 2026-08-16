import React, { useState } from "react";
import { Boxes } from "lucide-react";
import { RED, INK, BODY, STONE, FAINT, LINE, PAPER, CREAM, display, mono, sans, inputStyle, btnSolid } from "./theme";

function Shell({ title, subtitle, children }) {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, ...sans }}>
      <div style={{ width: "100%", maxWidth: 400 }}>
        <div style={{ textAlign: "center", marginBottom: 26 }}>
          <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 46, height: 46, borderRadius: 12, background: INK, marginBottom: 14 }}><Boxes size={24} color="#fff" /></div>
          <div style={{ ...display, fontSize: 30, fontWeight: 700, color: INK, letterSpacing: "-0.01em" }}>{title}</div>
          <div style={{ fontSize: 13.5, color: STONE, marginTop: 6, lineHeight: 1.5 }}>{subtitle}</div>
        </div>
        <div style={{ background: PAPER, border: `1px solid ${LINE}`, borderRadius: 14, padding: "24px 26px" }}>{children}</div>
        <div style={{ ...mono, fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: FAINT, textAlign: "center", marginTop: 20 }}>Dot One · Asset Management</div>
      </div>
    </div>
  );
}

export function SetupScreen({ onDone }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const submit = async () => {
    setErr("");
    if (pw.length < 8) { setErr("Password must be at least 8 characters."); return; }
    setBusy(true);
    try {
      const res = await fetch("/api/setup", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ name, email, password: pw, setupCode: code }) });
      const data = await res.json().catch(() => ({}));
      if (res.ok) { onDone(); } else { setErr(data.error || "Setup failed."); setBusy(false); }
    } catch (e) { setErr("Network error."); setBusy(false); }
  };
  return (
    <Shell title="Set up your workspace" subtitle="Create your owner account. We'll load your Dot One Media inventory automatically.">
      <div style={{ ...mono, fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: STONE, marginBottom: 3 }}>Your name</div>
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Dennis Matthews Jr." style={inputStyle} />
      <div style={{ ...mono, fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: STONE, margin: "14px 0 3px" }}>Email</div>
      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@dot1.media" style={inputStyle} />
      <div style={{ ...mono, fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: STONE, margin: "14px 0 3px" }}>Password</div>
      <input type="password" value={pw} onChange={(e) => setPw(e.target.value)} placeholder="At least 8 characters" style={inputStyle} />
      <div style={{ ...mono, fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: STONE, margin: "14px 0 3px" }}>Setup code <span style={{ color: FAINT, textTransform: "none", letterSpacing: 0 }}>(if you set one)</span></div>
      <input value={code} onChange={(e) => setCode(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") submit(); }} placeholder="Leave blank if not configured" style={inputStyle} />
      {err && <div style={{ color: RED, fontSize: 12.5, marginTop: 12 }}>{err}</div>}
      <button onClick={submit} disabled={busy} style={{ ...btnSolid, width: "100%", justifyContent: "center", marginTop: 18, padding: "12px", background: busy ? FAINT : RED }}>{busy ? "Setting up your inventory..." : "Create workspace"}</button>
    </Shell>
  );
}

export function LoginScreen({ onDone }) {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const submit = async () => {
    setErr("");
    setBusy(true);
    try {
      const res = await fetch("/api/login", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email, password: pw }) });
      const data = await res.json().catch(() => ({}));
      if (res.ok) { onDone(); } else { setErr(data.error || "Sign in failed."); setBusy(false); }
    } catch (e) { setErr("Network error."); setBusy(false); }
  };
  return (
    <Shell title="Dot One Assets" subtitle="Sign in to manage your equipment and lifecycle.">
      <div style={{ ...mono, fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: STONE, marginBottom: 3 }}>Email</div>
      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@dot1.media" style={inputStyle} />
      <div style={{ ...mono, fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: STONE, margin: "14px 0 3px" }}>Password</div>
      <input type="password" value={pw} onChange={(e) => setPw(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") submit(); }} placeholder="Your password" style={inputStyle} />
      {err && <div style={{ color: RED, fontSize: 12.5, marginTop: 12 }}>{err}</div>}
      <button onClick={submit} disabled={busy} style={{ ...btnSolid, width: "100%", justifyContent: "center", marginTop: 18, padding: "12px", background: busy ? FAINT : RED }}>{busy ? "Signing in..." : "Sign in"}</button>
    </Shell>
  );
}

