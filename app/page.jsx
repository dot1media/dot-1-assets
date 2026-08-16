"use client";
import React, { useState, useEffect } from "react";
import { Boxes, ChevronDown, Plus, LogOut } from "lucide-react";
import { INK, BODY, STONE, FAINT, LINE, PAPER, CREAM, RED, display, mono, sans, btnSolid } from "../lib/assets/theme";
import { PortalSignIn } from "../lib/assets/Auth";
import Dashboard from "../lib/assets/Dashboard";
import Inventory from "../lib/assets/Inventory";
import Lifecycle from "../lib/assets/Lifecycle";
import AssetDetail from "../lib/assets/AssetDetail";

export default function Page() {
  const [ready, setReady] = useState(false);
  const [admin, setAdmin] = useState(null);
  const [setupNeeded, setSetupNeeded] = useState(false);
  const [businesses, setBusinesses] = useState([]);
  const [bizId, setBizId] = useState(null);
  const [assets, setAssets] = useState([]);
  const [view, setView] = useState("dashboard");
  const [selected, setSelected] = useState(undefined); // undefined = closed, null = new, object = edit
  const [toast, setToast] = useState("");
  const [bizMenu, setBizMenu] = useState(false);

  const showToast = (m) => { setToast(m); setTimeout(() => setToast(""), 2600); };

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

  return (
    <div style={{ minHeight: "100vh", ...sans }}>
      <div style={{ background: PAPER, borderBottom: `1px solid ${LINE}`, position: "sticky", top: 0, zIndex: 40 }}>
        <div style={{ maxWidth: 1120, margin: "0 auto", padding: "0 24px", display: "flex", alignItems: "center", gap: 16, height: 60 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: INK, display: "flex", alignItems: "center", justifyContent: "center" }}><Boxes size={17} color="#fff" /></div>
            <span style={{ ...display, fontSize: 18, fontWeight: 700, color: INK }}>Assets</span>
          </div>
          <div style={{ position: "relative" }}>
            <button onClick={() => setBizMenu((v) => !v)} style={{ display: "flex", alignItems: "center", gap: 7, background: CREAM, border: `1px solid ${LINE}`, borderRadius: 9, padding: "7px 12px", cursor: "pointer", ...mono, fontSize: 12, color: INK }}>
              <span style={{ width: 7, height: 7, borderRadius: 4, background: currentBiz?.accent || RED }} />
              {currentBiz?.name || "Select"} <ChevronDown size={13} />
            </button>
            {bizMenu && (
              <div style={{ position: "absolute", top: 42, left: 0, background: PAPER, border: `1px solid ${LINE}`, borderRadius: 10, boxShadow: "0 10px 30px rgba(0,0,0,0.12)", minWidth: 210, padding: 6, zIndex: 50 }}>
                {businesses.map((b) => (
                  <div key={b.id} onClick={() => switchBiz(b.id)} style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 10px", borderRadius: 7, cursor: "pointer", background: b.id === bizId ? CREAM : "transparent", fontSize: 13, color: INK }}>
                    <span style={{ width: 7, height: 7, borderRadius: 4, background: b.accent || RED }} />{b.name}
                  </div>
                ))}
                <div onClick={addBusiness} style={{ display: "flex", alignItems: "center", gap: 7, padding: "9px 10px", borderRadius: 7, cursor: "pointer", borderTop: `1px solid ${LINE}`, marginTop: 4, ...mono, fontSize: 11.5, color: STONE }}><Plus size={13} /> Add business</div>
              </div>
            )}
          </div>
          <div style={{ flex: 1 }} />
          <div style={{ display: "flex", gap: 4 }}>
            {[["dashboard", "Dashboard"], ["inventory", "Inventory"], ["lifecycle", "Lifecycle"]].map(([k, l]) => (
              <button key={k} onClick={() => setView(k)} style={{ ...mono, fontSize: 11.5, letterSpacing: "0.04em", color: view === k ? INK : STONE, background: view === k ? CREAM : "transparent", border: "none", borderRadius: 8, padding: "8px 13px", cursor: "pointer" }}>{l}</button>
            ))}
          </div>
          <button onClick={() => setSelected(null)} style={{ ...btnSolid, padding: "8px 14px", fontSize: 12.5 }}><Plus size={15} /> Add asset</button>
          <div title={"Signed in as " + (admin?.email || "")} style={{ display: "flex", alignItems: "center", gap: 8, marginLeft: 4, paddingLeft: 10, borderLeft: `1px solid ${LINE}` }}>
            <div style={{ width: 27, height: 27, borderRadius: "50%", background: INK, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", ...mono, fontSize: 11.5, textTransform: "uppercase", flexShrink: 0 }}>{(admin?.email || "?").charAt(0)}</div>
            <span style={{ ...mono, fontSize: 11.5, color: STONE, whiteSpace: "nowrap" }}>{admin?.email}</span>
          </div>
          <button onClick={signOut} title="Sign out" style={{ background: "transparent", border: "none", cursor: "pointer", color: STONE, padding: 6 }}><LogOut size={17} /></button>
        </div>
      </div>

      <div style={{ maxWidth: 1120, margin: "0 auto", padding: "26px 24px 64px" }}>
        <div style={{ marginBottom: 20 }}>
          <div style={{ ...mono, fontSize: 10.5, letterSpacing: "0.14em", textTransform: "uppercase", color: FAINT }}>Asset Management</div>
          <div style={{ ...display, fontSize: 27, fontWeight: 700, color: INK, marginTop: 3 }}>{currentBiz?.name || "Assets"}</div>
        </div>
        {view === "dashboard" && <Dashboard assets={assets} onOpenAsset={setSelected} onGoLifecycle={() => setView("lifecycle")} />}
        {view === "inventory" && <Inventory assets={assets} onOpenAsset={setSelected} />}
        {view === "lifecycle" && <Lifecycle assets={assets} onOpenAsset={setSelected} />}
      </div>

      {selected !== undefined && <AssetDetail asset={selected} businessId={bizId} onClose={() => setSelected(undefined)} onSaved={onSaved} onDeleted={onDeleted} showToast={showToast} />}
      {toast && <div style={{ position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", background: INK, color: "#fff", padding: "11px 20px", borderRadius: 10, fontSize: 13, zIndex: 200, boxShadow: "0 8px 24px rgba(0,0,0,0.2)" }}>{toast}</div>}
    </div>
  );
}

