import { useState, useCallback } from "react";
import { parseFile, exportToCSV, SAMPLE_DATA, getNumericCols, fmt, computeStat } from "../utils/data.js";

function StatsStrip({ rows, headers }) {
  const numCols = getNumericCols(headers, rows);
  const col = numCols[0];
  return (
    <div className="grid-4" style={{ marginBottom: 18 }}>
      <div className="stat-card">
        <div className="stat-label">Rows</div>
        <div className="stat-value">{rows.length.toLocaleString()}</div>
        <div className="stat-sub">records loaded</div>
      </div>
      <div className="stat-card">
        <div className="stat-label">Columns</div>
        <div className="stat-value">{headers.length}</div>
        <div className="stat-sub">{numCols.length} numeric</div>
      </div>
      {col ? (
        <>
          <div className="stat-card">
            <div className="stat-label">Sum — {col}</div>
            <div className="stat-value">{fmt(computeStat(rows, col, "sum"))}</div>
            <div className="stat-sub">first numeric col</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Avg — {col}</div>
            <div className="stat-value">{fmt(computeStat(rows, col, "avg"))}</div>
            <div className="stat-sub">mean value</div>
          </div>
        </>
      ) : (
        <div className="stat-card">
          <div className="stat-label">Type</div>
          <div className="stat-value" style={{ fontSize: 18 }}>Text only</div>
          <div className="stat-sub">no numeric columns</div>
        </div>
      )}
    </div>
  );
}

