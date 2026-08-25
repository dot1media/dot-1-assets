import React from "react";
import { Camera, HardDrive, Cloud, Package } from "lucide-react";
import { INK, BODY, STONE, FAINT, LINE, PAPER, OK, WARN, DANGER, RED, mono, label, alpha } from "./theme";

export const KIND_META = {
  equipment: { label: "Equipment", color: "#2f74c0", Icon: Camera },
  software: { label: "Software", color: "#7a52c0", Icon: HardDrive },
  service: { label: "Web Service", color: "#3f7a3f", Icon: Cloud },
};
export const CONDITIONS = ["", "new", "excellent", "good", "fair", "poor", "retired"];
export const STATUSES = ["in_service", "in_storage", "in_repair", "retired", "lost"];
export const STATUS_LABEL = { in_service: "In service", in_storage: "In storage", in_repair: "In repair", retired: "Retired", lost: "Lost" };
export const COND_COLOR = { new: OK, excellent: OK, good: "#2f74c0", fair: WARN, poor: DANGER, retired: STONE };
export const STATE_COLOR = { overdue: DANGER, soon: WARN, ok: OK, unknown: FAINT };
export const STATE_LABEL = { overdue: "Overdue", soon: "Due soon", ok: "On track", unknown: "Not set" };

// Compute lifecycle status for an asset (replacement for gear, renewal for software/services).
export function lifecycleInfo(a) {
  const now = new Date();
  if (a.kind === "software" || a.kind === "service") {
    if (a.renewal_date) {
      const d = new Date(a.renewal_date);
      const days = Math.round((d - now) / 86400000);
      return { type: "renewal", date: a.renewal_date, days, state: days < 0 ? "overdue" : days <= 30 ? "soon" : "ok" };
    }
    return { type: "renewal", date: null, days: null, state: "unknown" };
  }
  if (a.purchase_date && a.expected_lifespan_months) {
    const d = new Date(a.purchase_date); d.setMonth(d.getMonth() + Number(a.expected_lifespan_months));
    const days = Math.round((d - now) / 86400000);
    return { type: "replacement", date: d.toISOString().slice(0, 10), days, state: days < 0 ? "overdue" : days <= 90 ? "soon" : "ok" };
  }
  return { type: "replacement", date: null, days: null, state: "unknown" };
}

export function Field({ children, hint }) {
  return <label style={{ display: "block", marginBottom: 14 }}><div style={{ ...label, marginBottom: 2 }}>{hint}</div>{children}</label>;
}

export function Badge({ text, color, subtle }) {
  return <span style={{ ...mono, fontSize: 10, letterSpacing: "0.06em", textTransform: "uppercase", color: subtle ? color : "#fff", background: subtle ? alpha(color, 12) : color, border: subtle ? `1px solid ${alpha(color, 34)}` : "1px solid transparent", borderRadius: 999, padding: "4px 10px", whiteSpace: "nowrap", display: "inline-block" }}>{text}</span>;
}

export function KindTag({ kind }) {
  const m = KIND_META[kind] || KIND_META.equipment;
  return <span style={{ display: "inline-flex", alignItems: "center", gap: 5, ...mono, fontSize: 10.5, letterSpacing: "0.04em", color: m.color }}><m.Icon size={12} /> {m.label}</span>;
}

export function Empty({ children }) {
  return <div style={{ textAlign: "center", padding: "60px 20px", color: FAINT, ...mono, fontSize: 13 }}><Package size={26} style={{ opacity: 0.5, marginBottom: 10 }} /><div>{children}</div></div>;
}

