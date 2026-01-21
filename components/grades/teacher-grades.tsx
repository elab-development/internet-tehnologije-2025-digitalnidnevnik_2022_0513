"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import AddGradeForm from "./add-grade-form";

type Student = {
  id: number;
  full_name: string;
};

type Classroom = {
  id: number;
  name: string;
  students: Student[];
};

type Subject = {
  id: number;
  name: string;
};

const TeacherGrades = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // ucitavamo kontekst (predmeti + odeljenja + ucenici) za trenutnog nastavnika
    async function loadContext() {
      try {
        const token = localStorage.getItem("token");

        // GET /api/teacher/grades/context koristi rolu iz tokena na serveru
        const res = await fetch("/api/teacher/grades/context", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error();

        const data = await res.json();
        setSubjects(data.subjects);
        setClassrooms(data.classrooms);
      } catch {
        toast.error("Greška pri učitavanju podataka");
      } finally {
        setLoading(false);
      }
    }

    loadContext();
  }, []);

  if (loading) {
    return <div>Učitavanje...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Unos ocena</h1>

      <AddGradeForm subjects={subjects} classrooms={classrooms} />
    </div>
  );
};

export default TeacherGrades;
