"use client";

import { useRouter } from "next/navigation";
import StudentGrades from "@/components/grades/student-grades";
import { useEffect } from "react";
import TeacherGrades from "@/components/grades/teacher-grades";

type Role = "ADMIN" | "TEACHER" | "STUDENT";
const GradesPage = () => {
  const router = useRouter();

  // uloga korisnika (ADMIN/TEACHER/STUDENT) odredjuje koju stranicu vidi
  const role =
    typeof window !== "undefined"
      ? (localStorage.getItem("role") as Role | null)
      : null;

  // administratori nemaju stranicu za ocene - vracamo ih na dashboard
  useEffect(() => {
    if (role === "ADMIN") {
      router.replace("/dashboard");
    }
  }, [role, router]);

  if (!role) {
    return <div className="p-6">Učitavanje...</div>;
  }

  if (role === "ADMIN") {
    return null;
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      {role === "STUDENT" && <StudentGrades />}

      {role === "TEACHER" && <TeacherGrades />}
    </div>
  );
};

export default GradesPage;
