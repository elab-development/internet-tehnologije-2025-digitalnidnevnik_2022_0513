"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Badge } from "@/components/ui/badge";

// Minimalni tip koji prati odgovor /api/assignments za ucenika
type Assignment = {
  id: number;
  title: string;
  description: string | null;
  dueDate: string;
  subject: { id: number; name: string };
  classroom: { id: number; name: string };
};

const StudentAssignments = () => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAssignments() {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch("/api/assignments", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error();

        const data = await res.json();
        setAssignments(data);
      } catch {
        toast.error("Greška pri učitavanju zadataka");
      } finally {
        setLoading(false);
      }
    }

    loadAssignments();
  }, []);

  if (loading) {
    return <div>Učitavanje zadataka...</div>;
  }

  // jednostavna podela na "aktivne" (buduci rok) i "prosle" zadatke
  const now = new Date();
  const upcoming = assignments.filter((a) => new Date(a.dueDate) >= now);
  const past = assignments.filter((a) => new Date(a.dueDate) < now);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Zadaci (učenik)</h1>

      <section className="space-y-2">
        <h2 className="font-medium">Aktivni zadaci</h2>
        {upcoming.length === 0 ? (
          <p className="text-slate-600">Trenutno nema aktivnih zadataka.</p>
        ) : (
          <div className="space-y-2">
            {upcoming.map((a) => {
              const due = new Date(a.dueDate);
              const msUntil = due.getTime() - now.getTime();
              const hoursUntil = msUntil / (1000 * 60 * 60);
              const isSoon = hoursUntil > 0 && hoursUntil <= 24;

              return (
                <div
                  key={a.id}
                  className="border rounded p-3 bg-white flex flex-col gap-1">
                  <div className="flex justify-between items-center gap-2">
                    <div className="font-semibold">{a.title}</div>
                    <div className="flex items-center gap-2">
                      <span
                        className={
                          "text-xs " +
                          (isSoon
                            ? "text-red-600 font-semibold"
                            : "text-slate-500")
                        }>
                        Rok: {due.toLocaleString()}
                      </span>
                      {isSoon && <Badge variant="destructive">&lt; 24h</Badge>}
                    </div>
                  </div>
                  <div className="text-sm text-slate-600">
                    {a.description || "Bez opisa"}
                  </div>
                  <div className="text-xs text-slate-500">
                    Predmet: {a.subject?.name ?? "?"}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="space-y-2">
        <h2 className="font-medium">Istekli zadaci</h2>
        {past.length === 0 ? (
          <p className="text-slate-600">Nema isteklih zadataka.</p>
        ) : (
          <div className="space-y-2">
            {past.map((a) => (
              <div
                key={a.id}
                className="border rounded p-3 bg-slate-50 flex flex-col gap-1 opacity-80">
                <div className="flex justify-between items-center">
                  <div className="font-semibold line-through">{a.title}</div>
                  <span className="text-xs text-slate-500">
                    Rok: {new Date(a.dueDate).toLocaleString()}
                  </span>
                </div>
                <div className="text-sm text-slate-600 line-through">
                  {a.description || "Bez opisa"}
                </div>
                <div className="text-xs text-slate-500">
                  Predmet: {a.subject?.name ?? "?"}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default StudentAssignments;
