"use client";

import { useState } from "react";

const ranges = [
  { label: "7d", value: "7" },
  { label: "30d", value: "30" },
  { label: "90d", value: "90" },
  { label: "YTD", value: "ytd" },
];

export function RangeSelector() {
  const [selected, setSelected] = useState(ranges[1].value);

  return (
    <div className="rounded-full border border-slate-200 bg-white/80 p-1 text-xs font-semibold text-slate-500">
      <span className="px-3 text-slate-400">Rango</span>
      {ranges.map((range) => {
        const active = range.value === selected;
        return (
          <button
            key={range.value}
            type="button"
            onClick={() => setSelected(range.value)}
            className={`rounded-full px-3 py-1 transition ${
              active ? "bg-rose-600 text-white" : "text-slate-600 hover:text-rose-600"
            }`}
          >
            {range.label}
          </button>
        );
      })}
    </div>
  );
}
