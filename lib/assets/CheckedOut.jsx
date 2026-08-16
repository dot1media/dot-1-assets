import React, { useState, useEffect } from "react";
import { Camera, Check, Trash2, X, PackageOpen, ArrowRight } from "lucide-react";
import { INK, STONE, FAINT, LINE, PAPER, CREAM, RED, OK, WARN, DANGER, display, mono, inputStyle, btnSolid, btnGhost } from "./theme";

const Lbl = ({ children }) => <div style={{ ...mono, fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: STONE, marginBottom: 3 }}>{children}</div>;
const overlay = { position: "fixed", inset: 0, background: "rgba(26,26,23,0.4)", zIndex: 100, display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "40px 16px", overflowY: "auto" };
const modalCard = { background: PAPER, borderRadius: 16, width: "100%", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" };
const modalHead = { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px", borderBottom: `1px solid ${LINE}` };
const modalFoot = { display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 10, padding: "16px 24px", borderTop: `1px solid ${LINE}` };
const xBtn = { background: "transparent", border: "none", cursor: "pointer", color: STONE, padding: 4 };

function fmtDate(d) { if (!d) return ""; try { return new Date(d).toLocaleDateString(undefined, { month: "short", day: "numeric" }); } catch (e) { return String(d); } }
function daysUntil(d) { if (!d) return null; return Math.ceil((new Date(String(d).slice(0, 10) + "T00:00:00").getTime() - Date.now()) / 86400000); }

function CheckoutDialog({ packages, businessId, onClose, onDone, showToast }) {
  const [packageId, setPackageId] = useState(packages[0]?.id || "");
  const [label, setLabel] = useState("");
  const [dueBack, setDueBack] = useState("");
  const [busy, setBusy] = useState(false);
  const checkout = async () => {
    if (!packageId) { showToast("Pick a package."); return; }
    setBusy(true);
    try {
      const res = await fetch("/api/checkouts", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ business_id: businessId, package_id: parseInt(packageId), label: label.trim(), due_back: dueBack || null }) });
      const d = await res.json().catch(() => ({}));
      if (res.ok) { showToast("Checked out."); onDone(); } else { showToast(d.error || "Could not check out."); setBusy(false); }
    } catch (e) { showToast("Network error."); setBusy(false); }
  };
  return (
    <div onClick={onClose} style={overlay}>
      <div onClick={(e) => e.stopPropagation()} style={{ ...modalCard, maxWidth: 460 }}>
        <div style={modalHead}>
          <div style={{ ...display, fontSize: 19, fontWeight: 700, color: INK, display: "flex", alignItems: "center", gap: 9 }}><PackageOpen size={18} color={RED} /> Check out a package</div>
          <button onClick={onClose} style={xBtn}><X size={20} /></button>
        </div>
        <div style={{ padding: "20px 24px" }}>
          {packages.length === 0 ? <div style={{ ...mono, fontSize: 12, color: FAINT }}>No packages to check out yet. Create one in the Packages tab first.</div> : (
            <>
              <Lbl>Package</Lbl>
              <select value={packageId} onChange={(e) => setPackageId(e.target.value)} style={{ ...inputStyle, cursor: "pointer" }}>
                {packages.map((p) => <option key={p.id} value={p.id}>{p.name} ({p.unit_count} units)</option>)}
              </select>
              <div style={{ height: 12 }} />
              <Lbl>For (optional)</Lbl>
              <input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="e.g. Smith wedding, Saturday" style={inputStyle} />
              <div style={{ height: 12 }} />
              <Lbl>Due back</Lbl>
              <input type="date" value={dueBack} onChange={(e) => setDueBack(e.target.value)} style={inputStyle} />
            </>
          )}
        </div>
        <div style={modalFoot}>
          <button onClick={onClose} style={btnGhost}>Cancel</button>
          {packages.length > 0 && <button onClick={checkout} disabled={busy} style={{ ...btnSolid, background: busy ? FAINT : INK }}><ArrowRight size={15} /> {busy ? "…" : "Check out"}</button>}
        </div>
      </div>
    </div>
  );
}

