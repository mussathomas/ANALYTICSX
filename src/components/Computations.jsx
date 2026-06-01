import { useState, useMemo, useEffect } from "react";
import { getNumericCols, getTextCols, computeStat, allStats, filterRows, groupBy, exportToCSV, fmt, correlation, sortRows, textFrequency } from "../utils/data.js";
import { initializeColumnState } from "../utils/dataTransform.js";

function SummaryTable({ rows, headers }) {
  const numCols = getNumericCols(headers, rows);
  if (!numCols.length) return null;
  return (
    <div className="card">
      <div className="card-title">All Numeric Columns — Full Summary</div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr><th>Column</th><th>Count</th><th>Sum</th><th>Average</th><th>Median</th><th>Min</th><th>Max</th><th>Std Dev</th></tr>
          </thead>
          <tbody>
            {numCols.map(col => {
              const s = allStats(rows, col);
              return (
                <tr key={col}>
                  <td style={{ color: "var(--accent2)", fontFamily: "var(--font-head)", fontWeight: 700 }}>{col}</td>
                  <td>{fmt(s.count)}</td>
                  <td className="num-cell">{fmt(s.sum)}</td>
                  <td className="num-cell">{fmt(s.avg)}</td>
                  <td className="num-cell">{fmt(s.median)}</td>
                  <td>{fmt(s.min)}</td>
                  <td>{fmt(s.max)}</td>
                  <td>{fmt(s.std)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function DataTablePreview({ headers, rows, maxRows = 100 }) {
  const numCols = getNumericCols(headers, rows);
  return (
    <div className="table-wrap" style={{ maxHeight: 320 }}>
      <table>
        <thead><tr><th>#</th>{headers.map(h => <th key={h}>{h}</th>)}</tr></thead>
        <tbody>
          {rows.slice(0, maxRows).map((row, i) => (
            <tr key={i}><td className="row-num">{i + 1}</td>{headers.map(h => <td key={h} className={numCols.includes(h) ? "num-cell" : ""}>{row[h] ?? ""}</td>)}</tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function Computations({ data, setData, toast }) {
  const colState = useMemo(() => initializeColumnState(data), [data]);

  const [aggCol, setAggCol] = useState("");
  const [aggOp, setAggOp] = useState("sum");
  const [aggResult, setAggResult] = useState(null);

  const [filterCol, setFilterCol] = useState("");
  const [filterOp, setFilterOp] = useState(">");
  const [filterVal, setFilterVal] = useState("");
  const [filteredRows, setFilteredRows] = useState(null);

  const [groupCol, setGroupCol] = useState("");
  const [groupAggCol, setGroupAggCol] = useState("");
  const [groupResult, setGroupResult] = useState(null);

  const [corrX, setCorrX] = useState("");
  const [corrY, setCorrY] = useState("");
  const [corrResult, setCorrResult] = useState(null);

  const [rankCol, setRankCol] = useState("");
  const [rankOrder, setRankOrder] = useState("desc");
  const [rankN, setRankN] = useState(10);
  const [rankedRows, setRankedRows] = useState(null);

  const [textCol, setTextCol] = useState("");
  const [freqData, setFreqData] = useState(null);

  const [computedColName, setComputedColName] = useState("");
  const [computedFormula, setComputedFormula] = useState("");
  const [computedResult, setComputedResult] = useState(null);

  // Initialize column state on data change
  useEffect(() => {
    if (colState.numCols.length) {
      setAggCol(colState.firstNumCol);
      setFilterCol(colState.firstNumCol);
      setGroupAggCol(colState.firstNumCol);
      setCorrX(colState.firstNumCol);
      setCorrY(colState.secondNumCol);
      setRankCol(colState.firstNumCol);
    }
    if (colState.allCols.length) setGroupCol(colState.firstAllCol);
    if (colState.textCols.length) setTextCol(colState.firstTextCol);
  }, [colState]);

  if (!data) return (
    <div className="panel">
      <div className="empty"><div className="empty-icon">🔢</div><div className="empty-msg">No Data Loaded</div><div className="empty-hint">Go to Data Manager to load a dataset first.</div></div>
    </div>
  );

  const numCols = colState.numCols;
  const allCols = colState.allCols;
  const textCols = colState.textCols;

  const runAgg = () => {
    const v = computeStat(data.rows, aggCol, aggOp);
    setAggResult({ col: aggCol, op: aggOp, value: v });
  };

  const runFilter = () => {
    const rows = filterRows(data.rows, filterCol, filterOp, filterVal);
    setFilteredRows(rows);
    toast(`Filter returned ${rows.length} rows`);
  };

  const applyFilter = () => {
    if (filteredRows) {
      setData({ ...data, rows: filteredRows });
      setFilteredRows(null);
      toast(`✓ Applied filter — ${filteredRows.length} rows`);
    }
  };

  const runGroup = () => {
    if (!groupCol || !groupAggCol) return;
    const result = groupBy(data.rows, groupCol, groupAggCol);
    setGroupResult({ result, groupCol, aggCol: groupAggCol });
  };

  const runCorrelation = () => {
    if (!corrX || !corrY) return;
    const value = correlation(data.rows, corrX, corrY);
    setCorrResult({ x: corrX, y: corrY, value });
  };

  const runRank = () => {
    if (!rankCol || !rankN) return;
    const limit = Math.max(1, Math.min(50, Number(rankN)));
    const sorted = sortRows(data.rows, rankCol, rankOrder).slice(0, limit);
    setRankedRows(sorted);
  };

  const applyRank = () => {
    if (rankedRows) {
      setData({ ...data, rows: rankedRows });
      setRankedRows(null);
      toast(`✓ Applied ranking — ${rankedRows.length} rows`);
    }
  };

  const runFrequency = () => {
    if (!textCol) return;
    const freq = textFrequency(data.rows, textCol);
    setFreqData(freq);
  };

  const computeColumn = () => {
    if (!computedColName || !computedFormula) return;
    try {
      const newRows = data.rows.map(row => {
        const newRow = { ...row };
        const computeFn = new Function(...data.headers, `return (${computedFormula});`);
        const result = computeFn(...data.headers.map(h => row[h]));
        newRow[computedColName] = isNaN(result) ? result : Number(result);
        return newRow;
      });
      const newHeaders = [...data.headers, computedColName];
      setComputedResult({ headers: newHeaders, rows: newRows });
      toast(`✓ Computed column "${computedColName}"`);
    } catch (e) {
      toast(`⚠ Formula error: ${e.message}`);
    }
  };

  const applyComputedColumn = () => {
    if (computedResult) {
      setData({ ...data, headers: computedResult.headers, rows: computedResult.rows });
      setComputedResult(null);
      toast(`✓ Applied computed column "${computedColName}"`);
    }
  };

  return (
    <div className="panel">
      <div className="section-title">Computations</div>
      <div className="section-sub">Apply statistical operations, filter rows by condition, and perform group-by aggregation.</div>

      <div className="grid-2">
        {/* Aggregation */}
        <div className="card">
          <div className="card-title">Aggregation</div>
          <div style={{ marginBottom: 12 }}>
            <label>Column</label>
            <select value={aggCol} onChange={e => setAggCol(e.target.value)}>
              {numCols.map(h => <option key={h}>{h}</option>)}
            </select>
          </div>
          <div style={{ marginBottom: 16 }}>
            <label>Operation</label>
            <select value={aggOp} onChange={e => setAggOp(e.target.value)}>
              {[["sum","Sum"],["avg","Average"],["min","Minimum"],["max","Maximum"],["count","Count"],["std","Std Deviation"],["median","Median"]].map(([v,l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
          <button className="btn btn-primary" onClick={runAgg} disabled={!aggCol}>Calculate</button>
          {aggResult && (
            <div className="result-pill">
              {aggResult.op.toUpperCase()}({aggResult.col}) = <strong>{fmt(aggResult.value)}</strong>
            </div>
          )}
        </div>

        {/* Filter */}
        <div className="card">
          <div className="card-title">Filter Rows</div>
          <div style={{ marginBottom: 10 }}>
            <label>Column</label>
            <select value={filterCol} onChange={e => setFilterCol(e.target.value)}>
              {numCols.map(h => <option key={h}>{h}</option>)}
            </select>
          </div>
          <div className="row" style={{ marginBottom: 16 }}>
            <div style={{ width: 90 }}>
              <label>Operator</label>
              <select value={filterOp} onChange={e => setFilterOp(e.target.value)}>
                {[">","<",">=","<=","==","!="].map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label>Value</label>
              <input type="number" value={filterVal} onChange={e => setFilterVal(e.target.value)} placeholder="Enter number" />
            </div>
          </div>
          <div className="row">
            <button className="btn btn-primary" onClick={runFilter} disabled={!filterCol || filterVal === ""}>Apply Filter</button>
            {filteredRows && <button className="btn btn-ghost btn-sm" onClick={() => setFilteredRows(null)}>Clear</button>}
          </div>
          {filteredRows && (
            <div className="result-pill">
              {filteredRows.length} / {data.rows.length} rows match
              {filteredRows.length > 0 && (
                <>
                  <button className="btn btn-ghost btn-xs" style={{ marginLeft: 12 }} onClick={() => exportToCSV(data.headers, filteredRows, "filtered.csv")}>⤓ Export</button>
                  <button className="btn btn-green btn-xs" style={{ marginLeft: 6 }} onClick={applyFilter}>✓ Apply to Dataset</button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Group By */}
      <div className="card">
        <div className="card-title">Group By Analysis</div>
        <div className="grid-3" style={{ marginBottom: 16 }}>
          <div>
            <label>Group By Column</label>
            <select value={groupCol} onChange={e => setGroupCol(e.target.value)}>
              {allCols.map(h => <option key={h}>{h}</option>)}
            </select>
          </div>
          <div>
            <label>Aggregate Column</label>
            <select value={groupAggCol} onChange={e => setGroupAggCol(e.target.value)}>
              {numCols.map(h => <option key={h}>{h}</option>)}
            </select>
          </div>
          <div style={{ display: "flex", alignItems: "flex-end" }}>
            <button className="btn btn-primary" style={{ width: "100%" }} onClick={runGroup} disabled={!groupCol || !groupAggCol}>Run Group By</button>
          </div>
        </div>
        {groupResult && (
          <>
            <div className="row" style={{ marginBottom: 12 }}>
              <span className="tag tag-purple">Grouped by: {groupResult.groupCol}</span>
              <span className="tag tag-blue">Aggregating: {groupResult.aggCol}</span>
              <button className="btn btn-ghost btn-xs" onClick={() => exportToCSV(["group","count","sum","avg","min","max"], groupResult.result, "grouped.csv")}>⤓ Export</button>
            </div>
            <div className="table-wrap" style={{ maxHeight: 280 }}>
              <table>
                <thead><tr><th>Group</th><th>Count</th><th>Sum</th><th>Average</th><th>Min</th><th>Max</th></tr></thead>
                <tbody>
                  {groupResult.result.map((r, i) => (
                    <tr key={i}>
                      <td style={{ color: "var(--accent2)", fontWeight: 600 }}>{r.group}</td>
                      <td>{r.count}</td>
                      <td className="num-cell">{r.sum}</td>
                      <td className="num-cell">{r.avg}</td>
                      <td>{r.min}</td>
                      <td>{r.max}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      <div className="card">
        <div className="card-title">Quick Insights</div>
        <div className="grid-3" style={{ gap: 18, marginBottom: 16 }}>
          <div>
            <label>Correlation</label>
            <div className="row" style={{ gap: 10, alignItems: "flex-end", marginBottom: 12 }}>
              <div style={{ flex: 1 }}>
                <select value={corrX} onChange={e => setCorrX(e.target.value)}>
                  {numCols.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <select value={corrY} onChange={e => setCorrY(e.target.value)}>
                  {numCols.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>
            </div>
            <button className="btn btn-primary" onClick={runCorrelation} disabled={!corrX || !corrY}>Compute Correlation</button>
            {corrResult && (
              <div className="result-pill" style={{ marginTop: 12 }}>
                Pearson r({corrResult.x}, {corrResult.y}) = <strong>{fmt(corrResult.value, 4)}</strong>
              </div>
            )}
          </div>
          <div>
            <label>Top / Bottom Rows</label>
            <div className="row" style={{ gap: 10, alignItems: "flex-end", marginBottom: 12 }}>
              <div style={{ flex: 1 }}>
                <select value={rankCol} onChange={e => setRankCol(e.target.value)}>
                  {data.headers.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>
              <div style={{ width: 110 }}>
                <select value={rankOrder} onChange={e => setRankOrder(e.target.value)}>
                  <option value="desc">Top</option>
                  <option value="asc">Bottom</option>
                </select>
              </div>
            </div>
            <div className="row" style={{ gap: 10, alignItems: "flex-end", marginBottom: 12 }}>
              <div style={{ width: 120 }}>
                <input type="number" min="1" max="50" value={rankN} onChange={e => setRankN(e.target.value)} placeholder="N" />
              </div>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={runRank} disabled={!rankCol}>Show Rows</button>
            </div>
            {rankedRows && <div className="result-pill">Showing {rankedRows.length} rows sorted by {rankCol} ({rankOrder === "desc" ? "highest" : "lowest"}) <button className="btn btn-green btn-xs" style={{ marginLeft: 12 }} onClick={applyRank}>✓ Apply to Dataset</button></div>}
          </div>
          <div>
            <label>Text Frequency</label>
            <div style={{ marginBottom: 12 }}>
              <select value={textCol} onChange={e => setTextCol(e.target.value)}>
                {textCols.map(h => <option key={h} value={h}>{h}</option>)}
              </select>
            </div>
            <button className="btn btn-primary" onClick={runFrequency} disabled={!textCol}>Count Values</button>
            {freqData && (
              <div className="result-pill" style={{ marginTop: 12, textAlign: "left" }}>
                Top values for {textCol}: {freqData.slice(0, 3).map(item => `${item.value} (${item.count})`).join(", ")}
              </div>
            )}
          </div>
        </div>
        {rankedRows && (
          <div className="card" style={{ marginBottom: 18, padding: 16 }}>
            <div className="card-title">Ranked Rows Preview</div>
            <div className="table-wrap" style={{ maxHeight: 240 }}>
              <table>
                <thead>
                  <tr><th>#</th>{data.headers.map(h => <th key={h}>{h}</th>)}</tr>
                </thead>
                <tbody>
                  {rankedRows.slice(0, 10).map((row, i) => (
                    <tr key={i}><td className="row-num">{i + 1}</td>{data.headers.map(h => <td key={h}>{row[h] ?? ""}</td>)}</tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {freqData && (
          <div className="card" style={{ padding: 16 }}>
            <div className="card-title">Frequency Summary</div>
            <div className="table-wrap" style={{ maxHeight: 240 }}>
              <table>
                <thead><tr><th>Value</th><th>Count</th></tr></thead>
                <tbody>
                  {freqData.slice(0, 10).map((row, i) => (
                    <tr key={i}><td>{row.value}</td><td>{row.count}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
      <div className="card">
        <div className="card-title">Computed Columns</div>
        <div className="grid-3" style={{ marginBottom: 16 }}>
          <div>
            <label>New Column Name</label>
            <input type="text" value={computedColName} onChange={e => setComputedColName(e.target.value)} placeholder="e.g., Profit_Margin" />
          </div>
          <div style={{ gridColumn: "span 2" }}>
            <label>Formula (use column names as variables)</label>
            <input type="text" value={computedFormula} onChange={e => setComputedFormula(e.target.value)} placeholder="e.g., Sales - Expenses, or Sales * 0.1" />
            <div style={{ fontSize: 12, color: "var(--text2)", marginTop: 4 }}>
              Examples: Sales - Expenses, Sales * 0.1, Math.round(Profit / Sales * 100)
            </div>
          </div>
        </div>
        <div className="row">
          <button className="btn btn-primary" onClick={computeColumn} disabled={!computedColName || !computedFormula}>Compute Column</button>
          {computedResult && <button className="btn btn-green" onClick={applyComputedColumn}>✓ Apply to Dataset</button>}
        </div>
        {computedResult && (
          <div className="result-pill" style={{ marginTop: 12 }}>
            Preview: {computedResult.rows.length} rows with new column "{computedColName}"
          </div>
        )}
      </div>

      {filteredRows && filteredRows.length > 0 && (
        <div className="card">
          <div className="card-title">Filtered Results — {filteredRows.length} rows</div>
          <div className="table-wrap" style={{ maxHeight: 320 }}>
            <table>
              <thead><tr><th>#</th>{data.headers.map(h => <th key={h}>{h}</th>)}</tr></thead>
              <tbody>
                {filteredRows.slice(0, 100).map((row, i) => (
                  <tr key={i}><td className="row-num">{i + 1}</td>{data.headers.map(h => <td key={h}>{row[h] ?? ""}</td>)}</tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
