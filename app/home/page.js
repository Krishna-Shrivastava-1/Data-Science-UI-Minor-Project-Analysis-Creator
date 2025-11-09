'use client'
import FileSender from '@/component/FileSender'
import JsonTableWithChart from '@/component/JsonTable'
import { ChartAreaInteractive } from '@/components/chart-area-interactive'
import { SectionCards } from '@/components/section-cards'
import React, { useState } from 'react'


const Page = () => {
  const [chartData, setChartData] = useState([]);
  const [summary, setSummary] = useState({});

  // console.log("Summary:", summary);

  return (
    <div>
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <FileSender
            data={setChartData}
            typeOfCall={"sendrawdata"}
            summary={setSummary}
          />

          {/* Summary cards (already exist) */}
          <SectionCards summa={summary} />

          {/* Show describe + numeric stats if present */}
          {summary.describe && (
            <div className="p-4 rounded-xl shadow ">
              <h2 className="text-lg font-semibold mb-3">📊 Data Description</h2>
              {Object.entries(summary.describe).map(([col, stats]) => (
                <div key={col} className="mb-4">
                  <h3 className="font-medium">{col}</h3>
                  <table className="w-full text-sm border-collapse border border-gray-200 mt-1">
                    <tbody>
                      {Object.entries(stats).map(([k, v]) => (
                        <tr key={k}>
                          <td className="border px-2 py-1">{k}</td>
                          <td className="border px-2 py-1">{v}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          )}

          {summary.numeric_stats && (
            <div className="p-4 rounded-xl shadow ">
              <h2 className="text-lg font-semibold mb-3">📈 Numeric Statistics</h2>
              {Object.entries(summary.numeric_stats).map(([col, stats]) => (
                <div key={col} className="mb-4">
                  <h3 className="font-medium">{col}</h3>
                  <table className="w-full text-sm border-collapse border border-gray-200 mt-1">
                    <tbody>
                      {Object.entries(stats).map(([k, v]) => (
                        <tr key={k}>
                          <td className="border px-2 py-1">{k}</td>
                          <td className="border px-2 py-1">{v}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          )}

          <JsonTableWithChart data={chartData} />
        </div>
      </div>
    </div>
  );
};

export default Page;

