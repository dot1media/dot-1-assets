import React, { useState, useEffect, useMemo } from "react";
import { X, Trash2, Save, Plus, Minus, Camera, Search } from "lucide-react";
import { INK, STONE, FAINT, LINE, PAPER, CREAM, RED, DANGER, display, mono, inputStyle, btnSolid, btnGhost, money } from "./theme";
import { Empty } from "./ui";

const Lbl = ({ children }) => <div style={{ ...mono, fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: STONE, marginBottom: 3 }}>{children}</div>;
const qtyBtn = { width: 24, height: 24, borderRadius: 6, border: `1px solid ${LINE}`, background: PAPER, color: INK, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: 0 };

function PackageEditor({ pkg, assets, businessId, onClose, onSaved, showToast }) {
  const isNew = !pkg || !pkg.id;
  const [name, setName] = useState(pkg?.name || "");
  const [description, setDescription] = useState(pkg?.description || "");
  const [items, setItems] = useState([]); // [{ asset_id, quantity }]
  const [loaded, setLoaded] = useState(isNew);
  const [busy, setBusy] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!isNew) {
      fetch(`/api/packages/${pkg.id}`).then((r) => r.json()).then((d) => {
        setItems((d.items || []).map((i) => ({ asset_id: i.asset_id, quantity: i.quantity })));
        setLoaded(true);
      }).catch(() => setLoaded(true));
    }
  }, []);

  const assetById = useMemo(() => { const m = {}; for (const a of assets) m[a.id] = a; return m; }, [assets]);
  const inPackage = useMemo(() => new Set(items.map((i) => i.asset_id)), [items]);
  const addAsset = (id) => setItems((prev) => prev.find((i) => i.asset_id === id) ? prev : [...prev, { asset_id: id, quantity: 1 }]);
  const setQty = (id, q) => setItems((prev) => prev.map((i) => i.asset_id === id ? { ...i, quantity: Math.max(1, q) } : i));
  const removeItem = (id) => setItems((prev) => prev.filter((i) => i.asset_id !== id));

  const totalValue = items.reduce((s, i) => s + (Number(assetById[i.asset_id]?.unit_cost) || 0) * i.quantity, 0);
  const unitCount = items.reduce((s, i) => s + i.quantity, 0);
  const candidates = assets.filter((a) => !inPackage.has(a.id) && (!search.trim() || (a.name + " " + (a.category || "")).toLowerCase().includes(search.toLowerCase())));

  const save = async () => {
    if (!name.trim()) { showToast("Give the package a name."); return; }
    setBusy(true);
    try {
      if (isNew) {
        const res = await fetch("/api/packages", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ business_id: businessId, name: name.trim(), description: description.trim() }) });
        const d = await res.json().catch(() => ({}));
        if (res.ok && d.package) {
          await fetch(`/api/packages/${d.package.id}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ items }) });
          showToast("Package created."); onSaved();
        } else { showToast(d.error || "Could not create."); setBusy(false); }
      } else {
        const res = await fetch(`/api/packages/${pkg.id}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ name: name.trim(), description: description.trim(), items }) });
        const d = await res.json().catch(() => ({}));
        if (res.ok) { showToast("Package saved."); onSaved(); } else { showToast(d.error || "Could not save."); setBusy(false); }
      }
    } catch (e) { showToast("Network error."); setBusy(false); }
  };
  const del = async () => {
    if (!window.confirm(`Delete "${name}"? This only removes the package, not your inventory.`)) return;
    try { const res = await fetch(`/api/packages/${pkg.id}`, { method: "DELETE" }); if (res.ok) { showToast("Package deleted."); onSaved(); } else showToast("Could not delete."); } catch (e) { showToast("Network error."); }
  };

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(26,26,23,0.4)", zIndex: 100, display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "40px 16px", overflowY: "auto" }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: PAPER, borderRadius: 16, width: "100%", maxWidth: 680, boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px", borderBottom: `1px solid ${LINE}` }}>
          <div style={{ ...display, fontSize: 20, fontWeight: 700, color: INK, display: "flex", alignItems: "center", gap: 9 }}><Camera size={19} color={RED} /> {isNew ? "New camera package" : "Edit package"}</div>
          <button onClick={onClose} style={{ background: "transparent", border: "none", cursor: "pointer", color: STONE, padding: 4 }}><X size={20} /></button>
        </div>
        <div style={{ padding: "20px 24px", maxHeight: "62vh", overflowY: "auto" }}>
          <Lbl>Package name</Lbl>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Wedding Kit" style={inputStyle} />
          <div style={{ height: 12 }} />
          <Lbl>Description</Lbl>
          <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional, what this kit is for" style={inputStyle} />

          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", margin: "22px 0 10px" }}>
            <Lbl>In this package ({items.length})</Lbl>
            <span style={{ ...mono, fontSize: 11.5, color: STONE }}>{unitCount} units · {money(totalValue)}</span>
          </div>
          {!loaded ? <div style={{ ...mono, fontSize: 12, color: FAINT, padding: 12 }}>Loading…</div> :
           items.length === 0 ? <div style={{ ...mono, fontSize: 12, color: FAINT, background: CREAM, borderRadius: 10, padding: "14px 16px" }}>No gear yet. Add from your inventory below.</div> :
           <div style={{ border: `1px solid ${LINE}`, borderRadius: 10, overflow: "hidden" }}>
             {items.map((i, idx) => { const a = assetById[i.asset_id]; const short = a && Number(a.quantity) < i.quantity; return (
               <div key={i.asset_id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderTop: idx ? `1px solid ${LINE}` : "none" }}>
                 <div style={{ flex: 1, minWidth: 0 }}>
                   <div style={{ fontSize: 13.5, color: INK, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{a?.name || "Unknown asset"}</div>
                   <div style={{ ...mono, fontSize: 10.5, color: short ? DANGER : STONE }}>{a?.category || a?.kind || ""}{a?.unit_cost ? " · " + money(Number(a.unit_cost)) : ""}{short ? " · only " + a.quantity + " in stock" : ""}</div>
                 </div>
                 <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                   <button onClick={() => setQty(i.asset_id, i.quantity - 1)} style={qtyBtn}><Minus size={13} /></button>
                   <span style={{ ...mono, fontSize: 13, color: INK, minWidth: 20, textAlign: "center" }}>{i.quantity}</span>
                   <button onClick={() => setQty(i.asset_id, i.quantity + 1)} style={qtyBtn}><Plus size={13} /></button>
                 </div>
                 <button onClick={() => removeItem(i.asset_id)} title="Remove" style={{ background: "transparent", border: "none", cursor: "pointer", color: DANGER, padding: 4 }}><Trash2 size={14} /></button>
               </div>
             ); })}
           </div>}

          <div style={{ margin: "22px 0 10px" }}><Lbl>Add from inventory</Lbl></div>
          <div style={{ position: "relative", marginBottom: 10 }}>
            <Search size={14} color={FAINT} style={{ position: "absolute", left: 11, top: 11 }} />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search gear…" style={{ ...inputStyle, paddingLeft: 32 }} />
          </div>
          <div style={{ border: `1px solid ${LINE}`, borderRadius: 10, maxHeight: 220, overflowY: "auto" }}>
            {candidates.length === 0 ? <div style={{ ...mono, fontSize: 12, color: FAINT, padding: 14 }}>{assets.length === 0 ? "No inventory in this business yet." : "Nothing matches."}</div> :
             candidates.slice(0, 100).map((a, idx) => (
               <div key={a.id} onClick={() => addAsset(a.id)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderTop: idx ? `1px solid ${LINE}` : "none", cursor: "pointer" }}>
                 <Plus size={14} color={RED} />
                 <div style={{ flex: 1, minWidth: 0 }}>
                   <div style={{ fontSize: 13, color: INK, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{a.name}</div>
                   <div style={{ ...mono, fontSize: 10.5, color: STONE }}>{a.category || a.kind || ""}{a.unit_cost ? " · " + money(Number(a.unit_cost)) : ""} · qty {a.quantity}</div>
                 </div>
               </div>
             ))}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 24px", borderTop: `1px solid ${LINE}` }}>
          <div>{!isNew && <button onClick={del} style={{ ...btnGhost, color: DANGER, borderColor: "transparent", display: "inline-flex", alignItems: "center", gap: 6 }}><Trash2 size={14} /> Delete</button>}</div>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={onClose} style={btnGhost}>Cancel</button>
            <button onClick={save} disabled={busy} style={{ ...btnSolid, background: busy ? FAINT : INK }}><Save size={15} /> {busy ? "Saving…" : "Save package"}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Packages({ assets, businessId, showToast }) {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(undefined); // undefined = closed, null = new, obj = edit

  const load = async () => {
    setLoading(true);
    try { const d = await fetch(`/api/packages?business_id=${businessId}`).then((r) => r.json()); setPackages(d.packages || []); } catch (e) {}
    setLoading(false);
  };
  useEffect(() => { if (businessId) load(); }, [businessId]);

  return (
    <div>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 18, gap: 16 }}>
        <div style={{ maxWidth: 560, fontSize: 13, color: STONE, lineHeight: 1.5 }}>Build reusable gear kits from your inventory. Attach them to session types in the portal so every shoot knows what to pack.</div>
        <button onClick={() => setEditing(null)} style={{ ...btnSolid, padding: "9px 15px", fontSize: 12.5, flexShrink: 0 }}><Plus size={15} /> New package</button>
      </div>

      {loading ? <div style={{ ...mono, fontSize: 12, color: FAINT, padding: 20 }}>Loading…</div> :
       packages.length === 0 ? <Empty>No packages yet. Create your first camera package to group the gear a shoot needs.</Empty> :
       <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14 }}>
         {packages.map((p) => (
           <div key={p.id} onClick={() => setEditing(p)} style={{ background: PAPER, border: `1px solid ${LINE}`, borderRadius: 14, padding: 18, cursor: "pointer" }}>
             <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
               <Camera size={16} color={RED} />
               <div style={{ ...display, fontSize: 17, fontWeight: 700, color: INK, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.name}</div>
             </div>
             {p.description ? <div style={{ fontSize: 12.5, color: STONE, lineHeight: 1.5, marginBottom: 12 }}>{p.description}</div> : <div style={{ height: 6 }} />}
             <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", ...mono, fontSize: 11, color: STONE, borderTop: `1px solid ${LINE}`, paddingTop: 12, marginTop: 6 }}>
               <span>{p.item_count} items · {p.unit_count} units</span>
               <span style={{ color: INK }}>{money(Number(p.total_value))}</span>
             </div>
           </div>
         ))}
       </div>}

      {editing !== undefined && <PackageEditor pkg={editing} assets={assets} businessId={businessId} onClose={() => setEditing(undefined)} onSaved={() => { setEditing(undefined); load(); }} showToast={showToast} />}
    </div>
  );
}
