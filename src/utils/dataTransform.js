import { computeStat, getNumericCols, getTextCols } from "./data.js";

/**
 * Initialize column state selections based on data type
 */
export function initializeColumnState(data) {
  if (!data) return {};
  
  const numCols = getNumericCols(data.headers, data.rows);
  const textCols = getTextCols(data.headers, data.rows);
  const allCols = data.headers;

  return {
    numCols,
    textCols,
    allCols,
    firstNumCol: numCols[0] || "",
    secondNumCol: numCols[1] || numCols[0] || "",
    firstTextCol: textCols[0] || "",
    firstAllCol: allCols[0] || "",
  };
}

/**
 * Get comprehensive statistics for all numeric columns
 */
export function getDataStatistics(data) {
  if (!data) return {};
  
  const numCols = getNumericCols(data.headers, data.rows);
  const stats = {};
  
  numCols.forEach(col => {
    stats[col] = {
      sum: computeStat(data.rows, col, "sum"),
      avg: computeStat(data.rows, col, "avg"),
      min: computeStat(data.rows, col, "min"),
      max: computeStat(data.rows, col, "max"),
      median: computeStat(data.rows, col, "median"),
      std: computeStat(data.rows, col, "std"),
      count: computeStat(data.rows, col, "count"),
    };
  });
  
  return stats;
}

/**
 * Get data quality metrics
 */
export function getDataQuality(data) {
  if (!data) return {};
  
  const totalCells = data.rows.length * data.headers.length;
  let emptyCells = 0;
  let numericCells = 0;
  let textCells = 0;
  
  data.rows.forEach(row => {
    data.headers.forEach(col => {
      const val = row[col];
      if (val === null || val === undefined || val === "") {
        emptyCells++;
      } else if (typeof val === "number") {
        numericCells++;
      } else {
        textCells++;
      }
    });
  });
  
  return {
    totalRows: data.rows.length,
    totalColumns: data.headers.length,
    totalCells,
    filledCells: totalCells - emptyCells,
    emptyCells,
    completeness: ((totalCells - emptyCells) / totalCells * 100).toFixed(2),
    numericCells,
    textCells,
  };
}

/**
 * Detect duplicate rows
 */
export function findDuplicateRows(data) {
  if (!data) return { duplicates: [], uniqueRows: [] };
  
  const seen = new Map();
  const duplicates = [];
  const uniqueRows = [];
  
  data.rows.forEach((row, index) => {
    const key = JSON.stringify(row);
    if (seen.has(key)) {
      duplicates.push({
        originalIndex: seen.get(key),
        duplicateIndex: index,
        row,
      });
    } else {
      seen.set(key, index);
      uniqueRows.push({ index, row });
    }
  });
  
  return { duplicates, uniqueRows };
}

/**
 * Remove duplicate rows
 */
export function removeDuplicates(data) {
  if (!data) return null;
  
  const seen = new Set();
  const uniqueRows = [];
  
  data.rows.forEach(row => {
    const key = JSON.stringify(row);
    if (!seen.has(key)) {
      seen.add(key);
      uniqueRows.push(row);
    }
  });
  
  return {
    ...data,
    rows: uniqueRows,
    duplicatesRemoved: data.rows.length - uniqueRows.length,
  };
}

/**
 * Detect missing values
 */
export function findMissingValues(data) {
  if (!data) return {};
  
  const missing = {};
  
  data.headers.forEach(col => {
    const count = data.rows.filter(r => r[col] === null || r[col] === undefined || r[col] === "").length;
    if (count > 0) {
      missing[col] = {
        count,
        percentage: ((count / data.rows.length) * 100).toFixed(2),
        indices: data.rows
          .map((r, i) => (r[col] === null || r[col] === undefined || r[col] === "") ? i : -1)
          .filter(i => i !== -1),
      };
    }
  });
  
  return missing;
}

/**
 * Remove rows with missing values in specified columns
 */
export function removeRowsWithMissing(data, columns = null) {
  if (!data) return null;
  
  const colsToCheck = columns || data.headers;
  const cleanRows = data.rows.filter(row =>
    colsToCheck.every(col => row[col] !== null && row[col] !== undefined && row[col] !== "")
  );
  
  return {
    ...data,
    rows: cleanRows,
    rowsRemoved: data.rows.length - cleanRows.length,
  };
}

