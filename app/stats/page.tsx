"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import dynamic from "next/dynamic";

// dinamicki importi za chart komponente (client-side)
const GradesBySubjectChart = dynamic(
  () => import("@/components/charts/grades-by-subject"),
  {
    ssr: false,
    loading: () => <ChartSkeleton title="📊 Prosek po predmetima" />,
  },
);

const GradeDistributionChart = dynamic(
  () => import("@/components/charts/grade-distribution"),
  {
    ssr: false,
    loading: () => <ChartSkeleton title="🥧 Distribucija ocena" />,
  },
);

const GradesTrendChart = dynamic(
  () => import("@/components/charts/grades-trend"),
  { ssr: false, loading: () => <ChartSkeleton title="📈 Trend ocena" /> },
);

type StatsData = {
  bySubject: { subject: string; average: number; count: number }[];
  distribution: { grade: number; count: number; name: string }[];
  trend: { month: string; average: number; count: number }[];
  summary: {
    totalGrades: number;
    overallAverage: number;
  };
};

// skeleton komponenta za ucitavanje
function ChartSkeleton({ title }: { title: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64 bg-slate-100 animate-pulse rounded" />
      </CardContent>
    </Card>
  );
}

const StatsPage = () => {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Niste prijavljeni");
          setLoading(false);
          return;
        }

        const response = await fetch("/api/stats", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Greška pri učitavanju statistike");
        }

        const data = await response.json();
        setStats(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Nepoznata greška");
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Statistika ocena</h1>
        <div className="grid gap-6 md:grid-cols-2">
          <ChartSkeleton title="📊 Prosek po predmetima" />
          <ChartSkeleton title="🥧 Distribucija ocena" />
          <div className="md:col-span-2">
            <ChartSkeleton title="📈 Trend ocena" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Statistika ocena</h1>
        <Card>
          <CardContent className="p-6">
            <div className="text-red-500">{error}</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Statistika ocena</h1>
        <div className="flex gap-2">
          <Badge variant="outline">
            Ukupno ocena: {stats.summary.totalGrades}
          </Badge>
          <Badge
            className={
              stats.summary.overallAverage >= 3.5
                ? "bg-green-500"
                : stats.summary.overallAverage >= 2.5
                  ? "bg-yellow-500"
                  : "bg-red-500"
            }>
            Prosek: {stats.summary.overallAverage.toFixed(2)}
          </Badge>
        </div>
      </div>

      {/* Grafikoni */}
      <div className="grid gap-6 md:grid-cols-2">
        <GradesBySubjectChart data={stats.bySubject} />
        <GradeDistributionChart data={stats.distribution} />
      </div>

      <GradesTrendChart data={stats.trend} />

      {/* Izvor podataka */}
      <div className="text-sm text-slate-500 text-center">
        Podaci se ažuriraju u realnom vremenu na osnovu unetih ocena u sistem.
      </div>
    </div>
  );
};

export default StatsPage;
