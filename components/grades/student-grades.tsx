/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import GradesTable from "./grades-table";

type SubjectGrades = {
  subject: string;
  grades: number[];
};
const StudentGrades = () => {
  const [data, setData] = useState<SubjectGrades[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // pomocna funkcija koja uzima ocene za ulogovanog ucenika sa backenda
    async function loadGrades() {
      try {
        const token = localStorage.getItem("token");

        // GET /api/grades/me sa JWT tokenom u Authorization headeru
        const res = await fetch("/api/grades/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error("Ne mogu da učitam ocene");
        }

        const json = await res.json();
        setData(json);
      } catch (err) {
        toast.error("Greška pri učitavanju ocena");
      } finally {
        setLoading(false);
      }
    }

    loadGrades();
  }, []);

  if (loading) {
    return <div>Učitavanje ocena...</div>;
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Moje ocene</h1>

      {data.length === 0 ? (
        <p className="text-slate-600">Trenutno nema ocena.</p>
      ) : (
        <GradesTable data={data} />
      )}
    </div>
  );
};

export default StudentGrades;
