"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// tip podataka za jedan mesec
type TrendData = {
  month: string; // formatiran mesec ("Jan 2024")
  average: number; // prosecna ocena u mesecu
  count: number; // broj ocena u mesecu
};

type Props = {
  data: TrendData[];
};

const GradesTrendChart = ({ data }: Props) => {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Trend ocena</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-slate-500">Nema podataka za prikaz.</div>
        </CardContent>
      </Card>
    );
  }

  // racunamo ukupni prosek za referentnu liniju
  const totalSum = data.reduce((sum, d) => sum + d.average * d.count, 0);
  const totalCount = data.reduce((sum, d) => sum + d.count, 0);
  const overallAverage = totalCount > 0 ? totalSum / totalCount : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Trend ocena</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={{ stroke: "#e2e8f0" }}
              />
              <YAxis
                domain={[1, 5]}
                ticks={[1, 2, 3, 4, 5]}
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={{ stroke: "#e2e8f0" }}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const item = payload[0].payload as TrendData;
                    return (
                      <div className="bg-white p-3 rounded-lg shadow-lg border">
                        <p className="font-medium">{item.month}</p>
                        <p className="text-sm text-slate-600">
                          Prosek: <strong>{item.average.toFixed(2)}</strong>
                        </p>
                        <p className="text-sm text-slate-500">
                          Broj ocena: {item.count}
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <ReferenceLine
                y={overallAverage}
                stroke="#94a3b8"
                strokeDasharray="5 5"
                label={{
                  value: `Prosek: ${overallAverage.toFixed(2)}`,
                  position: "right",
                  fontSize: 11,
                  fill: "#64748b",
                }}
              />
              <Line
                type="monotone"
                dataKey="average"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, fill: "#2563eb" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default GradesTrendChart;
