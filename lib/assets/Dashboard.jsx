import React, { useMemo } from "react";
import { ArrowRight, AlertTriangle, TrendingUp, Package, DollarSign } from "lucide-react";
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
            <div style={{ ...display, fontSize: 17, fontWeight: 700, color: INK, marginBottom: 14 }}>By category</div>
            {stats.cats.slice(0, 8).map((c) => <Bar key={c.name} name={c.name} count={c.count} value={c.value} max={maxCat} color={RED} />)}
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