/**
 * Fill missing values with a default value
 */
export function fillMissingValues(data, fillValues = {}) {
  if (!data) return null;
  
  const newRows = data.rows.map(row => {
    const newRow = { ...row };
    data.headers.forEach(col => {
      if (newRow[col] === null || newRow[col] === undefined || newRow[col] === "") {
        newRow[col] = fillValues[col] ?? "";
      }
    });
    return newRow;
  });
  
  return {
    ...data,
    rows: newRows,
  };
}

/**
 * Detect outliers using IQR method
 */
export function detectOutliers(data, column, multiplier = 1.5) {
  if (!data) return { outliers: [], threshold: {} };
  
  const values = data.rows
    .map(r => Number(r[column]))
    .filter(v => !isNaN(v))
    .sort((a, b) => a - b);
  
  if (values.length < 4) {
    return { outliers: [], threshold: {} };
  }
  
  const q1Idx = Math.floor(values.length * 0.25);
  const q3Idx = Math.floor(values.length * 0.75);
  const q1 = values[q1Idx];
  const q3 = values[q3Idx];
  const iqr = q3 - q1;
  
  const lowerBound = q1 - multiplier * iqr;
  const upperBound = q3 + multiplier * iqr;
  
  const outliers = [];
  data.rows.forEach((row, index) => {
    const val = Number(row[column]);
    if (!isNaN(val) && (val < lowerBound || val > upperBound)) {
      outliers.push({
        index,
        value: val,
        type: val < lowerBound ? "low" : "high",
        row,
      });
    }
  });
  
  return {
    outliers,
    threshold: { q1, q3, iqr, lowerBound, upperBound },
  };
}

/**
 * Remove rows with outliers in specified column
 */
export function removeOutliers(data, column, multiplier = 1.5) {
  if (!data) return null;
  
  const { threshold } = detectOutliers(data, column, multiplier);
  const cleanRows = data.rows.filter(row => {
    const val = Number(row[column]);
    if (isNaN(val)) return true;
    return val >= threshold.lowerBound && val <= threshold.upperBound;
  });
  
  return {
    ...data,
    rows: cleanRows,
    outliersRemoved: data.rows.length - cleanRows.length,
  };
}

/**
 * Convert column data type
 */
export function convertColumnType(data, column, targetType) {
  if (!data) return null;
  
  const newRows = data.rows.map(row => {
    const newRow = { ...row };
    const val = row[column];
    
    try {
      switch (targetType) {
        case "number":
          newRow[column] = Number(val);
          break;
        case "string":
          newRow[column] = String(val);
          break;
        case "integer":
          newRow[column] = Math.floor(Number(val));
          break;
        case "boolean":
          newRow[column] = val === "true" || val === true || val === 1 || val === "1";
          break;
        default:
          break;
      }
    } catch (e) {
      newRow[column] = val;
    }
    
    return newRow;
  });
  
  return {
    ...data,
    rows: newRows,
  };
}

/**
 * Trim whitespace from all text values
 */
export function trimWhitespace(data) {
  if (!data) return null;
  
  const newRows = data.rows.map(row => {
    const newRow = { ...row };
    data.headers.forEach(col => {
      if (typeof newRow[col] === "string") {
        newRow[col] = newRow[col].trim();
      }
    });
    return newRow;
  });
  
  return {
    ...data,
    rows: newRows,
  };
}

/**
 * Standardize column names (lowercase, no spaces)
 */
export function standardizeHeaders(data) {
  if (!data) return null;
  
  const oldToNew = {};
  const newHeaders = data.headers.map(h => {
    const standardized = h.toLowerCase().replace(/\s+/g, "_");
    oldToNew[h] = standardized;
    return standardized;
  });
  
  const newRows = data.rows.map(row => {
    const newRow = {};
    Object.entries(row).forEach(([oldKey, value]) => {
      newRow[oldToNew[oldKey] || oldKey] = value;
    });
    return newRow;
  });
  
  return {
    ...data,
    headers: newHeaders,
    rows: newRows,
  };
}
