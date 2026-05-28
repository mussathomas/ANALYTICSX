import { useState, useMemo } from "react";
import { callClaude, buildDataContext, getNumericCols, allStats, fmt } from "../utils/data.js";

const MODES = [
  { id: "summary",    label: "Executive Summary",   icon: "📋", prompt: "Write a concise 4-5 sentence executive summary of this dataset. Focus on what the data represents, key magnitudes, ranges, and the overall story the numbers tell." },
  { id: "trends",     label: "Trends & Patterns",   icon: "📈", prompt: "Identify 3-5 key trends, patterns, or relationships in this dataset. Use actual column names and specific numbers from the data. Format each as a short titled paragraph." },
  { id: "outliers",   label: "Outliers & Anomalies",icon: "🔍", prompt: "Identify any outliers, anomalies, or unusual values. For each, specify the column, the unusual value, and why it stands out compared to the rest. If no outliers, say so." },
  { id: "recommend",  label: "Recommendations",     icon: "💡", prompt: "Based on the data patterns, provide 4-5 specific, actionable recommendations for further analysis or business decisions. Ground each in actual data values." },
  { id: "quality",    label: "Data Quality",        icon: "🛡", prompt: "Assess the data quality. Comment on: completeness (any apparent blanks), numeric distribution characteristics, column types, consistency, and anything suspicious or worth noting." },
];

export default function AIInsights({ data, apiKey, toast }) {
  const [insight, setInsight] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeMode, setActiveMode] = useState("summary");

  const numCols = useMemo(() => data ? getNumericCols(data.headers, data.rows) : [], [data]);

  if (!data) return (
    <div className="panel">
      <div className="empty"><div className="empty-icon">🤖</div><div className="empty-msg">No Data Loaded</div><div className="empty-hint">Load a dataset from the Data Manager first.</div></div>
    </div>
  );

  const run = async () => {
    if (!apiKey) { toast("⚠ Set your API key in Settings first"); return; }
    setLoading(true); setInsight("");
    const mode = MODES.find(m => m.id === activeMode);
    try {
      const reply = await callClaude(
        apiKey,
        [{ role: "user", content: mode.prompt }],
        buildDataContext(data, 30),
        1400
      );
      setInsight(reply);
    } catch (e) {
      setInsight("⚠ Error: " + e.message);
      toast("⚠ " + e.message);
    }
    setLoading(false);
  };

  return (
    <div className="panel">
      <div className="section-title">AI Data Interpretation</div>
      <div className="section-sub">Claude automatically reads your dataset and generates deep analytical insights — no query writing needed.</div>

      <div className="card">
        <div className="card-title">Analysis Mode</div>
        <div className="chart-type-row">
          {MODES.map(m => (
            <button key={m.id} className={`chart-type-btn ${activeMode === m.id ? "active" : ""}`} onClick={() => setActiveMode(m.id)}>
              {m.icon} {m.label}
            </button>
          ))}
        </div>
        <button className="btn btn-primary" onClick={run} disabled={loading || !apiKey}>
          {loading ? <><div className="spinner" />Analysing dataset…</> : `⚡ Generate ${MODES.find(m => m.id === activeMode)?.label}`}
        </button>
        {!apiKey && (
          <div style={{ marginTop: 12, fontSize: 13, color: "var(--amber)" }}>
            ⚠ Requires API key — click Settings in the header.
          </div>
        )}
      </div>

      {insight && (
        <div className="card">
          <div className="card-title">{MODES.find(m => m.id === activeMode)?.icon} {MODES.find(m => m.id === activeMode)?.label}</div>
          <div className="insight-text">{insight}</div>
        </div>
      )}

      {/* Dataset overview */}
      <div className="card">
        <div className="card-title">Dataset Snapshot</div>
        <div className="grid-4" style={{ marginBottom: 18 }}>
          <div className="stat-card"><div className="stat-label">Rows</div><div className="stat-value">{data.rows.length.toLocaleString()}</div></div>
          <div className="stat-card"><div className="stat-label">Columns</div><div className="stat-value">{data.headers.length}</div></div>
          <div className="stat-card"><div className="stat-label">Numeric</div><div className="stat-value">{numCols.length}</div></div>
          <div className="stat-card"><div className="stat-label">Text</div><div className="stat-value">{data.headers.length - numCols.length}</div></div>
        </div>

        <div className="card-title" style={{ marginBottom: 12 }}>Column Map</div>
        <div className="row" style={{ marginBottom: 18, flexWrap: "wrap" }}>
          {data.headers.map(h => (
            <span key={h} className={`tag ${numCols.includes(h) ? "tag-purple" : "tag-blue"}`}>
              {numCols.includes(h) ? "123" : "Aa"} {h}
            </span>
          ))}
        </div>

        {numCols.length > 0 && (
          <>
            <div className="card-title" style={{ marginBottom: 12 }}>Numeric Statistics</div>
            <div className="table-wrap">
              <table>
                <thead><tr><th>Column</th><th>Min</th><th>Max</th><th>Average</th><th>Sum</th><th>Std Dev</th></tr></thead>
                <tbody>
                  {numCols.map(col => {
                    const s = allStats(data.rows, col);
                    return (
                      <tr key={col}>
                        <td style={{ color: "var(--accent2)", fontWeight: 700 }}>{col}</td>
                        <td>{fmt(s.min)}</td>
                        <td className="num-cell">{fmt(s.max)}</td>
                        <td className="num-cell">{fmt(s.avg)}</td>
                        <td className="num-cell">{fmt(s.sum)}</td>
                        <td>{fmt(s.std)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
