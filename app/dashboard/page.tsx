"use client";

import { useEffect, useState } from "react";

import AdminDashboard from "@/components/dashboard/admin-dashboard";
import TeacherDashboard from "@/components/dashboard/teacher-dashboard";
import StudentDashboard from "@/components/dashboard/student-dashboard";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
type Role = "ADMIN" | "TEACHER" | "STUDENT";

type Me = {
  id: number;
  username: string;
  full_name: string | null;
  role: Role;
  ip: string;
  classroom: { id: number; name: string } | null;
};

const DashboardPage = () => {
  // rolu citamo iz localStorage-a (postavlja se pri uspesnom login-u)
  const [role] = useState<Role | null>(() => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("role") as Role | null;
  });

  const [me, setMe] = useState<Me | null>(null);
  const [meLoading, setMeLoading] = useState(true);

  // ucitavanje informacija o trenutno ulogovanom korisniku (za prikaz u kartici)
  useEffect(() => {
    async function loadMe() {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setMeLoading(false);
          return;
        }

        const res = await fetch("/api/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          setMeLoading(false);
          return;
        }

        const data = await res.json();
        setMe(data);
      } catch {
        // ignore, dashboard i dalje radi
      } finally {
        setMeLoading(false);
      }
    }

    loadMe();
  }, []);

  // dok rola nije ucitana sa klijenta, prikazujemo jednostavnu poruku
  if (!role) {
    return <div className="p-6 text-slate-500">Učitavanje...</div>;
  }

  const roleLabel: Record<Role, string> = {
    ADMIN: "Administrator",
    TEACHER: "Nastavnik",
    STUDENT: "Učenik",
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Ulogovan korisnik{me ? "" : " (lokalni podaci)"}</span>
            <Badge variant="outline">Rola: {roleLabel[role]}</Badge>
          </CardTitle>
          <CardDescription>
            {meLoading && "Učitavanje podataka o korisniku..."}
            {!meLoading && me && (
              <span>
                Korisničko ime: <strong>{me.username}</strong>{" "}
                {me.full_name && <>( {me.full_name} )</>}
              </span>
            )}
            {!meLoading && !me && (
              <span>
                Podaci o korisniku nisu učitani sa servera, prikazuje se samo
                rola iz localStorage-a.
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-1 text-sm text-slate-600">
          {me && (
            <>
              <div>
                IP adresa (detektovana):{" "}
                <span className="font-mono">{me.ip}</span>
              </div>
              {me.classroom && role === "STUDENT" && (
                <div>
                  Odeljenje: <strong>{me.classroom.name}</strong>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {role === "ADMIN" && <AdminDashboard />}
      {role === "TEACHER" && <TeacherDashboard />}
      {role === "STUDENT" && <StudentDashboard />}
    </div>
  );
};

export default DashboardPage;
