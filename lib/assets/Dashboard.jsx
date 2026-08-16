import React, { useMemo, useState } from "react";
import { ArrowRight, AlertTriangle, TrendingUp, Package, DollarSign, BarChartHorizontal, BarChart3, PieChart } from "lucide-react";
import { INK, BODY, STONE, FAINT, LINE, PAPER, CREAM, RED, OK, WARN, DANGER, display, mono, money } from "./theme";
import { KIND_META, lifecycleInfo, Badge, KindTag, STATE_COLOR, STATE_LABEL, COND_COLOR } from "./ui";

function Kpi({ icon: Icon, label, value, sub, color }) {
  return (
    <div style={{ background: PAPER, border: `1px solid ${LINE}`, borderRadius: 14, padding: "18px 20px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 7, ...mono, fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: STONE, marginBottom: 10 }}><Icon size={13} color={color || STONE} /> {label}</div>
      <div style={{ ...display, fontSize: 30, fontWeight: 700, color: INK, lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: FAINT, marginTop: 6 }}>{sub}</div>}
    </div>
  );
}

function Bar({ name, count, total, value, max, color }) {
  return (
    <div style={{ marginBottom: 11 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 4 }}>
        <span style={{ fontSize: 13, color: BODY }}>{name}</span>
        <span style={{ ...mono, fontSize: 11, color: STONE }}>{count} · {money(value)}</span>
      </div>
      <div style={{ height: 6, background: CREAM, borderRadius: 4, overflow: "hidden" }}><div style={{ width: `${max ? (count / max) * 100 : 0}%`, height: "100%", background: color, borderRadius: 4 }} /></div>
    </div>
  );
}

const PALETTE = ["#e23b2e", "#2f74c0", "#3f7a3f", "#a97a2e", "#1a1a17", "#8a4fa0", "#4a9d9d", "#6f6d65", "#c0603a", "#5a7a3a"];

function CatChart({ cats, maxCat, type }) {
  const shown = cats.slice(0, 9);
  if (shown.length === 0) return <div style={{ ...mono, fontSize: 12, color: FAINT, padding: "8px 0" }}>No categories yet.</div>;
  const total = shown.reduce((s, c) => s + c.count, 0) || 1;
  if (type === "donut") {
    const r = 54, cx = 70, cy = 70, sw = 24, circ = 2 * Math.PI * r; let off = 0;
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
        <svg width={140} height={140} viewBox="0 0 140 140" style={{ flexShrink: 0 }}>
          {shown.map((c, i) => { const dash = (c.count / total) * circ; const el = <circle key={c.name} cx={cx} cy={cy} r={r} fill="none" stroke={PALETTE[i % PALETTE.length]} strokeWidth={sw} strokeDasharray={`${dash} ${circ - dash}`} strokeDashoffset={-off} transform={`rotate(-90 ${cx} ${cy})`} />; off += dash; return el; })}
          <text x={cx} y={cy - 1} textAnchor="middle" style={{ fontSize: 25, fontWeight: 700, fill: INK }}>{total}</text>
          <text x={cx} y={cy + 15} textAnchor="middle" style={{ fontSize: 8, fill: STONE, letterSpacing: "1.5px" }}>ITEMS</text>
        </svg>
        <div style={{ flex: 1, minWidth: 130, display: "flex", flexDirection: "column", gap: 6 }}>
          {shown.map((c, i) => (
            <div key={c.name} style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12, color: BODY }}>
              <span style={{ width: 9, height: 9, borderRadius: 2, background: PALETTE[i % PALETTE.length], flexShrink: 0 }} />
              <span style={{ flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.name}</span>
              <span style={{ ...mono, fontSize: 10.5, color: STONE }}>{c.count}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  if (type === "columns") {
    return (
      <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 175, paddingTop: 6 }}>
        {shown.map((c, i) => (
          <div key={c.name} title={`${c.name}: ${c.count} \u00b7 ${money(c.value)}`} style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 5, height: "100%", justifyContent: "flex-end" }}>
            <span style={{ ...mono, fontSize: 10, color: STONE }}>{c.count}</span>
            <div style={{ width: "100%", maxWidth: 34, height: `${Math.max(3, (c.count / maxCat) * 116)}px`, background: PALETTE[i % PALETTE.length], borderRadius: "4px 4px 0 0" }} />
            <span style={{ fontSize: 8.5, color: FAINT, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "100%", textAlign: "center" }}>{c.name}</span>
          </div>
        ))}
      </div>
    );
  }
  return <>{shown.map((c, i) => <Bar key={c.name} name={c.name} count={c.count} value={c.value} max={maxCat} color={PALETTE[i % PALETTE.length]} />)}</>;
}

