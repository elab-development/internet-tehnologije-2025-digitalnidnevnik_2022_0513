"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// tip podataka za jedan predmet
type SubjectData = {
  subject: string; // naziv predmeta
  average: number; // prosecna ocena (1-5)
  count: number; // broj ocena
};

type Props = {
  data: SubjectData[];
};

// vraća boju stuba na osnovu proseka ocene
const getBarColor = (average: number) => {
  if (average >= 4.5) return "#22c55e"; // odlican
  if (average >= 3.5) return "#3b82f6"; // vrlo dobar
  if (average >= 2.5) return "#f59e0b"; // dobar
  if (average >= 1.5) return "#f97316"; // dovoljan
  return "#ef4444"; // nedovoljan
};

// bar chart koji prikazuje prosek ocena po predmetima
const GradesBySubjectChart = ({ data }: Props) => {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Prosek po predmetima</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-slate-500">Nema podataka za prikaz.</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Prosek po predmetima</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="subject"
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={{ stroke: "#e2e8f0" }}
              />
              <YAxis
                domain={[0, 5]}
                ticks={[1, 2, 3, 4, 5]}
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={{ stroke: "#e2e8f0" }}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const item = payload[0].payload as SubjectData;
                    return (
                      <div className="bg-white p-3 rounded-lg shadow-lg border">
                        <p className="font-medium">{item.subject}</p>
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
              <Bar dataKey="average" radius={[4, 4, 0, 0]}>
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={getBarColor(entry.average)}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default GradesBySubjectChart;
