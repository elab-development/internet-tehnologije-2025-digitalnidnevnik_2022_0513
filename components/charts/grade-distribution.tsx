"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// tip podataka za distribuciju jedne ocene
type DistributionData = {
  grade: number; // ocena (1-5)
  count: number; // koliko puta se javlja
  name: string; // naziv ("Odličan", "Nedovoljan", itd.)
};

type Props = {
  data: DistributionData[];
};

// mapa boja za svaku ocenu
const GRADE_COLORS: Record<number, string> = {
  1: "#ef4444", // nedovoljan
  2: "#f97316", // dovoljan
  3: "#f59e0b", // dobar
  4: "#3b82f6", // vrlo dobar
  5: "#22c55e", // odlican
};

// pie chart koji prikazuje distribuciju ocena
const GradeDistributionChart = ({ data }: Props) => {
  // filtriramo ocene koje imaju count > 0
  const filteredData = data.filter((d) => d.count > 0);

  if (filteredData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Distribucija ocena</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-slate-500">Nema podataka za prikaz.</div>
        </CardContent>
      </Card>
    );
  }

  const total = filteredData.reduce((sum, d) => sum + d.count, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Distribucija ocena</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={filteredData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={80}
                paddingAngle={2}
                dataKey="count"
                label={({ name, percent }) =>
                  `${name} (${((percent ?? 0) * 100).toFixed(0)}%)`
                }
                labelLine={false}>
                {filteredData.map((entry) => (
                  <Cell
                    key={`cell-${entry.grade}`}
                    fill={GRADE_COLORS[entry.grade]}
                  />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const item = payload[0].payload as DistributionData;
                    const percentage = ((item.count / total) * 100).toFixed(1);
                    return (
                      <div className="bg-white p-3 rounded-lg shadow-lg border">
                        <p className="font-medium">
                          Ocena {item.grade} - {item.name}
                        </p>
                        <p className="text-sm text-slate-600">
                          Broj: <strong>{item.count}</strong>
                        </p>
                        <p className="text-sm text-slate-500">
                          Procenat: {percentage}%
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend
                formatter={(value, entry) => {
                  const item = entry.payload as unknown as DistributionData;
                  return `${item.name} (${item.count})`;
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default GradeDistributionChart;