export default function Dashboard({ assets, onOpenAsset, onGoLifecycle }) {
  const stats = useMemo(() => {
    const totalValue = assets.reduce((s, a) => s + Number(a.unit_cost || 0) * Number(a.quantity || 1), 0);
    const byKind = {};
    for (const a of assets) byKind[a.kind] = (byKind[a.kind] || 0) + 1;
    const catMap = {};
    for (const a of assets) {
      const k = a.category || "Uncategorized";
      if (!catMap[k]) catMap[k] = { count: 0, value: 0 };
      catMap[k].count += 1; catMap[k].value += Number(a.unit_cost || 0) * Number(a.quantity || 1);
    }
    const cats = Object.entries(catMap).map(([name, v]) => ({ name, ...v })).sort((a, b) => b.count - a.count);
    const condMap = {};
    for (const a of assets) { const c = a.condition || "unset"; condMap[c] = (condMap[c] || 0) + 1; }
    const life = assets.map((a) => ({ a, info: lifecycleInfo(a) }));
    const alerts = life.filter((x) => x.info.state === "overdue" || x.info.state === "soon").sort((a, b) => (a.info.days ?? 1e9) - (b.info.days ?? 1e9));
    const needsData = life.filter((x) => x.info.state === "unknown").length;
    return { totalValue, byKind, cats, condMap, alerts, needsData, totalUnits: assets.reduce((s, a) => s + Number(a.quantity || 1), 0) };
  }, [assets]);

  const maxCat = Math.max(1, ...stats.cats.map((c) => c.count));
  const kindColor = { equipment: KIND_META.equipment.color, software: KIND_META.software.color, service: KIND_META.service.color };
  const [catChart, setCatChart] = useState("bars");

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14, marginBottom: 16 }}>
        <Kpi icon={Package} label="Line items" value={assets.length} sub={`${stats.totalUnits} total units`} color={INK} />
        <Kpi icon={DollarSign} label="Inventory value" value={money(stats.totalValue)} sub="replacement cost basis" color={OK} />
        <Kpi icon={KIND_META.equipment.Icon} label="Equipment" value={stats.byKind.equipment || 0} color={KIND_META.equipment.color} />
        <Kpi icon={TrendingUp} label="Software & services" value={(stats.byKind.software || 0) + (stats.byKind.service || 0)} color={KIND_META.software.color} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 16, alignItems: "start" }}>
        <div style={{ background: PAPER, border: `1px solid ${LINE}`, borderRadius: 14, padding: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
            <div style={{ ...display, fontSize: 18, fontWeight: 700, color: INK }}>Lifecycle attention</div>
            <button onClick={onGoLifecycle} style={{ ...mono, fontSize: 11, color: STONE, background: "transparent", border: "none", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 4 }}>All lifecycle <ArrowRight size={12} /></button>
          </div>
          <div style={{ fontSize: 12.5, color: STONE, marginBottom: 16 }}>Replacements and renewals that are overdue or coming up.</div>
          {stats.alerts.length === 0 ? (
            <div style={{ ...mono, fontSize: 12.5, color: FAINT, padding: "18px 0" }}>Nothing overdue or due soon. {stats.needsData > 0 ? `${stats.needsData} items still need lifecycle dates.` : "You're all set."}</div>
          ) : stats.alerts.slice(0, 8).map(({ a, info }) => (
            <div key={a.id} onClick={() => onOpenAsset(a)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderTop: `1px solid ${LINE}`, cursor: "pointer" }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13.5, color: INK, fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{a.name}</div>
                <div style={{ ...mono, fontSize: 10.5, color: FAINT, marginTop: 2 }}>{info.type === "renewal" ? "Renews" : "Replace"} {info.date} · {info.days < 0 ? `${Math.abs(info.days)}d overdue` : `in ${info.days}d`}</div>
              </div>
              <Badge text={STATE_LABEL[info.state]} color={STATE_COLOR[info.state]} subtle />
            </div>
          ))}
          {stats.alerts.length > 8 && <div style={{ ...mono, fontSize: 11, color: FAINT, marginTop: 12 }}>+ {stats.alerts.length - 8} more in Lifecycle</div>}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ background: PAPER, border: `1px solid ${LINE}`, borderRadius: 14, padding: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div style={{ ...display, fontSize: 17, fontWeight: 700, color: INK }}>By category</div>
              <div style={{ display: "flex", gap: 3, background: CREAM, borderRadius: 8, padding: 3 }}>
                {[["bars", BarChartHorizontal], ["columns", BarChart3], ["donut", PieChart]].map(([t, Icon]) => (
                  <button key={t} onClick={() => setCatChart(t)} title={t} style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 30, height: 26, borderRadius: 6, border: "none", cursor: "pointer", background: catChart === t ? PAPER : "transparent", color: catChart === t ? INK : STONE, boxShadow: catChart === t ? "0 1px 2px rgba(0,0,0,0.08)" : "none" }}><Icon size={14} /></button>
                ))}
              </div>
            </div>
            <CatChart cats={stats.cats} maxCat={maxCat} type={catChart} />
          </div>
          <div style={{ background: PAPER, border: `1px solid ${LINE}`, borderRadius: 14, padding: 20 }}>
            <div style={{ ...display, fontSize: 17, fontWeight: 700, color: INK, marginBottom: 12 }}>By condition</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {Object.entries(stats.condMap).sort((a, b) => b[1] - a[1]).map(([c, n]) => (
                <div key={c} style={{ display: "flex", alignItems: "center", gap: 6, ...mono, fontSize: 11.5, color: BODY, background: CREAM, borderRadius: 8, padding: "5px 10px" }}>
                  <span style={{ width: 8, height: 8, borderRadius: 4, background: c === "unset" ? FAINT : (COND_COLOR[c] || STONE) }} />
                  {c === "unset" ? "Not set" : c} · {n}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

