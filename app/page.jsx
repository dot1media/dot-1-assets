"use client";
import React, { useState, useEffect } from "react";
import { Boxes, ChevronDown, Plus, LogOut, Sun, Moon } from "lucide-react";
import { INK, BODY, STONE, FAINT, LINE, PAPER, CREAM, RED, SOLID, ACCENT, SHADOW, SHADOW_SM, SHADOW_LG, R, R_LG, R_SM, display, mono, sans, btnSolid, tx } from "../lib/assets/theme";
import { PortalSignIn } from "../lib/assets/Auth";
import Dashboard from "../lib/assets/Dashboard";
import Inventory from "../lib/assets/Inventory";
import Lifecycle from "../lib/assets/Lifecycle";
import Packages from "../lib/assets/Packages";
import CheckedOut from "../lib/assets/CheckedOut";
import AssetDetail from "../lib/assets/AssetDetail";

export default function Page() {
  const [ready, setReady] = useState(false);
  const [admin, setAdmin] = useState(null);
  const [setupNeeded, setSetupNeeded] = useState(false);
  const [businesses, setBusinesses] = useState([]);
  const [bizId, setBizId] = useState(null);
  const [assets, setAssets] = useState([]);
  const [view, setView] = useState("dashboard");
  const [selected, setSelected] = useState(undefined);
  const [toast, setToast] = useState("");
  const [bizMenu, setBizMenu] = useState(false);
  const [dark, setDark] = useState(false);

  const showToast = (m) => { setToast(m); setTimeout(() => setToast(""), 2600); };

  useEffect(() => { setDark(document.documentElement.getAttribute("data-theme") === "dark"); }, []);
  const toggleTheme = () => {
    const nd = !dark; setDark(nd);
    const el = document.documentElement;
    if (nd) el.setAttribute("data-theme", "dark"); else el.removeAttribute("data-theme");
    try { localStorage.setItem("d1-theme", nd ? "dark" : "light"); } catch (e) {}
  };

  const loadAssets = async (id) => {
    if (!id) { setAssets([]); return; }
    try { const d = await fetch("/api/assets?business_id=" + id).then((r) => r.json()); setAssets(d.assets || []); } catch (e) {}
  };

  const boot = async () => {
    try {
      const me = await fetch("/api/me").then((r) => r.json()).catch(() => ({}));
      if (me && me.admin) {
        setAdmin(me.admin);
        const biz = me.businesses || []; setBusinesses(biz);
        const first = biz.length ? biz[0].id : null; setBizId(first);
        if (first) await loadAssets(first);
      }
    } catch (e) {}
    setReady(true);
  };
  useEffect(() => { boot(); }, []);

  const switchBiz = (id) => { setBizId(id); setBizMenu(false); setView("dashboard"); loadAssets(id); };

  const addBusiness = async () => {
    const name = window.prompt("New business name:");
    if (!name || !name.trim()) return;
    try {
      const d = await fetch("/api/businesses", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ name: name.trim() }) }).then((r) => r.json());
      if (d.business) { const nb = [...businesses, d.business].sort((a, b) => a.name.localeCompare(b.name)); setBusinesses(nb); switchBiz(d.business.id); showToast("Business added."); }
      else showToast("Could not add business.");
    } catch (e) { showToast("Could not add business."); }
  };

  const signOut = async () => { try { await fetch("/api/logout", { method: "POST" }); } catch (e) {} window.location.reload(); };

  const onSaved = (asset) => {
    setSelected(undefined);
    if (asset) setAssets((prev) => { const i = prev.findIndex((x) => x.id === asset.id); if (i >= 0) { const c = [...prev]; c[i] = asset; return c; } return [...prev, asset]; });
    else loadAssets(bizId);
  };
  const onDeleted = (id) => { setSelected(undefined); setAssets((prev) => prev.filter((x) => x.id !== id)); };

  if (!ready) return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", ...mono, color: FAINT, fontSize: 13 }}>Loading...</div>;
  if (!admin) return <PortalSignIn />;

  const currentBiz = businesses.find((b) => b.id === bizId);
  const TABS = [["dashboard", "Dashboard"], ["inventory", "Inventory"], ["lifecycle", "Lifecycle"], ["packages", "Packages"], ["checkouts", "Checked out"]];

  return (
    <div style={{ minHeight: "100vh", ...sans }}>
      <div style={{ background: "var(--nav)", backdropFilter: "saturate(180%) blur(20px)", WebkitBackdropFilter: "saturate(180%) blur(20px)", borderBottom: `1px solid ${LINE}`, position: "sticky", top: 0, zIndex: 40, transition: tx("background", "border-color") }}>
        <div style={{ maxWidth: 1160, margin: "0 auto", padding: "0 24px", display: "flex", alignItems: "center", gap: 14, height: 62 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 31, height: 31, borderRadius: 9, background: SOLID, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: SHADOW_SM }}><Boxes size={17} color="#fff" /></div>
            <span style={{ ...display, fontSize: 18, fontWeight: 700, color: INK, letterSpacing: "0.01em" }}>Assets</span>
          </div>
          <div style={{ position: "relative" }}>
            <button onClick={() => setBizMenu((v) => !v)} style={{ display: "flex", alignItems: "center", gap: 8, background: CREAM, border: `1px solid ${LINE}`, borderRadius: 10, padding: "7px 12px", cursor: "pointer", ...mono, fontSize: 12, color: INK, transition: tx("border-color", "background") }}>
              <span style={{ width: 7, height: 7, borderRadius: 4, background: currentBiz?.accent || RED }} />
              {currentBiz?.name || "Select"} <ChevronDown size={13} />
            </button>
            {bizMenu && (
              <div style={{ position: "absolute", top: 44, left: 0, background: PAPER, border: `1px solid ${LINE}`, borderRadius: 12, boxShadow: SHADOW, minWidth: 214, padding: 6, zIndex: 50 }}>
                {businesses.map((b) => (
                  <div key={b.id} onClick={() => switchBiz(b.id)} style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 10px", borderRadius: 8, cursor: "pointer", background: b.id === bizId ? CREAM : "transparent", fontSize: 13, color: INK }}>
                    <span style={{ width: 7, height: 7, borderRadius: 4, background: b.accent || RED }} />{b.name}
                  </div>
                ))}
                <div onClick={addBusiness} style={{ display: "flex", alignItems: "center", gap: 7, padding: "9px 10px", borderRadius: 8, cursor: "pointer", borderTop: `1px solid ${LINE}`, marginTop: 4, ...mono, fontSize: 11.5, color: STONE }}><Plus size={13} /> Add business</div>
              </div>
            )}
          </div>
          <div style={{ flex: 1 }} />
          <div style={{ display: "flex", background: CREAM, border: `1px solid ${LINE}`, borderRadius: 11, padding: 3, gap: 2 }}>
            {TABS.map(([k, l]) => (
              <button key={k} onClick={() => setView(k)} style={{ ...mono, fontSize: 11.5, letterSpacing: "0.03em", color: view === k ? INK : STONE, background: view === k ? PAPER : "transparent", boxShadow: view === k ? SHADOW_SM : "none", border: "none", borderRadius: 8, padding: "7px 13px", cursor: "pointer", transition: tx("color", "background", "box-shadow") }}>{l}</button>
            ))}
          </div>
          <button onClick={() => setSelected(null)} style={{ ...btnSolid, padding: "9px 15px", fontSize: 12.5 }}><Plus size={15} /> Add asset</button>
          <button onClick={toggleTheme} title="Toggle theme" style={{ background: "transparent", border: "none", cursor: "pointer", color: STONE, padding: 7, borderRadius: 8, display: "grid", placeItems: "center", transition: tx("color", "background") }}>{dark ? <Sun size={17} /> : <Moon size={17} />}</button>
          <div title={"Signed in as " + (admin?.email || "")} style={{ display: "flex", alignItems: "center", gap: 8, paddingLeft: 8, borderLeft: `1px solid ${LINE}` }}>
            <div style={{ width: 28, height: 28, borderRadius: "50%", background: SOLID, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", ...mono, fontSize: 11.5, textTransform: "uppercase", flexShrink: 0 }}>{(admin?.email || "?").charAt(0)}</div>
          </div>
          <button onClick={signOut} title="Sign out" style={{ background: "transparent", border: "none", cursor: "pointer", color: STONE, padding: 6, borderRadius: 8, display: "grid", placeItems: "center", transition: tx("color", "background") }}><LogOut size={17} /></button>
        </div>
      </div>

      <div style={{ maxWidth: 1160, margin: "0 auto", padding: "28px 24px 72px" }}>
        <div style={{ marginBottom: 22 }} className="d1-rise">
          <div style={{ ...mono, fontSize: 10.5, letterSpacing: "0.14em", textTransform: "uppercase", color: FAINT }}>Asset Management</div>
          <div style={{ ...display, fontSize: 28, fontWeight: 700, color: INK, marginTop: 4, letterSpacing: "-0.01em" }}>{currentBiz?.name || "Assets"}</div>
        </div>
        {view === "dashboard" && <Dashboard assets={assets} onOpenAsset={setSelected} onGoLifecycle={() => setView("lifecycle")} />}
        {view === "inventory" && <Inventory assets={assets} onOpenAsset={setSelected} />}
        {view === "lifecycle" && <Lifecycle assets={assets} onOpenAsset={setSelected} />}
        {view === "packages" && <Packages assets={assets} businessId={bizId} showToast={showToast} />}
        {view === "checkouts" && <CheckedOut businessId={bizId} showToast={showToast} />}
      </div>

      {selected !== undefined && <AssetDetail asset={selected} businessId={bizId} categories={Array.from(new Set(assets.map((a) => a.category).filter(Boolean))).sort()} onClose={() => setSelected(undefined)} onSaved={onSaved} onDeleted={onDeleted} showToast={showToast} />}
      {toast && <div style={{ position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", background: "var(--toast)", color: "var(--toast-fg)", padding: "12px 20px", borderRadius: 12, fontSize: 13, zIndex: 200, boxShadow: SHADOW_LG }}>{toast}</div>}
    </div>
  );
}
