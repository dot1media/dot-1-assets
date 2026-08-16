export const RED = "#e23b2e", INK = "#1a1a17", BODY = "#33322d", STONE = "#6f6d65", FAINT = "#9a988f";
export const LINE = "#e2ded4", PAPER = "#ffffff", CREAM = "#f4f0e7", OK = "#3f7a3f", WARN = "#a97a2e", DANGER = "#b5271b";

export const display = { fontFamily: "'Bodoni Moda', Georgia, 'Times New Roman', serif" };
export const mono = { fontFamily: "'IBM Plex Mono', ui-monospace, monospace" };
export const sans = { fontFamily: "'Archivo', system-ui, -apple-system, sans-serif" };

export const money = (n) => "$" + Math.round(Number(n || 0)).toLocaleString();

export const card = { background: PAPER, border: `1px solid ${LINE}`, borderRadius: 14, padding: 20 };
export const inputStyle = { width: "100%", padding: "10px 12px", border: `1px solid ${LINE}`, borderRadius: 8, fontSize: 14, color: INK, background: PAPER, outline: "none", marginTop: 4 };
export const btnSolid = { display: "inline-flex", alignItems: "center", gap: 7, background: RED, color: "#fff", border: "none", borderRadius: 9, padding: "10px 16px", fontSize: 13.5, fontWeight: 600, cursor: "pointer" };
export const btnGhost = { display: "inline-flex", alignItems: "center", gap: 7, background: "transparent", color: INK, border: `1px solid ${LINE}`, borderRadius: 9, padding: "10px 16px", fontSize: 13.5, fontWeight: 500, cursor: "pointer" };
export const label = { ...mono, fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: STONE };

