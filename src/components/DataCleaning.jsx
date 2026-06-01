import { useState, useMemo } from "react";
import {
  getNumericCols,
  getTextCols,
  exportToCSV,
  fmt,
} from "../utils/data.js";
import {
  findMissingValues,
  findDuplicateRows,
  detectOutliers,
  removeRowsWithMissing,
  removeDuplicates,
  removeOutliers,
  fillMissingValues,
  convertColumnType,
  trimWhitespace,
  standardizeHeaders,
  getDataQuality,
} from "../utils/dataTransform.js";

function DataTable({ headers, rows, maxRows = 50 }) {
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
          {rows.slice(0, maxRows).map((row, ri) => (
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

export default function DataCleaning({ data, setData, toast }) {
  const [cleaningMode, setCleaningMode] = useState("overview");
  const [previewData, setPreviewData] = useState(null);

  const numCols = useMemo(() => data ? getNumericCols(data.headers, data.rows) : [], [data]);
  const textCols = useMemo(() => data ? getTextCols(data.headers, data.rows) : [], [data]);

  // Missing values state
  const [missingValues, setMissingValues] = useState(null);
  const [selectedColsForRemoval, setSelectedColsForRemoval] = useState([]);

  // Duplicates state
  const [duplicates, setDuplicates] = useState(null);

  // Outliers state
  const [outlierColumn, setOutlierColumn] = useState("");
  const [outliers, setOutliers] = useState(null);

  // Type conversion state
  const [convertCol, setConvertCol] = useState("");
  const [convertType, setConvertType] = useState("number");

  // Fill missing state
  const [fillValues, setFillValues] = useState({});

  if (!data) {
    return (
      <div className="panel">
        <div className="empty">
          <div className="empty-icon">🧹</div>
          <div className="empty-msg">No Data Loaded</div>
          <div className="empty-hint">Load a dataset from the Data Manager first.</div>
        </div>
      </div>
    );
  }

  const quality = useMemo(() => getDataQuality(data), [data]);

  const applyTransformation = (newData, message) => {
    if (newData) {
      setData(newData);
      setPreviewData(null);
      toast(`✓ ${message}`);
    }
  };

  const handleDetectMissing = () => {
    const missing = findMissingValues(data);
    setMissingValues(missing);
    toast(`Found missing values in ${Object.keys(missing).length} column(s)`);
  };

  const handleRemoveRowsWithMissing = () => {
    const result = removeRowsWithMissing(data, selectedColsForRemoval.length > 0 ? selectedColsForRemoval : null);
    setPreviewData(result);
  };

  const applyRemoveRowsWithMissing = () => {
    const result = removeRowsWithMissing(data, selectedColsForRemoval.length > 0 ? selectedColsForRemoval : null);
    applyTransformation(result, `Removed ${result.rowsRemoved} rows with missing values`);
  };

  const handleDetectDuplicates = () => {
    const dup = findDuplicateRows(data);
    setDuplicates(dup);
    toast(`Found ${dup.duplicates.length} duplicate row(s)`);
  };

  const applyRemoveDuplicates = () => {
    const result = removeDuplicates(data);
    applyTransformation(result, `Removed ${result.duplicatesRemoved} duplicate row(s)`);
  };

  const handleDetectOutliers = () => {
    if (!outlierColumn) {
      toast("⚠ Select a numeric column first");
      return;
    }
    const out = detectOutliers(data, outlierColumn);
    setOutliers(out);
    toast(`Found ${out.outliers.length} outlier(s) in ${outlierColumn}`);
  };

  const applyRemoveOutliers = () => {
    if (!outlierColumn) return;
    const result = removeOutliers(data, outlierColumn);
    applyTransformation(result, `Removed ${result.outliersRemoved} outlier(s)`);
  };

  const handleConvertType = () => {
    if (!convertCol) {
      toast("⚠ Select a column first");
      return;
    }
    const result = convertColumnType(data, convertCol, convertType);
    setPreviewData(result);
  };

  const applyConvertType = () => {
    if (!convertCol) return;
    const result = convertColumnType(data, convertCol, convertType);
    applyTransformation(result, `Converted ${convertCol} to ${convertType}`);
  };

  const handleTrimWhitespace = () => {
    const result = trimWhitespace(data);
    setPreviewData(result);
  };

  const applyTrimWhitespace = () => {
    const result = trimWhitespace(data);
    applyTransformation(result, "Trimmed whitespace from all text values");
  };

  const handleStandardizeHeaders = () => {
    const result = standardizeHeaders(data);
    setPreviewData(result);
  };

  const applyStandardizeHeaders = () => {
    const result = standardizeHeaders(data);
    applyTransformation(result, "Standardized column headers");
  };

  const handleFillMissing = () => {
    const missing = findMissingValues(data);
    const fills = {};
    Object.keys(missing).forEach(col => {
      fills[col] = fillValues[col] ?? "";
    });
    const result = fillMissingValues(data, fills);
    setPreviewData(result);
  };

  const applyFillMissing = () => {
    const missing = findMissingValues(data);
    const fills = {};
    Object.keys(missing).forEach(col => {
      fills[col] = fillValues[col] ?? "";
    });
    const result = fillMissingValues(data, fills);
    applyTransformation(result, "Filled missing values");
  };

  return (
    <div className="panel">
      <div className="section-title">Data Cleaning</div>
      <div className="section-sub">Detect and handle data quality issues like missing values, duplicates, and outliers.</div>

      <div className="row" style={{ marginBottom: 20, flexWrap: "wrap" }}>
        <button
          className={`btn btn-sm ${cleaningMode === "overview" ? "btn-primary" : "btn-secondary"}`}
          onClick={() => setCleaningMode("overview")}
        >
          📊 Overview
        </button>
        <button
          className={`btn btn-sm ${cleaningMode === "missing" ? "btn-primary" : "btn-secondary"}`}
          onClick={() => setCleaningMode("missing")}
        >
          ⚠ Missing Values
        </button>
        <button
          className={`btn btn-sm ${cleaningMode === "duplicates" ? "btn-primary" : "btn-secondary"}`}
          onClick={() => setCleaningMode("duplicates")}
        >
          🔀 Duplicates
        </button>
        <button
          className={`btn btn-sm ${cleaningMode === "outliers" ? "btn-primary" : "btn-secondary"}`}
          onClick={() => setCleaningMode("outliers")}
        >
          📈 Outliers
        </button>
        <button
          className={`btn btn-sm ${cleaningMode === "transform" ? "btn-primary" : "btn-secondary"}`}
          onClick={() => setCleaningMode("transform")}
        >
          🔄 Transform
        </button>
      </div>

      {/* Overview */}
      {cleaningMode === "overview" && (
        <div className="card">
          <div className="card-title">Data Quality Overview</div>
          <div className="grid-4" style={{ marginBottom: 18 }}>
            <div className="stat-card">
              <div className="stat-label">Rows</div>
              <div className="stat-value">{data.rows.length.toLocaleString()}</div>
              <div className="stat-sub">total records</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Columns</div>
              <div className="stat-value">{data.headers.length}</div>
              <div className="stat-sub">{numCols.length} numeric</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Completeness</div>
              <div className="stat-value">{quality.completeness}%</div>
              <div className="stat-sub">{quality.emptyCells} empty cells</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Data Size</div>
              <div className="stat-value">{quality.totalCells.toLocaleString()}</div>
              <div className="stat-sub">total cells</div>
            </div>
          </div>

          <div className="row" style={{ gap: 10, marginBottom: 18, flexWrap: "wrap" }}>
            <button className="btn btn-ghost btn-sm" onClick={handleDetectMissing}>
              Detect Missing Values
            </button>
            <button className="btn btn-ghost btn-sm" onClick={handleDetectDuplicates}>
              Detect Duplicates
            </button>
          </div>

          {missingValues && Object.keys(missingValues).length > 0 && (
            <div className="card" style={{ padding: 12, marginTop: 12 }}>
              <div className="card-title" style={{ fontSize: 14 }}>Missing Values Found</div>
              <table style={{ width: "100%", marginTop: 8 }}>
                <thead>
                  <tr>
                    <th>Column</th>
                    <th>Missing</th>
                    <th>Percentage</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(missingValues).map(([col, info]) => (
                    <tr key={col}>
                      <td>{col}</td>
                      <td>{info.count}</td>
                      <td>{info.percentage}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {duplicates && duplicates.duplicates.length > 0 && (
            <div className="card" style={{ padding: 12, marginTop: 12 }}>
              <div className="card-title" style={{ fontSize: 14 }}>
                {duplicates.duplicates.length} Duplicate Row(s) Found
              </div>
              <button className="btn btn-green btn-sm" onClick={applyRemoveDuplicates} style={{ marginTop: 10 }}>
                ✓ Remove All Duplicates
              </button>
            </div>
          )}
        </div>
      )}

      {/* Missing Values */}
      {cleaningMode === "missing" && (
        <div>
          <div className="card">
            <div className="card-title">Handle Missing Values</div>
            <div style={{ marginBottom: 16 }}>
              <label>Strategy</label>
              <div className="row" style={{ gap: 10, flexWrap: "wrap" }}>
                <button className="btn btn-ghost btn-sm" onClick={handleRemoveRowsWithMissing}>
                  🗑 Remove Rows with Missing Values
                </button>
                <button className="btn btn-ghost btn-sm" onClick={handleDetectMissing}>
                  🔍 Detect Missing Values
                </button>
              </div>
            </div>

            {missingValues && Object.keys(missingValues).length > 0 && (
              <div>
                <label style={{ marginBottom: 10 }}>Select columns to check for missing values (optional)</label>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 8, marginBottom: 16 }}>
                  {data.headers.map(col => (
                    <label key={col} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <input
                        type="checkbox"
                        checked={selectedColsForRemoval.includes(col)}
                        onChange={e => {
                          if (e.target.checked) {
                            setSelectedColsForRemoval([...selectedColsForRemoval, col]);
                          } else {
                            setSelectedColsForRemoval(selectedColsForRemoval.filter(c => c !== col));
                          }
                        }}
                      />
                      {col}
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          {previewData && (
            <div className="card">
              <div className="card-title">Preview (removing {data.rows.length - previewData.rows.length} rows)</div>
              <div className="row" style={{ marginBottom: 12 }}>
                <button className="btn btn-green btn-sm" onClick={applyRemoveRowsWithMissing}>
                  ✓ Apply
                </button>
                <button className="btn btn-ghost btn-sm" onClick={() => setPreviewData(null)}>
                  Cancel
                </button>
              </div>
              <DataTable headers={previewData.headers} rows={previewData.rows} maxRows={20} />
            </div>
          )}
        </div>
      )}

      {/* Duplicates */}
      {cleaningMode === "duplicates" && (
        <div>
          <div className="card">
            <div className="card-title">Remove Duplicate Rows</div>
            <button className="btn btn-primary btn-sm" onClick={handleDetectDuplicates}>
              🔍 Detect Duplicates
            </button>
            {duplicates && (
              <div style={{ marginTop: 16 }}>
                <div className="result-pill">
                  Found {duplicates.duplicates.length} duplicate row(s), keeping {duplicates.uniqueRows.length} unique rows
                </div>
                {duplicates.duplicates.length > 0 && (
                  <button className="btn btn-green btn-sm" onClick={applyRemoveDuplicates} style={{ marginTop: 12 }}>
                    ✓ Remove All Duplicates
                  </button>
                )}
              </div>
            )}
          </div>

          {duplicates && duplicates.duplicates.length > 0 && (
            <div className="card">
              <div className="card-title">Duplicate Rows</div>
              <div className="table-wrap" style={{ maxHeight: 300 }}>
                <table>
                  <thead>
                    <tr>
                      <th>Original</th>
                      <th>Duplicate</th>
                      <th>Row Data</th>
                    </tr>
                  </thead>
                  <tbody>
                    {duplicates.duplicates.slice(0, 10).map((dup, i) => (
                      <tr key={i}>
                        <td>{dup.originalIndex + 1}</td>
                        <td>{dup.duplicateIndex + 1}</td>
                        <td>{JSON.stringify(dup.row).substring(0, 50)}...</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Outliers */}
      {cleaningMode === "outliers" && (
        <div>
          <div className="card">
            <div className="card-title">Detect and Remove Outliers</div>
            <div style={{ marginBottom: 16 }}>
              <label>Numeric Column</label>
              <select value={outlierColumn} onChange={e => setOutlierColumn(e.target.value)}>
                <option value="">Select a column...</option>
                {numCols.map(col => <option key={col} value={col}>{col}</option>)}
              </select>
            </div>
            <button className="btn btn-primary btn-sm" onClick={handleDetectOutliers} disabled={!outlierColumn}>
              🔍 Detect Outliers
            </button>

            {outliers && (
              <div style={{ marginTop: 16 }}>
                <div className="result-pill">
                  Found {outliers.outliers.length} outlier(s) in {outlierColumn}
                </div>
                <div style={{ marginTop: 12, padding: 12, background: "var(--bg1)", borderRadius: 6 }}>
                  <div style={{ fontSize: 12, color: "var(--text2)" }}>
                    <div>Q1: {fmt(outliers.threshold.q1)}</div>
                    <div>Q3: {fmt(outliers.threshold.q3)}</div>
                    <div>IQR: {fmt(outliers.threshold.iqr)}</div>
                    <div>Lower Bound: {fmt(outliers.threshold.lowerBound)}</div>
                    <div>Upper Bound: {fmt(outliers.threshold.upperBound)}</div>
                  </div>
                </div>
                {outliers.outliers.length > 0 && (
                  <button className="btn btn-green btn-sm" onClick={applyRemoveOutliers} style={{ marginTop: 12 }}>
                    ✓ Remove Outliers
                  </button>
                )}
              </div>
            )}
          </div>

          {outliers && outliers.outliers.length > 0 && (
            <div className="card">
              <div className="card-title">Outlier Values</div>
              <div className="table-wrap" style={{ maxHeight: 300 }}>
                <table>
                  <thead>
                    <tr>
                      <th>Row</th>
                      <th>Value</th>
                      <th>Type</th>
                    </tr>
                  </thead>
                  <tbody>
                    {outliers.outliers.slice(0, 10).map((out, i) => (
                      <tr key={i}>
                        <td>{out.index + 1}</td>
                        <td>{fmt(out.value)}</td>
                        <td>{out.type === "low" ? "Below Lower Bound" : "Above Upper Bound"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Transform */}
      {cleaningMode === "transform" && (
        <div className="grid-2" style={{ gap: 18 }}>
          <div className="card">
            <div className="card-title">Convert Column Type</div>
            <div style={{ marginBottom: 12 }}>
              <label>Column</label>
              <select value={convertCol} onChange={e => setConvertCol(e.target.value)}>
                <option value="">Select column...</option>
                {data.headers.map(col => <option key={col} value={col}>{col}</option>)}
              </select>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label>Target Type</label>
              <select value={convertType} onChange={e => setConvertType(e.target.value)}>
                <option value="number">Number</option>
                <option value="integer">Integer</option>
                <option value="string">String</option>
                <option value="boolean">Boolean</option>
              </select>
            </div>
            <div className="row">
              <button className="btn btn-primary btn-sm" onClick={handleConvertType} disabled={!convertCol}>
                Preview
              </button>
              {previewData && (
                <button className="btn btn-green btn-sm" onClick={applyConvertType}>
                  ✓ Apply
                </button>
              )}
            </div>
          </div>

          <div className="card">
            <div className="card-title">Normalize Text</div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ color: "var(--text2)", fontSize: 13 }}>Trim whitespace from all text values</label>
            </div>
            <div className="row">
              <button className="btn btn-primary btn-sm" onClick={handleTrimWhitespace}>
                Preview
              </button>
              {previewData && (
                <button className="btn btn-green btn-sm" onClick={applyTrimWhitespace}>
                  ✓ Apply
                </button>
              )}
            </div>
          </div>

          <div className="card">
            <div className="card-title">Standardize Headers</div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ color: "var(--text2)", fontSize: 13 }}>Convert to lowercase, replace spaces with underscores</label>
            </div>
            <div className="row">
              <button className="btn btn-primary btn-sm" onClick={handleStandardizeHeaders}>
                Preview
              </button>
              {previewData && (
                <button className="btn btn-green btn-sm" onClick={applyStandardizeHeaders}>
                  ✓ Apply
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {previewData && cleaningMode === "transform" && (
        <div className="card">
          <div className="card-title">Preview Changes</div>
          <div className="row" style={{ marginBottom: 12 }}>
            <button className="btn btn-ghost btn-sm" onClick={() => setPreviewData(null)}>
              Cancel
            </button>
          </div>
          <DataTable headers={previewData.headers} rows={previewData.rows} maxRows={20} />
        </div>
      )}
    </div>
  );
}
