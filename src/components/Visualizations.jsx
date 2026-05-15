import { useState, useMemo, useEffect, useRef } from "react";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  ScatterChart, Scatter, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";
import { getNumericCols, getTextCols, CHART_COLORS } from "../utils/data.js";

const CHART_TYPES = [
  { id: "bar",     label: "Bar",     icon: "▬" },
  { id: "line",    label: "Line",    icon: "╱" },
  { id: "area",    label: "Area",    icon: "△" },
  { id: "pie",     label: "Pie",     icon: "◔" },
  { id: "scatter", label: "Scatter", icon: "⠿" },
  { id: "histogram", label: "Histogram", icon: "⊞" },
];

const RANK_TYPES = [
  { id: "top", label: "Top Performing" },
  { id: "bottom", label: "Poorly Performing" },
];

const AGG_OPS = [
  { id: "sum", label: "Sum" },
  { id: "avg", label: "Average" },
  { id: "count", label: "Count" },
  { id: "max", label: "Max" },
  { id: "min", label: "Min" },
];

const TOOLTIP_STYLE = {
  background: "var(--bg2)",
  border: "1px solid var(--border2)",
  borderRadius: 8,
  color: "var(--text0)",
  fontSize: 12,
};

const AXIS_STYLE = { fill: "var(--text2)", fontSize: 11 };

function createHistogramBins(values, numBins = 20) {
  const numericValues = values.filter(v => typeof v === "number" && !isNaN(v));
  if (!numericValues.length) return [];
  
  const min = Math.min(...numericValues);
  const max = Math.max(...numericValues);
  const range = max === min ? 1 : max - min;
  const binWidth = range / numBins;
  
  const bins = Array.from({ length: numBins }, (_, i) => ({
    range: `${(min + i * binWidth).toFixed(2)} - ${(min + (i + 1) * binWidth).toFixed(2)}`,
    min: min + i * binWidth,
    max: min + (i + 1) * binWidth,
    count: 0,
  }));
  
  numericValues.forEach(val => {
    const binIndex = Math.min(Math.floor((val - min) / binWidth), numBins - 1);
    bins[binIndex].count += 1;
  });
  
  return bins.filter(bin => bin.count > 0);
}

function detectCategoryCols(headers, rows) {
  const sample = rows.slice(0, 50);
  return headers.filter(h => {
    const values = sample
      .map(r => r[h])
      .filter(v => v !== undefined && v !== null && String(v).trim() !== "");
    if (!values.length) return false;
    const unique = [...new Set(values.map(v => String(v)))];
    if (unique.length <= 20) return true;
    const allNumeric = values.every(v => typeof v === "number" || !isNaN(Number(v)));
    return !allNumeric;
  });
}

function buildRankingTitle(rankType, rankN, groupCol, aggType, metricCol) {
  const direction = rankType === "top" ? "Top" : "Bottom";
  const performance = rankType === "top" ? "Best Performing" : "Lowest Performing";
  const aggLabel = AGG_OPS.find(op => op.id === aggType)?.label || "Metric";
  return `${direction} ${rankN} ${performance} ${groupCol || "groups"} by ${aggLabel} ${metricCol}`;
}

function aggregateRanking(rows, groupCol, metricCol, aggType, rankType, n) {
  const groups = rows.reduce((memo, row) => {
    const groupKey = String(row[groupCol] ?? "(blank)");
    const value = Number(row[metricCol]);
    if (!memo[groupKey]) memo[groupKey] = [];
    if (!isNaN(value)) memo[groupKey].push(value);
    return memo;
  }, {});

  const aggregated = Object.entries(groups).map(([group, values]) => {
    const count = values.length;
    const sum = values.reduce((sumAcc, item) => sumAcc + item, 0);
    const avg = count ? sum / count : 0;
    const max = count ? Math.max(...values) : 0;
    const min = count ? Math.min(...values) : 0;
    const valueMap = { sum, avg, count, max, min };
    return {
      group,
      metric: valueMap[aggType],
      count,
      sum,
      avg,
      max,
      min,
    };
  }).filter(item => item.count > 0);

  const sorted = aggregated.sort((a, b) => {
    const aVal = Number(a.metric);
    const bVal = Number(b.metric);
    if (rankType === "top") return bVal - aVal;
    return aVal - bVal;
  });

  return sorted.slice(0, Math.max(1, Number(n) || 10));
}

