"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { VOLUME_30D } from "@/lib/dummy-data";

// Chart series colors. Explicit (SVG attrs don't resolve CSS var()); update
// alongside the theme tokens if the brand palette changes.
const TOTAL = "#4F46E5";
const AI = "#8B5CF6";

export function VolumeChart() {
  return (
    <div className="h-[220px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={VOLUME_30D} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
          <defs>
            <linearGradient id="fillTotal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={TOTAL} stopOpacity={0.18} />
              <stop offset="100%" stopColor={TOTAL} stopOpacity={0} />
            </linearGradient>
            <linearGradient id="fillAi" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={AI} stopOpacity={0.18} />
              <stop offset="100%" stopColor={AI} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke="hsl(var(--border))" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
            tickLine={false}
            axisLine={false}
            interval={1}
          />
          <YAxis
            tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
            tickLine={false}
            axisLine={false}
            width={40}
          />
          <Tooltip
            contentStyle={{
              borderRadius: 8,
              border: "1px solid hsl(var(--border))",
              fontSize: 12,
            }}
          />
          <Area
            type="monotone"
            dataKey="total"
            name="Total"
            stroke={TOTAL}
            strokeWidth={2}
            fill="url(#fillTotal)"
          />
          <Area
            type="monotone"
            dataKey="aiResolved"
            name="AI-resolved"
            stroke={AI}
            strokeWidth={2}
            fill="url(#fillAi)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
