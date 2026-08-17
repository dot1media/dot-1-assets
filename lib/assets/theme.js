import { BRAND } from "../brand";
const C = BRAND.colors;
export const RED = C.red, INK = C.ink, BODY = C.body, STONE = C.stone, FAINT = C.faint;
export const LINE = C.line, PAPER = C.paper, CREAM = C.cream, OK = C.ok, WARN = C.warn, DANGER = C.danger;

export const display = { fontFamily: BRAND.fonts.display };
export const mono = { fontFamily: BRAND.fonts.mono };
export const sans = { fontFamily: BRAND.fonts.sans };

export const money = (n) => "$" + Math.round(Number(n || 0)).toLocaleString();

export const card = { background: PAPER, border: `1px solid ${LINE}`, borderRadius: 14, padding: 20 };
export const inputStyle = { width: "100%", padding: "10px 12px", border: `1px solid ${LINE}`, borderRadius: 8, fontSize: 14, color: INK, background: PAPER, outline: "none", marginTop: 4 };
export const btnSolid = { display: "inline-flex", alignItems: "center", gap: 7, background: RED, color: "#fff", border: "none", borderRadius: 9, padding: "10px 16px", fontSize: 13.5, fontWeight: 600, cursor: "pointer" };
export const btnGhost = { display: "inline-flex", alignItems: "center", gap: 7, background: "transparent", color: INK, border: `1px solid ${LINE}`, borderRadius: 9, padding: "10px 16px", fontSize: 13.5, fontWeight: 500, cursor: "pointer" };
export const label = { ...mono, fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: STONE };