function DataTable({ headers, rows }) {
  const numCols = getNumericCols(headers, rows);
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>#</th>
            {headers.map(h => <th key={h}>{h}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri}>
              <td className="row-num">{ri + 1}</td>
              {headers.map(h => (
                <td key={h} className={numCols.includes(h) ? "num-cell" : ""}>
                  {row[h] ?? ""}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ManualSheet({ onUse }) {
  const initHeaders = ["Column A", "Column B", "Column C", "Column D"];
  const [headers, setHeaders] = useState(initHeaders);
  const [rows, setRows] = useState(() =>
    Array.from({ length: 6 }, () => Object.fromEntries(initHeaders.map(h => [h, ""])))
  );

  const updateHeader = (i, val) => {
    const newH = [...headers];
    const old = newH[i];
    newH[i] = val;
    setHeaders(newH);
    setRows(rows.map(r => {
      const nr = { ...r };
      nr[val] = nr[old];
      delete nr[old];
      return nr;
    }));
  };

  const updateCell = (ri, h, val) => {
    const newRows = rows.map((r, i) => i === ri ? { ...r, [h]: val } : r);
    setRows(newRows);
  };

  const addRow = () => setRows(r => [...r, Object.fromEntries(headers.map(h => [h, ""]))]);
  const addCol = () => {
    const h = `Column ${headers.length + 1}`;
    setHeaders(p => [...p, h]);
    setRows(r => r.map(row => ({ ...row, [h]: "" })));
  };
  const removeRow = () => rows.length > 1 && setRows(r => r.slice(0, -1));

  const useSheet = () => {
    const cleaned = rows.map(r => {
      const o = {};
      headers.forEach(h => {
        const v = r[h] ?? "";
        o[h] = v === "" ? "" : isNaN(v) ? String(v) : Number(v);
      });
      return o;
    });
    onUse({ headers, rows: cleaned, name: "manual_sheet.csv" });
  };

  return (
    <div className="card">
      <div className="card-title">Manual Sheet Editor</div>
      <div className="row" style={{ marginBottom: 14 }}>
        <button className="btn btn-ghost btn-sm" onClick={addRow}>+ Row</button>
        <button className="btn btn-ghost btn-sm" onClick={removeRow} disabled={rows.length <= 1}>− Row</button>
        <button className="btn btn-ghost btn-sm" onClick={addCol}>+ Column</button>
        <button className="btn btn-primary btn-sm" onClick={useSheet}>✓ Use This Sheet</button>
      </div>
      <div className="sheet-grid">
        <table>
          <thead>
            <tr>
              <th style={{ width: 36 }}>#</th>
              {headers.map((h, i) => (
                <th key={i} className="sheet-cell sheet-header-cell">
                  <input value={h} onChange={e => updateHeader(i, e.target.value)} style={{ width: 130 }} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, ri) => (
              <tr key={ri}>
                <td className="row-num">{ri + 1}</td>
                {headers.map(h => (
                  <td key={h} className="sheet-cell">
                    <input value={row[h] ?? ""} onChange={e => updateCell(ri, h, e.target.value)} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function DataManager({ data, setData, toast, onDataLoaded }) {
  const [drag, setDrag] = useState(false);
  const [mode, setMode] = useState("upload");
  const [loading, setLoading] = useState(false);
  const [savedDatasets, setSavedDatasets] = useState(() => {
    try {
      const saved = localStorage.getItem("analytix_saved_datasets");
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });

  const loadAndProceed = (dataset, message) => {
    setData(dataset);
    toast(message);
    if (typeof onDataLoaded === "function") onDataLoaded();
  };

  const saveDataset = () => {
    if (!data) return;
    const name = prompt("Enter a name for this dataset:");
    if (!name) return;
    const newSaved = { ...savedDatasets, [name]: data };
    setSavedDatasets(newSaved);
    localStorage.setItem("analytix_saved_datasets", JSON.stringify(newSaved));
    toast(`✓ Saved "${name}" to local storage`);
  };

  const loadDataset = (name) => {
    const dataset = savedDatasets[name];
    if (dataset) {
      loadAndProceed(dataset, `✓ Loaded "${name}" from local storage`);
    }
  };

  const deleteDataset = (name) => {
    const newSaved = { ...savedDatasets };
    delete newSaved[name];
    setSavedDatasets(newSaved);
    localStorage.setItem("analytix_saved_datasets", JSON.stringify(newSaved));
    toast(`✕ Deleted "${name}"`);
  };

  const handleFile = useCallback(async file => {
    if (!file) return;
    setLoading(true);
    try {
      const parsed = await parseFile(file);
      if (!parsed.rows.length) throw new Error("File appears empty or couldn't be parsed.");
      loadAndProceed({ ...parsed, name: file.name }, `✓ Loaded "${file.name}" — ${parsed.rows.length} rows`);
    } catch (e) {
      toast("⚠ " + e.message);
    }
    setLoading(false);
  }, [loadAndProceed, toast]);

  const onDrop = e => {
    e.preventDefault(); setDrag(false);
    handleFile(e.dataTransfer.files[0]);
  };

  return (
    <div className="panel">
      <div className="section-title">Data Manager</div>
      <div className="section-sub">Upload files, create sheets manually, or load the built-in sample dataset to explore the platform.</div>

      <div className="row" style={{ marginBottom: 20 }}>
        <button className={`btn btn-sm ${mode === "upload" ? "btn-primary" : "btn-secondary"}`} onClick={() => setMode("upload")}>⬆ Upload File</button>
        <button className={`btn btn-sm ${mode === "sheet" ? "btn-primary" : "btn-secondary"}`} onClick={() => setMode("sheet")}>⊞ Manual Sheet</button>
        <button className={`btn btn-sm ${mode === "saved" ? "btn-primary" : "btn-secondary"}`} onClick={() => setMode("saved")}>💾 Saved Datasets</button>
        <button className="btn btn-ghost btn-sm" onClick={() => loadAndProceed(SAMPLE_DATA, "⚡ Sample data loaded")}>⚡ Load Sample</button>
        {data && typeof onDataLoaded === "function" && (
          <button className="btn btn-blue btn-sm" onClick={onDataLoaded}>➡ Continue to Computations</button>
        )}
        {data && <button className="btn btn-green btn-sm" onClick={() => { exportToCSV(data.headers, data.rows, data.name); toast("⤓ Exported"); }}>⤓ Export CSV</button>}
        {data && <button className="btn btn-blue btn-sm" onClick={saveDataset}>💾 Save Dataset</button>}
        {data && <button className="btn btn-danger btn-sm" onClick={() => { setData(null); toast("Dataset cleared"); }}>✕ Clear</button>}
      </div>

      {mode === "upload" && (
        <div
          className={`upload-zone ${drag ? "drag" : ""}`}
          onDrop={onDrop}
          onDragOver={e => { e.preventDefault(); setDrag(true); }}
          onDragLeave={() => setDrag(false)}
        >
          <input type="file" accept=".csv,.xlsx,.xls,.txt,.tsv,.json" onChange={e => handleFile(e.target.files?.[0])} />
          {loading
            ? <><div className="upload-icon">⏳</div><div className="upload-label">Parsing file…</div></>
            : <>
              <div className="upload-icon">📂</div>
              <div className="upload-label">Drop file here or click to browse</div>
              <div className="upload-hint">CSV · Excel (.xlsx / .xls) · TSV · TXT · JSON</div>
            </>
          }
        </div>
      )}

      {mode === "sheet" && <ManualSheet onUse={d => { loadAndProceed(d, "✓ Sheet loaded"); setMode("upload"); }} />}

      {mode === "saved" && (
        <div className="card">
          <div className="card-title">Saved Datasets</div>
          {Object.keys(savedDatasets).length === 0 ? (
            <div className="empty" style={{ padding: 40 }}>
              <div className="empty-icon">💾</div>
              <div className="empty-msg">No Saved Datasets</div>
              <div className="empty-hint">Save datasets here for quick access.</div>
            </div>
          ) : (
            <div className="grid-2">
              {Object.entries(savedDatasets).map(([name, dataset]) => (
                <div key={name} className="card" style={{ margin: 0 }}>
                  <div className="card-title">{name}</div>
                  <div className="row" style={{ marginBottom: 12 }}>
                    <span className="tag tag-blue">{dataset.rows.length} rows</span>
                    <span className="tag tag-purple">{dataset.headers.length} columns</span>
                  </div>
                  <div className="row">
                    <button className="btn btn-primary btn-sm" onClick={() => loadDataset(name)}>Load</button>
                    <button className="btn btn-danger btn-sm" onClick={() => deleteDataset(name)}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {data && (
        <div style={{ marginTop: 26 }}>
          <div className="row" style={{ marginBottom: 16 }}>
            <span className="tag tag-green">✓ {data.name}</span>
            <span className="tag tag-blue">{data.rows.length} rows</span>
            <span className="tag tag-purple">{data.headers.length} columns</span>
            <span className="tag tag-amber">{getNumericCols(data.headers, data.rows).length} numeric</span>
          </div>
          <StatsStrip rows={data.rows} headers={data.headers} />
          <div className="card-title">Data Preview (first 50 rows)</div>
          <DataTable headers={data.headers} rows={data.rows.slice(0, 50)} />
        </div>
      )}
    </div>
  );
}
