"use client";

import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import { CATEGORY_BREAKDOWN } from "@/lib/dummy-data";

export function CategoryChart() {
  return (
    <div className="flex items-center gap-5">
      <div className="relative h-[180px] w-[180px] flex-shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={CATEGORY_BREAKDOWN}
              dataKey="pct"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={52}
              outerRadius={80}
              paddingAngle={2}
              stroke="hsl(var(--card))"
              strokeWidth={2}
            >
              {CATEGORY_BREAKDOWN.map((slice) => (
                <Cell key={slice.name} fill={slice.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[11px] text-muted-foreground">Total</span>
          <span className="text-lg font-semibold text-foreground">1,247</span>
        </div>
      </div>
      <ul className="flex-1 space-y-1.5">
        {CATEGORY_BREAKDOWN.map((slice) => (
          <li key={slice.name} className="flex items-center gap-2 text-xs">
            <span
              className="h-2.5 w-2.5 rounded-sm"
              style={{ background: slice.color }}
            />
            <span className="flex-1 text-foreground/80">{slice.name}</span>
            <span className="font-medium text-foreground">{slice.pct}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
