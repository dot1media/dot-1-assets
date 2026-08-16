import React, { useMemo } from "react";
import { AlertTriangle, Clock, CheckCircle, HelpCircle } from "lucide-react";
import { INK, BODY, STONE, FAINT, LINE, PAPER, CREAM, RED, OK, WARN, DANGER, display, mono, money } from "./theme";
import { KindTag, Badge, Empty, lifecycleInfo, STATE_COLOR } from "./ui";

const SECTIONS = [
  { key: "overdue", label: "Overdue", Icon: AlertTriangle, color: DANGER, blurb: "Past their replacement or renewal date." },
  { key: "soon", label: "Due soon", Icon: Clock, color: WARN, blurb: "Coming up within 90 days (30 for subscriptions)." },
  { key: "ok", label: "On track", Icon: CheckCircle, color: OK, blurb: "Dated and not due yet." },
  { key: "unknown", label: "Needs lifecycle dates", Icon: HelpCircle, color: FAINT, blurb: "Add a purchase date and lifespan, or a renewal date, to track these." },
];

function Row({ a, info, onOpenAsset }) {
  return (
    <div onClick={() => onOpenAsset(a)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderTop: `1px solid ${LINE}`, cursor: "pointer" }} onMouseEnter={(e) => (e.currentTarget.style.background = CREAM)} onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13.5, color: INK, fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{a.name}</div>
        <div style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 3 }}><KindTag kind={a.kind} /><span style={{ ...mono, fontSize: 10.5, color: FAINT }}>{a.category || "Uncategorized"}</span></div>
      </div>
      <div style={{ textAlign: "right", whiteSpace: "nowrap" }}>
        {info.date ? (
          <>
            <div style={{ ...mono, fontSize: 12, color: BODY }}>{info.type === "renewal" ? "Renews" : "Replace"} {info.date}</div>
            <div style={{ ...mono, fontSize: 10.5, color: info.days < 0 ? DANGER : info.days <= 90 ? WARN : FAINT, marginTop: 2 }}>{info.days < 0 ? `${Math.abs(info.days)} days overdue` : `in ${info.days} days`}</div>
          </>
        ) : <div style={{ ...mono, fontSize: 11, color: FAINT }}>{money(Number(a.unit_cost || 0) * Number(a.quantity || 1))}</div>}
      </div>
    </div>
  );
}

export default function Lifecycle({ assets, onOpenAsset }) {
  const groups = useMemo(() => {
    const g = { overdue: [], soon: [], ok: [], unknown: [] };
    for (const a of assets) { const info = lifecycleInfo(a); g[info.state].push({ a, info }); }
    for (const k of Object.keys(g)) g[k].sort((x, y) => (x.info.days ?? 1e9) - (y.info.days ?? 1e9));
    return g;
  }, [assets]);

  return (
    <div>
      <div style={{ marginBottom: 18 }}>
        <div style={{ ...display, fontSize: 22, fontWeight: 700, color: INK }}>Lifecycle & replacement</div>
        <div style={{ fontSize: 13, color: STONE, marginTop: 4 }}>Equipment replacement dates come from purchase date plus expected lifespan. Software and services use their renewal date.</div>
      </div>
      {SECTIONS.map(({ key, label, Icon, color, blurb }) => {
        const items = groups[key];
        return (
          <div key={key} style={{ marginBottom: 18 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 4 }}>
              <Icon size={16} color={color} />
              <span style={{ ...display, fontSize: 17, fontWeight: 700, color: INK }}>{label}</span>
              <Badge text={String(items.length)} color={color} subtle />
            </div>
            <div style={{ ...mono, fontSize: 11, color: FAINT, marginBottom: 10 }}>{blurb}</div>
            {items.length === 0 ? (
              <div style={{ ...mono, fontSize: 12, color: FAINT, padding: "6px 0" }}>None.</div>
            ) : (
              <div style={{ background: PAPER, border: `1px solid ${LINE}`, borderRadius: 12, overflow: "hidden" }}>
                {items.slice(0, 50).map(({ a, info }) => <Row key={a.id} a={a} info={info} onOpenAsset={onOpenAsset} />)}
                {items.length > 50 && <div style={{ ...mono, fontSize: 11, color: FAINT, padding: "10px 16px", borderTop: `1px solid ${LINE}` }}>+ {items.length - 50} more</div>}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