export default function Visualizations({ data, toast }) {
  const numCols = useMemo(() => data ? getNumericCols(data.headers, data.rows) : [], [data]);
  const textCols = useMemo(() => data ? getTextCols(data.headers, data.rows) : [], [data]);
  const allCols = data?.headers || [];

  const [chartType, setChartType] = useState("bar");
  const [xCol, setXCol] = useState("");
  const [yCols, setYCols] = useState([]);
  const [histogramCol, setHistogramCol] = useState("");
  const [histogramBins, setHistogramBins] = useState(20);
  const [useRanking, setUseRanking] = useState(false);
  const [rankType, setRankType] = useState("top");
  const [rankN, setRankN] = useState(10);
  const [groupCol, setGroupCol] = useState("");
  const [metricCol, setMetricCol] = useState("");
  const [aggType, setAggType] = useState("sum");
  const [rankedData, setRankedData] = useState([]);
  const [chartTitle, setChartTitle] = useState("");
  const [warningMessage, setWarningMessage] = useState("");
  const chartRef = useRef(null);

  const categoryCols = useMemo(() => {
    if (!data) return [];
    const detected = detectCategoryCols(allCols, data.rows);
    return [...new Set([...textCols, ...detected])];
  }, [data, allCols, textCols]);

  useEffect(() => {
    if (allCols.length) setXCol(allCols[0]);
    if (numCols.length) setYCols(numCols.slice(0, 2));
    if (numCols.length && !histogramCol) setHistogramCol(numCols[0]);
    if (categoryCols.length && !groupCol) setGroupCol(categoryCols[0]);
    if (numCols.length && !metricCol) setMetricCol(numCols[0]);
    if (data?.rows.length > 5000) setRankN(10);
  }, [data, allCols, numCols, categoryCols, groupCol, metricCol, histogramCol]);

  useEffect(() => {
    if (!data) return;
    const rows = data.rows || [];

    if (useRanking && groupCol && metricCol && rows.length) {
      const ranked = aggregateRanking(rows, groupCol, metricCol, aggType, rankType, rankN);
      setRankedData(ranked);
      setChartTitle(buildRankingTitle(rankType, rankN, groupCol, aggType, metricCol));
    } else {
      const titleParts = [CHART_TYPES.find(type => type.id === chartType)?.label || "Chart"];
      if (yCols.length) titleParts.push(yCols.join(", "));
      if (xCol) titleParts.push(`by ${xCol}`);
      setChartTitle(titleParts.join(" "));
      setRankedData([]);
    }

    if (rows.length > 5000 && !useRanking) {
      setWarningMessage("Large dataset detected. Consider ranking or filtering for better visualization.");
    } else {
      setWarningMessage("");
    }
  }, [data, useRanking, groupCol, metricCol, aggType, rankType, rankN, chartType, xCol, yCols]);

  if (!data) return (
    <div className="panel">
      <div className="empty"><div className="empty-icon">📊</div><div className="empty-msg">No Data Loaded</div><div className="empty-hint">Load a dataset from the Data Manager first.</div></div>
    </div>
  );

  const toggleY = col => setYCols(p => p.includes(col) ? p.filter(c => c !== col) : [...p, col]);

  const previewData = useMemo(() => {
    const rows = data.rows || [];
    if (useRanking && rankedData.length) return rankedData;
    return rows.slice(0, 80);
  }, [data, useRanking, rankedData]);

  const effectiveX = useMemo(() => {
    if (useRanking) return "group";
    return xCol || allCols[0] || "";
  }, [useRanking, xCol, allCols]);

  const effectiveY = useMemo(() => {
    if (useRanking) return ["metric"];
    return yCols.length ? yCols : numCols.slice(0, 2);
  }, [useRanking, yCols, numCols]);

  const scatterData = useMemo(() => {
    if (chartType !== "scatter") return [];
    if (useRanking && rankedData.length) {
      return rankedData.map((row, index) => ({ x: index + 1, y: Number(row.metric) || 0, label: row.group }));
    }
    const xKey = numCols.includes(xCol) ? xCol : yCols[0] || numCols[0];
    const yKey = yCols[1] || yCols[0] || numCols[1] || numCols[0];
    return previewData.map(row => ({ x: Number(row[xKey]) || 0, y: Number(row[yKey]) || 0, label: String(row[xKey] ?? "") }));
  }, [chartType, useRanking, rankedData, previewData, xCol, yCols, numCols]);

  const pieData = useMemo(() => {
    const dataSource = previewData;
    const nameKey = effectiveX;
    const valueKey = effectiveY[0];
    if (!nameKey || !valueKey) return [];
    return dataSource.map((row, index) => ({
      name: String(row[nameKey] ?? row.group ?? `Row ${index + 1}`),
      value: Number(row[valueKey]) || 0,
    }));
  }, [previewData, effectiveX, effectiveY]);

  const downloadSVG = () => {
    const svg = chartRef.current?.querySelector("svg");
    if (!svg) { toast("No chart to download"); return; }
    const clone = svg.cloneNode(true);
    clone.setAttribute("style", "background:#fff;");
    const serialized = new XMLSerializer().serializeToString(clone);
    const blob = new Blob([serialized], { type: "image/svg+xml" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `chart_${chartType}.svg`;
    a.click();
    URL.revokeObjectURL(a.href);
    toast("⤓ Chart downloaded as SVG");
  };

  const loadExampleChart = () => {
    if (allCols.includes("Month") && numCols.includes("Sales")) {
      setChartType("line");
      setXCol("Month");
      setYCols(["Sales"]);
      toast("✓ Loaded Sales vs Months example");
    } else {
      toast("⚠ Sample data not loaded. Load sample data first.");
    }
  };

  const histogramData = useMemo(() => {
    if (chartType !== "histogram" || !histogramCol) return [];
    const values = data.rows.map(r => Number(r[histogramCol])).filter(v => !isNaN(v));
    return createHistogramBins(values, histogramBins);
  }, [chartType, histogramCol, histogramBins, data]);

  const renderChart = () => {
    const common = { margin: { top: 10, right: 24, bottom: 24, left: 10 } };
    const grid = <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />;
    const xAxis = <XAxis dataKey={effectiveX} tick={AXIS_STYLE} axisLine={{ stroke: "var(--border)" }} tickLine={false} />;
    const yAxis = <YAxis tick={AXIS_STYLE} axisLine={false} tickLine={false} width={52} />;
    const tooltip = <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: "rgba(108,99,255,0.07)" }} />;
    const legend = <Legend wrapperStyle={{ fontSize: 12, color: "var(--text2)", paddingTop: 10 }} />;

    if (chartType === "bar") return (
      <BarChart data={previewData} {...common}>
        {grid}{xAxis}{yAxis}{tooltip}{legend}
        {effectiveY.map((c, i) => (
          <Bar key={c} dataKey={c} fill={CHART_COLORS[i % CHART_COLORS.length]} radius={[4, 4, 0, 0]} maxBarSize={48} />
        ))}
      </BarChart>
    );

    if (chartType === "line") return (
      <LineChart data={previewData} {...common}>
        {grid}{xAxis}{yAxis}{tooltip}{legend}
        {effectiveY.map((c, i) => (
          <Line key={c} type="monotone" dataKey={c} stroke={CHART_COLORS[i % CHART_COLORS.length]} strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 6 }} />
        ))}
      </LineChart>
    );

    if (chartType === "area") return (
      <AreaChart data={previewData} {...common}>
        {grid}{xAxis}{yAxis}{tooltip}{legend}
        {effectiveY.map((c, i) => (
          <Area key={c} type="monotone" dataKey={c} stroke={CHART_COLORS[i % CHART_COLORS.length]}
            fill={CHART_COLORS[i % CHART_COLORS.length]} fillOpacity={0.12} strokeWidth={2} />
        ))}
      </AreaChart>
    );

    if (chartType === "scatter") return (
      <ScatterChart {...common}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis dataKey="x" tick={AXIS_STYLE} axisLine={false} tickLine={false} />
        <YAxis dataKey="y" tick={AXIS_STYLE} axisLine={false} tickLine={false} width={52} />
        <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ strokeDasharray: "3 3" }} formatter={(value) => [value]} />
        <Scatter data={scatterData} fill={CHART_COLORS[0]} opacity={0.8} />
      </ScatterChart>
    );

    if (chartType === "pie") return (
      <PieChart>
        <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="48%"
          outerRadius={140} innerRadius={50}
          label={({ name, percent }) => percent > 0.03 ? `${name} ${(percent * 100).toFixed(1)}%` : ""}
          labelLine={true}>
          {pieData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
        </Pie>
        <Tooltip contentStyle={TOOLTIP_STYLE} />
        <Legend wrapperStyle={{ fontSize: 12, color: "var(--text2)" }} />
      </PieChart>
    );
    if (chartType === "histogram") return (
      <BarChart data={histogramData} margin={{ top: 10, right: 24, bottom: 24, left: 10 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis dataKey="range" tick={{ ...AXIS_STYLE, fontSize: 10 }} axisLine={{ stroke: "var(--border)" }} tickLine={false} angle={-45} height={80} />
        <YAxis tick={AXIS_STYLE} axisLine={false} tickLine={false} width={52} label={{ value: "Frequency", angle: -90, position: "insideLeft" }} />
        <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: "rgba(123,63,237,0.07)" }} />
        <Bar dataKey="count" fill={CHART_COLORS[0]} radius={[4, 4, 0, 0]} />
      </BarChart>
    );
  };

  return (
    <div className="panel">
      <div className="section-title">Visualizations</div>
      <div className="section-sub">Build interactive charts. Select chart type, ranking, and metrics for a more intelligent BI workflow.</div>

      <div className="card">
        <div className="card-title">Performance Ranking Analytics</div>
        <div className="grid-3" style={{ gap: 20, marginBottom: 16 }}>
          <div>
            <label>Ranking Type</label>
            <select value={rankType} onChange={e => setRankType(e.target.value)}>
              {RANK_TYPES.map(option => <option key={option.id} value={option.id}>{option.label}</option>)}
            </select>
          </div>
          <div>
            <label>Top / Bottom N</label>
            <input type="number" min="1" step="1" value={rankN} onChange={e => setRankN(e.target.value)} placeholder="10" />
          </div>
          <div>
            <label>Group By</label>
            <select value={groupCol} onChange={e => setGroupCol(e.target.value)}>
              {categoryCols.map(col => <option key={col} value={col}>{col}</option>)}
            </select>
          </div>
          <div>
            <label>Metric</label>
            <select value={metricCol} onChange={e => setMetricCol(e.target.value)}>
              {numCols.map(col => <option key={col} value={col}>{col}</option>)}
            </select>
          </div>
          <div>
            <label>Aggregation</label>
            <select value={aggType} onChange={e => setAggType(e.target.value)}>
              {AGG_OPS.map(option => <option key={option.id} value={option.id}>{option.label}</option>)}
            </select>
          </div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 12 }}>
            <button className={`btn ${useRanking ? "btn-danger" : "btn-primary"} btn-sm`} onClick={() => setUseRanking(prev => !prev)}>
              {useRanking ? "Disable Ranking" : "Enable Ranking"}
            </button>
            <button className="btn btn-ghost btn-sm" onClick={() => setUseRanking(true)}>Apply Ranking</button>
          </div>
        </div>
        <div style={{ fontSize: 13, color: "var(--text2)", lineHeight: 1.6 }}>
          Ranking is computed in browser memory. If your dataset is large, the chart will plot only the ranked summary instead of the raw row-level dataset.
        </div>
      </div>

      {warningMessage && (
        <div className="card" style={{ borderColor: "var(--amber)", background: "rgba(251,191,36,0.08)" }}>
          <div className="card-title">Performance Warning</div>
          <div style={{ color: "var(--text0)", fontSize: 14 }}>{warningMessage}</div>
        </div>
      )}

      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 14, marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 13, color: "var(--text2)", marginBottom: 6 }}>Chart title</div>
            <div style={{ fontSize: 18, fontWeight: 700 }}>{chartTitle || "Select columns to build a chart"}</div>
          </div>
          <div className="row">
            <button className="btn btn-ghost btn-sm" onClick={loadExampleChart}>📈 Example: Sales vs Months</button>
            <button className="btn btn-ghost btn-sm" onClick={downloadSVG}>⤓ SVG</button>
          </div>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 16, marginBottom: 18 }}>
          <div style={{ minWidth: 200, flex: 1 }}>
            <label>Chart Type</label>
            <select value={chartType} onChange={e => setChartType(e.target.value)}>
              {CHART_TYPES.map(type => <option key={type.id} value={type.id}>{type.label}</option>)}
            </select>
          </div>
          {chartType === "histogram" ? (
            <>
              <div style={{ minWidth: 200, flex: 1 }}>
                <label>Column</label>
                <select value={histogramCol} onChange={e => setHistogramCol(e.target.value)}>
                  {numCols.map(col => <option key={col} value={col}>{col}</option>)}
                </select>
              </div>
              <div style={{ minWidth: 180, flex: 1 }}>
                <label>Number of Bins</label>
                <input type="number" min="5" max="50" value={histogramBins} onChange={e => setHistogramBins(Math.max(5, Number(e.target.value) || 20))} />
              </div>
            </>
          ) : chartType !== "scatter" ? (
            <>
              <div style={{ minWidth: 200, flex: 1 }}>
                <label>X / Category Axis</label>
                <select value={xCol} onChange={e => setXCol(e.target.value)}>
                  {allCols.map(col => <option key={col} value={col}>{col}</option>)}
                </select>
              </div>
              <div style={{ minWidth: 260, flex: 2 }}>
                <label>Y Columns (click to toggle)</label>
                <div className="chip-row" style={{ marginTop: 8 }}>
                  {numCols.map(col => (
                    <button key={col} className="chip" onClick={() => toggleY(col)}
                      style={yCols.includes(col) ? { borderColor: "var(--accent2)", color: "var(--accent2)", background: "rgba(167,139,250,0.1)" } : {}}>
                      {col}
                    </button>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div style={{ minWidth: 260, flex: 2 }}>
              <label>Scatter Axes</label>
              <div className="chip-row" style={{ marginTop: 8 }}>
                {numCols.map(col => (
                  <button key={col} className="chip" onClick={() => toggleY(col)}
                    style={yCols.includes(col) ? { borderColor: "var(--accent2)", color: "var(--accent2)", background: "rgba(167,139,250,0.1)" } : {}}>
                    {col}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div ref={chartRef} style={{ background: "var(--bg0)", borderRadius: "var(--radius)", padding: "12px 0" }}>
          <ResponsiveContainer width="100%" height={420}>
            {renderChart()}
          </ResponsiveContainer>
        </div>
      </div>

      {chartType !== "histogram" && effectiveY.length >= 1 && numCols.length >= 2 && (
        <div className="card">
          <div className="card-title">Quick Column Comparison</div>
          <div className="grid-2">
            {numCols.slice(0, 4).map((col, i) => (
              <div key={col} style={{ background: "var(--bg0)", borderRadius: "var(--radius)", padding: "8px 0" }}>
                <div style={{ fontSize: 11, color: "var(--text2)", fontFamily: "var(--font-mono)", textAlign: "center", marginBottom: 4 }}>{col}</div>
                <ResponsiveContainer width="100%" height={140}>
                  <BarChart data={previewData} margin={{ top: 4, right: 8, bottom: 4, left: 0 }}>
                    <XAxis dataKey={effectiveX} tick={{ fill: "var(--text3)", fontSize: 9 }} axisLine={false} tickLine={false} />
                    <YAxis hide />
                    <Tooltip contentStyle={TOOLTIP_STYLE} />
                    <Bar dataKey={col} fill={CHART_COLORS[i % CHART_COLORS.length]} radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
