"use client";

import { useState } from "react";

import AdminDashboard from "@/components/dashboard/admin-dashboard";
import TeacherDashboard from "@/components/dashboard/teacher-dashboard";
import StudentDashboard from "@/components/dashboard/student-dashboard";

type Role = "ADMIN" | "TEACHER" | "STUDENT";

const DashboardPage = () => {
  // rolu citamo iz localStorage-a (postavlja se pri uspesnom login-u)
  const [role] = useState<Role | null>(() => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("role") as Role | null;
  });

  // dok rola nije ucitana sa klijenta, prikazujemo jednostavnu poruku
  if (!role) {
    return <div className="p-6 text-slate-500">Učitavanje...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      {role === "ADMIN" && <AdminDashboard />}
      {role === "TEACHER" && <TeacherDashboard />}
      {role === "STUDENT" && <StudentDashboard />}
    </div>
  );
};

export default DashboardPage;
