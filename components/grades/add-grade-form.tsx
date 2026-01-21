"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";

type Props = {
  subjects: { id: number; name: string }[];
  classrooms: {
    id: number;
    name: string;
    students: { id: number; full_name: string }[];
  }[];
};

const AddGradeForm = ({ subjects, classrooms }: Props) => {
  // lokalno stanje izbora (predmet, odeljenje, ucenik, ocena)
  const [subjectId, setSubjectId] = useState<number>();
  const [classroomId, setClassroomId] = useState<number>();
  const [studentId, setStudentId] = useState<number>();
  const [value, setValue] = useState<number>();

  // slanje zahteva za kreiranje nove ocene na /api/grades
  const submit = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch("/api/grades", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          subjectId,
          classroomId,
          studentId,
          value,
        }),
      });

      if (!res.ok) throw new Error();

      toast.success("Ocena uspešno dodata");
    } catch {
      toast.error("Greška pri unosu ocene");
    }
  };

  // studenti se filtriraju na osnovu izabranog odeljenja
  const students = classrooms.find((c) => c.id === classroomId)?.students ?? [];

  return (
    <div className="space-y-4 border p-4 rounded bg-white">
      <select onChange={(e) => setSubjectId(Number(e.target.value))}>
        <option>Predmet</option>
        {subjects.map((s) => (
          <option key={s.id} value={s.id}>
            {s.name}
          </option>
        ))}
      </select>

      <select onChange={(e) => setClassroomId(Number(e.target.value))}>
        <option>Odeljenje</option>
        {classrooms.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>

      <select onChange={(e) => setStudentId(Number(e.target.value))}>
        <option>Učenik</option>
        {students.map((s) => (
          <option key={s.id} value={s.id}>
            {s.full_name}
          </option>
        ))}
      </select>

      <select onChange={(e) => setValue(Number(e.target.value))}>
        <option>Ocena</option>
        {[1, 2, 3, 4, 5].map((g) => (
          <option key={g} value={g}>
            {g}
          </option>
        ))}
      </select>

      <Button onClick={submit}>Sačuvaj ocenu</Button>
    </div>
  );
};

export default AddGradeForm;
