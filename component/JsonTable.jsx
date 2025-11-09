"use client";
import React, { useState, useMemo } from "react";
import { Bar, Line, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const AggOptions = ["Count", "Sum", "Avg", "Min", "Max", "Median", "Distinct Count"];
const ChartTypes = ["Bar", "Line", "Pie"];
const Operators = ["=", "≠", ">", "<", "≥", "≤", "contains"];

const JsonTableWithChart = ({ data }) => {
  const [xCol, setXCol] = useState("");
  const [yCol, setYCol] = useState("");
  const [agg, setAgg] = useState("Count");
  const [chartType, setChartType] = useState("Bar");
  const [filters, setFilters] = useState([]);
// console.log(data)
  // -------- Columns --------
  const columns = useMemo(
    () =>
      Array.isArray(data) && data.length > 0
        ? Array.from(new Set(data.flatMap((row) => Object.keys(row))))
        : [],
    [data]
  );

  // -------- Detect numeric columns --------
  const numericColumns = useMemo(() => {
    if (!Array.isArray(data) || data.length === 0) return [];
    return columns.filter((col) => {
      let numericCount = 0;
      let total = 0;
      for (const row of data) {
        total += 1;
        const v = row[col];
        if (v === null || v === undefined || v === "") continue;
        const n = Number(v);
        if (Number.isFinite(n)) numericCount += 1;
      }
      return total > 0 && numericCount / total >= 0.6;
    });
  }, [columns, data]);

  // -------- Apply Filters --------
  const filteredData = useMemo(() => {
    return data.filter((row) =>
      filters.every((f) => {
        const val = String(row[f.column] ?? "").toLowerCase();
        const cond = String(f.value ?? "").toLowerCase();
        switch (f.operator) {
          case "=":
            return val === cond;
          case "≠":
            return val !== cond;
          case ">":
            return Number(val) > Number(cond);
          case "<":
            return Number(val) < Number(cond);
          case "≥":
            return Number(val) >= Number(cond);
          case "≤":
            return Number(val) <= Number(cond);
          case "contains":
            return val.includes(cond);
          default:
            return true;
        }
      })
    );
  }, [data, filters]);

  // -------- Chart Data Computation --------
  const chartData = useMemo(() => {
    if (!xCol) return null;
    if (!Array.isArray(filteredData) || filteredData.length === 0) return null;

    const isYNumeric = yCol && numericColumns.includes(yCol);
    const isYCategorical = yCol && !isYNumeric;

    // ---- Case 1: Categorical Y (Group counts) ----
    if (isYCategorical) {
      const grouped = {};
      const xLabels = new Set();

      filteredData.forEach((row) => {
        const xVal = row[xCol] ?? "Unknown";
        const yVal = row[yCol] ?? "Unknown";
        xLabels.add(xVal);

        if (!grouped[yVal]) grouped[yVal] = {};
        grouped[yVal][xVal] = (grouped[yVal][xVal] || 0) + 1;
      });

      const labels = Array.from(xLabels);
      const datasets = Object.entries(grouped).map(([yVal, xCounts]) => ({
        label: String(yVal),
        data: labels.map((x) => xCounts[x] || 0),
        backgroundColor: "#" + Math.floor(Math.random() * 16777215).toString(16),
      }));

      return { labels, datasets };
    }

    // ---- Case 2: Numeric Y ----
    const groups = new Map();

    filteredData.forEach((row) => {
      const xVal = row[xCol] ?? "Unknown";
      if (!groups.has(xVal)) groups.set(xVal, []);
      const numVal = yCol ? Number(row[yCol]) : null;
      if (yCol && Number.isFinite(numVal)) groups.get(xVal).push(numVal);
      else if (!yCol) groups.get(xVal).push(1);
    });

    const labels = Array.from(groups.keys());
    const values = labels.map((lbl) => {
      const arr = groups.get(lbl);
      if (!arr.length) return 0;

      switch (agg) {
        case "Sum": return arr.reduce((a, b) => a + b, 0);
        case "Avg": return arr.reduce((a, b) => a + b, 0) / arr.length;
        case "Min": return Math.min(...arr);
        case "Max": return Math.max(...arr);
        case "Median": {
          const sorted = [...arr].sort((a, b) => a - b);
          const mid = Math.floor(sorted.length / 2);
          return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
        }
        case "Distinct Count":
          return new Set(arr).size;
        default:
          return arr.length;
      }
    });

    return {
      labels,
      datasets: [
        {
          label: isYNumeric ? `${agg}(${yCol})` : "Count",
          data: values,
          backgroundColor: "rgba(54, 162, 235, 0.6)",
        },
      ],
    };
  }, [filteredData, xCol, yCol, agg, numericColumns]);

  // -------- Chart Component Selector --------
  const ChartComponent = chartType === "Line" ? Line : chartType === "Pie" ? Pie : Bar;

  // -------- UI --------
  return (
    <div className="space-y-6">
       <div className="overflow-x-auto rounded-xl border border-gray-300 shadow-sm ">
      <table className="min-w-full border-collapse">
  <thead className="bg-background border-b">
    <tr>
      {/* Row Number Column */}
      <th className="px-4 py-2 text-left text-sm font-semibold border-r">
        #
      </th>

      {/* Existing Columns */}
      {columns.map((col) => (
        <th
          key={col}
          className="px-4 py-2 text-left text-sm font-semibold border-r"
        >
          {col}
        </th>
      ))}
    </tr>
  </thead>

  <tbody>
    {data.map((row, i) => (
      <tr key={i} className="dark">
        {/* Row Number */}
        <td className="px-4 py-2 text-sm border-t border-neutral-700 font-medium">
          {i + 1}
        </td>

        {/* Existing Data Columns */}
        {columns.map((col) => (
          <td
            key={col}
            className="px-4 py-2 text-sm border-t border-neutral-700"
          >
            {row[col] !== null && row[col] !== undefined
              ? String(row[col])
              : "-"}
          </td>
        ))}
      </tr>
    ))}
  </tbody>
</table>

      </div>
      {/* Filters */}
      <div className="space-y-2">
        <div className="flex flex-wrap gap-4 items-end">
          {filters.map((f, idx) => (
            <div key={idx} className="flex gap-2 items-end">
              <select
                value={f.column}
                onChange={(e) => {
                  const newFilters = [...filters];
                  newFilters[idx].column = e.target.value;
                  setFilters(newFilters);
                }}
                className="border rounded px-2 py-1 bg-background"
              >
                <option value="">Column</option>
                {columns.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>

              <select
                value={f.operator}
                onChange={(e) => {
                  const newFilters = [...filters];
                  newFilters[idx].operator = e.target.value;
                  setFilters(newFilters);
                }}
                className="border rounded px-2 py-1 bg-background"
              >
                {Operators.map((op) => (
                  <option key={op} value={op}>
                    {op}
                  </option>
                ))}
              </select>

              <input
                value={f.value}
                onChange={(e) => {
                  const newFilters = [...filters];
                  newFilters[idx].value = e.target.value;
                  setFilters(newFilters);
                }}
                placeholder="Value"
                className="border rounded px-2 py-1"
              />

              <button
                onClick={() =>
                  setFilters(filters.filter((_, i) => i !== idx))
                }
                className="text-red-600 text-sm"
              >
                ✖
              </button>
            </div>
          ))}
        </div>

        <button
          onClick={() =>
            setFilters([...filters, { column: "", operator: "=", value: "" }])
          }
          className="border px-2 py-1 rounded text-sm  "
        >
          + Add Filter
        </button>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-sm font-medium mb-1">X-axis (group by)</label>
          <select
            value={xCol}
            onChange={(e) => setXCol(e.target.value)}
            className="border rounded px-2 py-1 bg-background"
          >
            <option value="">Select X (group)</option>
            {columns.map((col) => (
              <option key={col} value={col}>
                {col}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Y-axis (optional)</label>
          <select
            value={yCol}
            onChange={(e) => setYCol(e.target.value)}
            className="border rounded px-2 py-1 bg-background"
          >
            <option value="">(none) — Count</option>
            {columns.map((col) => (
              <option key={col} value={col}>
                {col}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Aggregation</label>
          <select
            value={agg}
            onChange={(e) => setAgg(e.target.value)}
            className="border rounded px-2 py-1 dark bg-background"
          >
            {AggOptions.map((o) => (
              <option className="" key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Chart Type</label>
          <select
            value={chartType}
            onChange={(e) => setChartType(e.target.value)}
            className="border rounded px-2 py-1 bg-background"
          >
            {ChartTypes.map((type) => (
              <option key={type}>{type}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Chart Preview */}
      {chartData && (
        <div className="  p-4 rounded-xl border shadow">
          <ChartComponent
            data={chartData}
            options={{
              responsive: true,
              plugins: { legend: { position: "top" } },
              maintainAspectRatio: false,
            }}
            height={350}
          />
        </div>
      )}
    </div>
  );
};

export default JsonTableWithChart;

    {/* Table */}
     