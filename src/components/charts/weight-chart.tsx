"use client";

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function WeightChart({
  data,
}: {
  data: Array<{ date: string; weight: number }>;
}) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <XAxis dataKey="date" tickLine={false} axisLine={false} />
          <YAxis domain={["dataMin - 1", "dataMax + 1"]} tickLine={false} axisLine={false} />
          <Tooltip />
          <Line type="monotone" dataKey="weight" stroke="#0f172a" strokeWidth={3} dot={{ r: 4 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