export default function CheckedOut({ businessId, showToast }) {
  const [checkouts, setCheckouts] = useState([]);
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialog, setDialog] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [c, p] = await Promise.all([
        fetch(`/api/checkouts?business_id=${businessId}`).then((r) => r.json()),
        fetch(`/api/packages?business_id=${businessId}`).then((r) => r.json()),
      ]);
      setCheckouts(c.checkouts || []); setPackages(p.packages || []);
    } catch (e) {}
    setLoading(false);
  };
  useEffect(() => { if (businessId) load(); }, [businessId]);

  const checkIn = async (id) => {
    try { const res = await fetch(`/api/checkouts/${id}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ checkin: true }) }); if (res.ok) { showToast("Checked back in."); load(); } else showToast("Could not check in."); } catch (e) { showToast("Network error."); }
  };
  const remove = async (id) => {
    if (!window.confirm("Delete this checkout record?")) return;
    try { const res = await fetch(`/api/checkouts/${id}`, { method: "DELETE" }); if (res.ok) { showToast("Deleted."); load(); } else showToast("Could not delete."); } catch (e) { showToast("Network error."); }
  };

  const active = checkouts.filter((c) => !c.checked_in_at);
  const returned = checkouts.filter((c) => c.checked_in_at);

  return (
    <div>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 18, gap: 16 }}>
        <div style={{ maxWidth: 560, fontSize: 13, color: STONE, lineHeight: 1.5 }}>Check a package out for a shoot and back in when it returns. Gear on an active checkout shows as out in your inventory.</div>
        <button onClick={() => setDialog(true)} style={{ ...btnSolid, padding: "9px 15px", fontSize: 12.5, flexShrink: 0 }}><PackageOpen size={15} /> Check out a package</button>
      </div>

      {loading ? <div style={{ ...mono, fontSize: 12, color: FAINT, padding: 20 }}>Loading…</div> : (
        <>
          <Lbl>Out now ({active.length})</Lbl>
          {active.length === 0 ? <div style={{ ...mono, fontSize: 12, color: FAINT, background: CREAM, borderRadius: 10, padding: "14px 16px", marginTop: 6, marginBottom: 26 }}>Nothing is checked out. Everything's on the shelf.</div> : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 6, marginBottom: 28 }}>
              {active.map((c) => {
                const du = daysUntil(c.due_back); const overdue = du !== null && du < 0; const soon = du !== null && du >= 0 && du <= 1;
                const tone = overdue ? DANGER : soon ? WARN : OK;
                return (
                  <div key={c.id} style={{ background: PAPER, border: `1px solid ${overdue ? DANGER : LINE}`, borderRadius: 12, padding: "14px 16px", display: "flex", alignItems: "center", gap: 14 }}>
                    <div style={{ width: 38, height: 38, borderRadius: 9, background: CREAM, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Camera size={18} color={RED} /></div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14.5, color: INK, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.package_name || "Package"}{c.label ? <span style={{ fontWeight: 400, color: STONE }}> · {c.label}</span> : ""}</div>
                      <div style={{ ...mono, fontSize: 11, color: STONE, marginTop: 3 }}>{c.unit_count} units · out {fmtDate(c.checked_out_at)}{c.due_back ? " · due " + fmtDate(c.due_back) : ""}</div>
                    </div>
                    {c.due_back && <span style={{ ...mono, fontSize: 10, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: tone, background: tone + "18", borderRadius: 6, padding: "4px 8px", whiteSpace: "nowrap", flexShrink: 0 }}>{overdue ? `${-du}d overdue` : du === 0 ? "due today" : `${du}d left`}</span>}
                    <button onClick={() => checkIn(c.id)} style={{ ...btnSolid, background: OK, padding: "8px 13px", fontSize: 12, flexShrink: 0 }}><Check size={14} /> Check in</button>
                    <button onClick={() => remove(c.id)} title="Delete record" style={{ background: "transparent", border: "none", cursor: "pointer", color: FAINT, padding: 4, flexShrink: 0 }}><Trash2 size={14} /></button>
                  </div>
                );
              })}
            </div>
          )}

          {returned.length > 0 && (
            <>
              <Lbl>Recently returned</Lbl>
              <div style={{ marginTop: 6, border: `1px solid ${LINE}`, borderRadius: 12, overflow: "hidden" }}>
                {returned.slice(0, 15).map((c, idx) => (
                  <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 14px", borderTop: idx ? `1px solid ${LINE}` : "none" }}>
                    <Check size={14} color={OK} style={{ flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, color: INK, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.package_name || "Package"}{c.label ? " · " + c.label : ""}</div>
                      <div style={{ ...mono, fontSize: 10.5, color: FAINT }}>out {fmtDate(c.checked_out_at)} · back {fmtDate(c.checked_in_at)}</div>
                    </div>
                    <button onClick={() => remove(c.id)} title="Delete record" style={{ background: "transparent", border: "none", cursor: "pointer", color: FAINT, padding: 4, flexShrink: 0 }}><Trash2 size={13} /></button>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}

      {dialog && <CheckoutDialog packages={packages} businessId={businessId} onClose={() => setDialog(false)} onDone={() => { setDialog(false); load(); }} showToast={showToast} />}
    </div>
  );
}
