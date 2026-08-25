import { BRAND } from "../brand";
const C = BRAND.colors;

// Neutrals -> CSS variables (theme-aware: light + dark).
export const INK = "var(--fg)", BODY = "var(--fg2)", STONE = "var(--dim)", FAINT = "var(--faint)";
export const LINE = "var(--line)", PAPER = "var(--surface)", CREAM = "var(--surface-2)";
export const BG = "var(--bg)", ACCENT = "var(--accent)", SOLID = "var(--solid)", SOLID_FG = "var(--solid-fg)";

// Accents -> concrete hex (safe inside lucide `color` props; read fine on both themes).
export const RED = C.red, OK = C.ok, WARN = C.warn, DANGER = C.danger;

// Elevation / shape / motion tokens.
export const SHADOW_SM = "var(--shadow-sm)", SHADOW = "var(--shadow)", SHADOW_LG = "var(--shadow-lg)";
export const R_SM = 10, R = 14, R_LG = 18, PILL = 999;
export const EASE = "cubic-bezier(.22,1,.36,1)", SPRING = "cubic-bezier(.34,1.4,.6,1)";
export const T = ".34s", T_SLOW = ".5s", T_PRESS = ".18s";
export const tx = (...props) => props.map((p) => `${p} ${T} ${EASE}`).join(",");

export const display = { fontFamily: BRAND.fonts.display };
export const mono = { fontFamily: BRAND.fonts.mono };
export const sans = { fontFamily: BRAND.fonts.sans };

export const money = (n) => "$" + Math.round(Number(n || 0)).toLocaleString();
export const alpha = (c, pct) => `color-mix(in srgb, ${c} ${pct}%, transparent)`;

export const card = { background: PAPER, border: `1px solid ${LINE}`, borderRadius: R_LG, padding: 20, boxShadow: SHADOW_SM, transition: tx("transform", "box-shadow", "border-color") };
export const inputStyle = { width: "100%", padding: "11px 13px", border: `1px solid ${LINE}`, borderRadius: R_SM, fontSize: 14, color: INK, background: PAPER, outline: "none", marginTop: 4, transition: tx("border-color") };
export const btnSolid = { display: "inline-flex", alignItems: "center", gap: 7, background: ACCENT, color: "#fff", border: "1px solid transparent", borderRadius: R_SM, padding: "10px 16px", fontSize: 13.5, fontWeight: 600, cursor: "pointer", boxShadow: SHADOW_SM, transition: tx("transform", "box-shadow", "background") };
export const btnGhost = { display: "inline-flex", alignItems: "center", gap: 7, background: "transparent", color: INK, border: `1px solid ${LINE}`, borderRadius: R_SM, padding: "10px 16px", fontSize: 13.5, fontWeight: 500, cursor: "pointer", transition: tx("background", "border-color") };
export const label = { ...mono, fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: STONE };
