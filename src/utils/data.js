import Papa from "papaparse";
import * as XLSX from "xlsx";

/* ─── CSV / Excel parsing ─── */
export function parseCSV(text) {
  const cleaned = text.replace(/^\uFEFF/, "").trim();
  const result = Papa.parse(cleaned, {
    header: true,
    dynamicTyping: true,
    skipEmptyLines: true,
    comments: "#",
    transformHeader: h => h.trim(),
  });
  const headers = result.meta.fields ? result.meta.fields.map(h => h.trim()) : [];
  const rows = result.data.map(row => {
    const cleanedRow = {};
    headers.forEach(h => {
      cleanedRow[h] = row[h] ?? "";
    });
    return cleanedRow;
  });
  return { headers, rows };
}

export async function parseJSON(file) {
  const text = await file.text();
  const data = JSON.parse(text);
  if (!Array.isArray(data) || !data.length) throw new Error("JSON must be an array of objects.");
  const headers = Object.keys(data[0]);
  const rows = data.map(row => {
    const r = {};
    headers.forEach(h => {
      const v = row[h] ?? "";
      r[h] = v === "" ? "" : isNaN(v) ? String(v) : Number(v);
    });
    return r;
  });
  return { headers, rows };
}

export async function parseFile(file) {
  const ext = file.name.split(".").pop().toLowerCase();
  if (["xlsx", "xls"].includes(ext)) return parseExcel(file);
  if (ext === "json") return parseJSON(file);
  const text = await file.text();
  return parseCSV(text);
}

/* ─── Column type helpers ─── */
export function getNumericCols(headers, rows) {
  return headers.filter(h => rows.some(r => typeof r[h] === "number" && !isNaN(r[h])));
}

export function getTextCols(headers, rows) {
  return headers.filter(h => rows.some(r => typeof r[h] === "string"));
}

export function correlation(rows, xCol, yCol) {
  const pairs = rows
    .map(r => ({ x: Number(r[xCol]), y: Number(r[yCol]) }))
    .filter(p => !isNaN(p.x) && !isNaN(p.y));
  if (pairs.length < 2) return null;
  const mx = pairs.reduce((s, p) => s + p.x, 0) / pairs.length;
  const my = pairs.reduce((s, p) => s + p.y, 0) / pairs.length;
  let num = 0;
  let denX = 0;
  let denY = 0;
  pairs.forEach(p => {
    const dx = p.x - mx;
    const dy = p.y - my;
    num += dx * dy;
    denX += dx * dx;
    denY += dy * dy;
  });
  const denom = Math.sqrt(denX * denY);
  return denom === 0 ? 0 : num / denom;
}

export function sortRows(rows, col, order = "desc") {
  return [...rows].sort((a, b) => {
    const va = a[col];
    const vb = b[col];
    if (typeof va === "number" && typeof vb === "number") {
      return order === "desc" ? vb - va : va - vb;
    }
    const sa = String(va ?? "").toLowerCase();
    const sb = String(vb ?? "").toLowerCase();
    if (sa < sb) return order === "desc" ? 1 : -1;
    if (sa > sb) return order === "desc" ? -1 : 1;
    return 0;
  });
}

