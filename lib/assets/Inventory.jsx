import React, { useMemo, useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { INK, BODY, STONE, FAINT, LINE, PAPER, CREAM, RED, WARN, mono, money } from "./theme";
import { KIND_META, KindTag, Badge, Empty, STATUS_LABEL, COND_COLOR, STATE_COLOR, STATE_LABEL, lifecycleInfo } from "./ui";

const selStyle = { ...mono, fontSize: 11.5, color: BODY, background: PAPER, border: `1px solid ${LINE}`, borderRadius: 8, padding: "7px 10px", cursor: "pointer", outline: "none" };

function sortVal(a, col) {
  switch (col) {
    case "name": return (a.name || "").toLowerCase();
    case "category": return (a.category || "").toLowerCase();
    case "identifier": return (a.identifier || "").toLowerCase();
    case "quantity": return Number(a.quantity || 0);
    case "unit": return Number(a.unit_cost || 0);
    case "value": return Number(a.unit_cost || 0) * Number(a.quantity || 1);
    case "condition": return (a.condition || "").toLowerCase();
    case "lifecycle": { const d = lifecycleInfo(a).days; return d == null ? Number.POSITIVE_INFINITY : d; }
    default: return 0;
  }
}

export default function Inventory({ assets, onOpenAsset }) {
  const [q, setQ] = useState("");
  const [kind, setKind] = useState("");
  const [cat, setCat] = useState("");
  const [status, setStatus] = useState("");
  const [sort, setSort] = useState({ col: null, dir: "asc" });

  const categories = useMemo(() => Array.from(new Set(assets.map((a) => a.category).filter(Boolean))).sort(), [assets]);

  const rows = useMemo(() => {
    const term = q.trim().toLowerCase();
    const list = assets.filter((a) => {
      if (kind && a.kind !== kind) return false;
      if (cat && (a.category || "") !== cat) return false;
      if (status && (a.status || "in_service") !== status) return false;
      if (term && !((a.name || "").toLowerCase().includes(term) || (a.identifier || "").toLowerCase().includes(term) || (a.category || "").toLowerCase().includes(term))) return false;
      return true;
    });
    if (sort.col) {
      const dir = sort.dir === "asc" ? 1 : -1;
      list.sort((x, y) => { const vx = sortVal(x, sort.col), vy = sortVal(y, sort.col); return vx < vy ? -dir : vx > vy ? dir : 0; });
    }
    return list;
  }, [assets, q, kind, cat, status, sort]);

  const totalValue = rows.reduce((s, a) => s + Number(a.unit_cost || 0) * Number(a.quantity || 1), 0);

  const toggleSort = (col) => setSort((s) => (s.col === col ? { col, dir: s.dir === "asc" ? "desc" : "asc" } : { col, dir: "asc" }));
  const Th = ({ col, label, style }) => {
    const active = sort.col === col;
    return (
      <th onClick={() => toggleSort(col)} style={{ ...style, cursor: "pointer", userSelect: "none", whiteSpace: "nowrap", color: active ? INK : undefined }}>
        {label}<span style={{ marginLeft: 5, fontSize: 8, color: active ? RED : FAINT, opacity: active ? 1 : 0.4 }}>{active && sort.dir === "desc" ? "\u25bc" : "\u25b2"}</span>
      </th>
    );
  };

  return (
    <div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center", marginBottom: 14 }}>
        <div style={{ position: "relative", flex: "1 1 240px", minWidth: 200 }}>
          <Search size={15} style={{ color: FAINT }} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, serial, category..." style={{ width: "100%", padding: "9px 12px 9px 34px", border: `1px solid ${LINE}`, borderRadius: 9, fontSize: 13.5, color: INK, background: PAPER, outline: "none" }} />
        </div>
        <select value={kind} onChange={(e) => setKind(e.target.value)} style={selStyle}><option value="">All kinds</option><option value="equipment">Equipment</option><option value="software">Software</option><option value="service">Web Service</option></select>
        <select value={cat} onChange={(e) => setCat(e.target.value)} style={selStyle}><option value="">All categories</option>{categories.map((c) => <option key={c} value={c}>{c}</option>)}</select>
        <select value={status} onChange={(e) => setStatus(e.target.value)} style={selStyle}><option value="">All statuses</option>{Object.entries(STATUS_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
      </div>

      <div style={{ ...mono, fontSize: 11, color: STONE, marginBottom: 10, letterSpacing: "0.04em" }}>{rows.length} of {assets.length} items · {money(totalValue)}</div>

      {rows.length === 0 ? <Empty>No assets match these filters.</Empty> : (
        <div style={{ background: PAPER, border: `1px solid ${LINE}`, borderRadius: 18, boxShadow: "var(--shadow-sm)", overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 720 }}>
              <thead>
                <tr style={{ ...mono, fontSize: 9.5, letterSpacing: "0.12em", textTransform: "uppercase", color: FAINT, textAlign: "left" }}>
                  <Th col="name" label="Item" style={{ padding: "12px 16px", fontWeight: 500 }} />
                  <Th col="category" label="Category" style={{ padding: "12px 10px", fontWeight: 500 }} />
                  <Th col="identifier" label="Serial / Key" style={{ padding: "12px 10px", fontWeight: 500 }} />
                  <Th col="quantity" label="Qty" style={{ padding: "12px 10px", fontWeight: 500, textAlign: "right" }} />
                  <Th col="unit" label="Unit" style={{ padding: "12px 10px", fontWeight: 500, textAlign: "right" }} />
                  <Th col="value" label="Value" style={{ padding: "12px 10px", fontWeight: 500, textAlign: "right" }} />
                  <Th col="condition" label="Condition" style={{ padding: "12px 10px", fontWeight: 500 }} />
                  <Th col="lifecycle" label="Lifecycle" style={{ padding: "12px 16px", fontWeight: 500 }} />
                </tr>
              </thead>
              <tbody>
                {rows.map((a) => {
                  const info = lifecycleInfo(a);
                  return (
                    <tr key={a.id} onClick={() => onOpenAsset(a)} style={{ borderTop: `1px solid ${LINE}`, cursor: "pointer" }} onMouseEnter={(e) => (e.currentTarget.style.background = CREAM)} onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                      <td style={{ padding: "11px 16px", maxWidth: 260 }}>
                        <div style={{ fontSize: 13.5, color: INK, fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{a.name}</div>
                        <div style={{ marginTop: 3 }}><KindTag kind={a.kind} /></div>
                      </td>
                      <td style={{ padding: "11px 10px", fontSize: 12.5, color: BODY, whiteSpace: "nowrap" }}>{a.category || <span style={{ color: FAINT }}>—</span>}</td>
                      <td style={{ padding: "11px 10px", ...mono, fontSize: 11, color: STONE, maxWidth: 150, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.identifier || "—"}</td>
                      <td style={{ padding: "11px 10px", ...mono, fontSize: 12, color: BODY, textAlign: "right" }}>{a.quantity}{Number(a.out_count) > 0 && <div style={{ fontSize: 9.5, color: WARN, marginTop: 2, whiteSpace: "nowrap" }}>{a.out_count} out</div>}</td>
                      <td style={{ padding: "11px 10px", ...mono, fontSize: 12, color: STONE, textAlign: "right" }}>{money(a.unit_cost)}</td>
                      <td style={{ padding: "11px 10px", ...mono, fontSize: 12, color: INK, textAlign: "right", fontWeight: 500 }}>{money(Number(a.unit_cost || 0) * Number(a.quantity || 1))}</td>
                      <td style={{ padding: "11px 10px" }}>{a.condition ? <Badge text={a.condition} style={{ color: COND_COLOR[a.condition] || STONE }} subtle /> : <span style={{ color: FAINT, fontSize: 12 }}>—</span>}</td>
                      <td style={{ padding: "11px 16px" }}>{info.state === "unknown" ? <span style={{ ...mono, fontSize: 10.5, color: FAINT }}>not set</span> : <Badge text={STATE_LABEL[info.state]} style={{ color: STATE_COLOR[info.state] }} subtle />}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

