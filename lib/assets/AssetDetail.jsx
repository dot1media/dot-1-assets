import React, { useState } from "react";
import { X, Trash2, Save } from "lucide-react";
import { INK, BODY, STONE, FAINT, LINE, PAPER, CREAM, RED, DANGER, display, mono, inputStyle, btnSolid, btnGhost, money } from "./theme";
import { KIND_META, CONDITIONS, STATUSES, STATUS_LABEL, lifecycleInfo, Badge, STATE_COLOR, STATE_LABEL } from "./ui";

const Lbl = ({ children }) => <div style={{ ...mono, fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: STONE, marginBottom: 3 }}>{children}</div>;
const sel = { ...inputStyle, cursor: "pointer" };

export default function AssetDetail({ asset, businessId, onClose, onSaved, onDeleted, showToast }) {
  const isNew = !asset || !asset.id;
  const [f, setF] = useState({
    kind: asset?.kind || "equipment", name: asset?.name || "", category: asset?.category || "",
    identifier: asset?.identifier || "", description: asset?.description || "", bin: asset?.bin || "",
    quantity: asset?.quantity ?? 1, unit_cost: asset?.unit_cost ?? 0, condition: asset?.condition || "",
    status: asset?.status || "in_service", location: asset?.location || "", vendor: asset?.vendor || "",
    purchase_date: asset?.purchase_date ? String(asset.purchase_date).slice(0, 10) : "",
    expected_lifespan_months: asset?.expected_lifespan_months ?? "",
    renewal_date: asset?.renewal_date ? String(asset.renewal_date).slice(0, 10) : "",
    notes: asset?.notes || "",
  });
  const [busy, setBusy] = useState(false);
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));
  const isSub = f.kind === "software" || f.kind === "service";

  const save = async () => {
    if (!f.name.trim()) { showToast("Give the item a name."); return; }
    setBusy(true);
    const payload = { ...f, business_id: businessId, purchase_date: f.purchase_date || null, renewal_date: f.renewal_date || null, expected_lifespan_months: f.expected_lifespan_months === "" ? null : f.expected_lifespan_months };
    try {
      const res = await fetch(isNew ? "/api/assets" : `/api/assets/${asset.id}`, { method: isNew ? "POST" : "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) });
      const data = await res.json().catch(() => ({}));
      if (res.ok) { showToast(isNew ? "Asset added." : "Saved."); onSaved(data.asset); } else { showToast(data.error || "Could not save."); setBusy(false); }
    } catch (e) { showToast("Network error."); setBusy(false); }
  };
  const del = async () => {
    if (!window.confirm(`Delete "${f.name}"? This cannot be undone.`)) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/assets/${asset.id}`, { method: "DELETE" });
      if (res.ok) { showToast("Asset deleted."); onDeleted(asset.id); } else { showToast("Could not delete."); setBusy(false); }
    } catch (e) { showToast("Network error."); setBusy(false); }
  };

  const info = !isNew ? lifecycleInfo(f) : null;
  const km = KIND_META[f.kind] || KIND_META.equipment;

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(26,26,23,0.4)", zIndex: 100, display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "40px 16px", overflowY: "auto" }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: PAPER, borderRadius: 16, width: "100%", maxWidth: 640, boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 22px", borderBottom: `1px solid ${LINE}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <km.Icon size={18} color={km.color} />
            <div style={{ ...display, fontSize: 19, fontWeight: 700, color: INK }}>{isNew ? "Add asset" : "Edit asset"}</div>
          </div>
          <button onClick={onClose} style={{ background: "transparent", border: "none", cursor: "pointer", color: STONE, padding: 4 }}><X size={20} /></button>
        </div>

        <div style={{ padding: 22 }}>
          {info && info.state !== "unknown" && (
            <div style={{ display: "flex", alignItems: "center", gap: 10, background: CREAM, borderRadius: 10, padding: "10px 14px", marginBottom: 18 }}>
              <Badge text={STATE_LABEL[info.state]} color={STATE_COLOR[info.state]} />
              <span style={{ fontSize: 12.5, color: BODY }}>{info.type === "renewal" ? "Renews" : "Replace by"} {info.date} · {info.days < 0 ? `${Math.abs(info.days)} days overdue` : `${info.days} days out`}</span>
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div><Lbl>Type</Lbl><select value={f.kind} onChange={(e) => set("kind", e.target.value)} style={sel}><option value="equipment">Equipment</option><option value="software">Software</option><option value="service">Web Service</option></select></div>
            <div><Lbl>Category</Lbl><input value={f.category} onChange={(e) => set("category", e.target.value)} placeholder="e.g. Cameras & Lenses" style={inputStyle} /></div>
            <div style={{ gridColumn: "1 / -1" }}><Lbl>Name</Lbl><input value={f.name} onChange={(e) => set("name", e.target.value)} placeholder="Item name" style={inputStyle} /></div>
            <div><Lbl>{isSub ? "License key" : "Serial number"}</Lbl><input value={f.identifier} onChange={(e) => set("identifier", e.target.value)} style={inputStyle} /></div>
            <div><Lbl>{isSub ? "Provider / notes" : "Bin / location"}</Lbl><input value={isSub ? f.description : f.bin} onChange={(e) => set(isSub ? "description" : "bin", e.target.value)} style={inputStyle} /></div>
            <div><Lbl>Quantity</Lbl><input type="number" min="0" value={f.quantity} onChange={(e) => set("quantity", e.target.value)} style={inputStyle} /></div>
            <div><Lbl>Unit cost (USD)</Lbl><input type="number" min="0" step="0.01" value={f.unit_cost} onChange={(e) => set("unit_cost", e.target.value)} style={inputStyle} /></div>
            <div><Lbl>Condition</Lbl><select value={f.condition} onChange={(e) => set("condition", e.target.value)} style={sel}>{CONDITIONS.map((c) => <option key={c} value={c}>{c === "" ? "Not set" : c}</option>)}</select></div>
            <div><Lbl>Status</Lbl><select value={f.status} onChange={(e) => set("status", e.target.value)} style={sel}>{STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}</select></div>

            <div style={{ gridColumn: "1 / -1", borderTop: `1px solid ${LINE}`, paddingTop: 14, marginTop: 2 }}>
              <div style={{ ...mono, fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: km.color, marginBottom: 10 }}>{isSub ? "Renewal" : "Replacement planning"}</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                {isSub ? (
                  <div style={{ gridColumn: "1 / -1" }}><Lbl>Renewal date</Lbl><input type="date" value={f.renewal_date} onChange={(e) => set("renewal_date", e.target.value)} style={inputStyle} /></div>
                ) : (
                  <>
                    <div><Lbl>Purchase date</Lbl><input type="date" value={f.purchase_date} onChange={(e) => set("purchase_date", e.target.value)} style={inputStyle} /></div>
                    <div><Lbl>Expected lifespan (months)</Lbl><input type="number" min="0" value={f.expected_lifespan_months} onChange={(e) => set("expected_lifespan_months", e.target.value)} placeholder="e.g. 48" style={inputStyle} /></div>
                  </>
                )}
                <div><Lbl>Vendor</Lbl><input value={f.vendor} onChange={(e) => set("vendor", e.target.value)} placeholder="Where you bought it" style={inputStyle} /></div>
                <div><Lbl>Assigned to</Lbl><input value={f.location} onChange={(e) => set("location", e.target.value)} placeholder="Person or place" style={inputStyle} /></div>
              </div>
            </div>

            <div style={{ gridColumn: "1 / -1" }}><Lbl>Notes</Lbl><textarea value={f.notes} onChange={(e) => set("notes", e.target.value)} rows={2} style={{ ...inputStyle, resize: "vertical" }} /></div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 22px", borderTop: `1px solid ${LINE}` }}>
          {!isNew ? <button onClick={del} disabled={busy} style={{ ...btnGhost, color: DANGER, borderColor: DANGER + "55" }}><Trash2 size={15} /> Delete</button> : <span />}
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={onClose} style={btnGhost}>Cancel</button>
            <button onClick={save} disabled={busy} style={{ ...btnSolid, background: busy ? FAINT : RED }}><Save size={15} /> {busy ? "Saving..." : "Save"}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