export function textFrequency(rows, col) {
  const counts = rows.reduce((acc, row) => {
    const value = row[col] ?? "(blank)";
    const key = String(value);
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
  return Object.entries(counts)
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => b.count - a.count);
}

/* ─── Statistics ─── */
export function computeStat(rows, col, op) {
  const vals = rows.map(r => Number(r[col])).filter(v => !isNaN(v));
  if (!vals.length) return null;
  switch (op) {
    case "sum":    return vals.reduce((a, b) => a + b, 0);
    case "avg":    return vals.reduce((a, b) => a + b, 0) / vals.length;
    case "min":    return Math.min(...vals);
    case "max":    return Math.max(...vals);
    case "count":  return vals.length;
    case "std": {
      const m = vals.reduce((a, b) => a + b, 0) / vals.length;
      return Math.sqrt(vals.map(v => (v - m) ** 2).reduce((a, b) => a + b, 0) / vals.length);
    }
    case "median": {
      const s = [...vals].sort((a, b) => a - b);
      const mid = Math.floor(s.length / 2);
      return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
    }
    default: return null;
  }
}

export function allStats(rows, col) {
  return {
    sum:    computeStat(rows, col, "sum"),
    avg:    computeStat(rows, col, "avg"),
    min:    computeStat(rows, col, "min"),
    max:    computeStat(rows, col, "max"),
    median: computeStat(rows, col, "median"),
    std:    computeStat(rows, col, "std"),
    count:  computeStat(rows, col, "count"),
  };
}

/* ─── Number formatting ─── */
export function fmt(v, decimals = 3) {
  if (v === null || v === undefined) return "—";
  if (typeof v !== "number") return v;
  if (!isFinite(v)) return "∞";
  return v % 1 === 0
    ? v.toLocaleString()
    : v.toLocaleString(undefined, { maximumFractionDigits: decimals });
}

/* ─── Filter rows ─── */
export function filterRows(rows, col, op, val) {
  const n = Number(val);
  return rows.filter(r => {
    const v = Number(r[col]);
    if (isNaN(v)) return false;
    switch (op) {
      case ">":  return v > n;
      case "<":  return v < n;
      case ">=": return v >= n;
      case "<=": return v <= n;
      case "==": return v === n;
      case "!=": return v !== n;
      default:   return true;
    }
  });
}

/* ─── Group-by ─── */
export function groupBy(rows, groupCol, aggCol) {
  const groups = {};
  rows.forEach(r => {
    const key = String(r[groupCol] ?? "(blank)");
    if (!groups[key]) groups[key] = [];
    const v = Number(r[aggCol]);
    if (!isNaN(v)) groups[key].push(v);
  });
  return Object.entries(groups).map(([key, vals]) => ({
    group: key,
    count: vals.length,
    sum:   fmt(vals.reduce((a, b) => a + b, 0)),
    avg:   fmt(vals.reduce((a, b) => a + b, 0) / vals.length),
    min:   fmt(Math.min(...vals)),
    max:   fmt(Math.max(...vals)),
  }));
}

/* ─── Export CSV ─── */
export function exportToCSV(headers, rows, filename = "export.csv") {
  const lines = [headers.join(","), ...rows.map(r => headers.map(h => {
    const v = r[h] ?? "";
    return typeof v === "string" && v.includes(",") ? `"${v}"` : v;
  }).join(","))];
  const blob = new Blob([lines.join("\n")], { type: "text/csv" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

/* ─── Claude API ─── */
export async function callClaude(apiKey, messages, systemPrompt, maxTokens = 1200) {
  if (!apiKey) throw new Error("No API key. Set your Anthropic API key in Settings.");

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: maxTokens,
      system: systemPrompt,
      messages,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `HTTP ${res.status}`);
  }

  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  return data.content?.[0]?.text || "";
}

/* ─── Build data context for Claude ─── */
export function buildDataContext(data, maxRows = 30) {
  if (!data) return "";
  return `
You are a senior data analyst AI. The user has loaded the following dataset.
Dataset name: ${data.name}
Columns: ${data.headers.join(", ")}
Total rows: ${data.rows.length}
${data.rows.length > maxRows ? `(Showing first ${maxRows} of ${data.rows.length} rows below)` : ""}
Data:
${JSON.stringify(data.rows.slice(0, maxRows), null, 2)}

When answering, always reference actual column names and numeric values from the data.
Be concise and precise. Use plain text only — no markdown headers or code blocks.
`.trim();
}

/* ─── Sample dataset ─── */
export const SAMPLE_DATA = {
  name: "sample_sales.csv",
  headers: ["Month", "Sales", "Expenses", "Profit", "Units", "Region"],
  rows: [
    { Month: "Jan", Sales: 42000, Expenses: 31000, Profit: 11000, Units: 210, Region: "North" },
    { Month: "Feb", Sales: 58000, Expenses: 34000, Profit: 24000, Units: 290, Region: "South" },
    { Month: "Mar", Sales: 49000, Expenses: 36000, Profit: 13000, Units: 245, Region: "North" },
    { Month: "Apr", Sales: 72000, Expenses: 41000, Profit: 31000, Units: 360, Region: "East" },
    { Month: "May", Sales: 66000, Expenses: 38000, Profit: 28000, Units: 330, Region: "West" },
    { Month: "Jun", Sales: 81000, Expenses: 44000, Profit: 37000, Units: 405, Region: "East" },
    { Month: "Jul", Sales: 75000, Expenses: 42000, Profit: 33000, Units: 375, Region: "North" },
    { Month: "Aug", Sales: 89000, Expenses: 47000, Profit: 42000, Units: 445, Region: "South" },
    { Month: "Sep", Sales: 61000, Expenses: 39000, Profit: 22000, Units: 305, Region: "West" },
    { Month: "Oct", Sales: 93000, Expenses: 51000, Profit: 42000, Units: 465, Region: "East" },
    { Month: "Nov", Sales: 110000, Expenses: 58000, Profit: 52000, Units: 550, Region: "North" },
    { Month: "Dec", Sales: 127000, Expenses: 63000, Profit: 64000, Units: 635, Region: "South" },
  ],
};

export const CHART_COLORS = ["#6c63ff","#38bdf8","#34d399","#fbbf24","#f87171","#a78bfa","#fb923c","#e879f9","#84cc16","#06b6d4"];
