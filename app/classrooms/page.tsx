"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type Role = "ADMIN" | "TEACHER" | "STUDENT";

type Student = {
  id: number;
  full_name: string | null;
  username: string;
};

type HomeroomTeacher = {
  id: number;
  full_name: string | null;
  username: string;
} | null;

type Classroom = {
  id: number;
  name: string;
  students: Student[];
  homeroomTeacher?: HomeroomTeacher;
};

const ClassroomsPage = () => {
  const router = useRouter();
  const [role, setRole] = useState<Role | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [loading, setLoading] = useState(true);

  // citanje role i username-a iz localStorage-a
  useEffect(() => {
    if (typeof window === "undefined") return;
    const storedRole = localStorage.getItem("role") as Role | null;
    const storedUsername = localStorage.getItem("username");
    setRole(storedRole);
    setUsername(storedUsername);
  }, []);

  // ucitavanje odeljenja za nastavnika ili ucenika
  useEffect(() => {
    if (!role) return;

    const token = localStorage.getItem("token");

    if (!token) {
      router.replace("/");
      return;
    }

    async function loadForTeacher() {
      try {
        const res = await fetch("/api/teacher/grades/context", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error();
        const data = await res.json();
        setClassrooms(data.classrooms ?? []);
      } catch {
        toast.error("Greška pri učitavanju odeljenja");
      } finally {
        setLoading(false);
      }
    }

    async function loadForStudent() {
      try {
        const res = await fetch("/api/classrooms/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.status === 404) {
          setClassrooms([]);
          setLoading(false);
          return;
        }

        if (!res.ok) throw new Error();
        const classroom = await res.json();
        setClassrooms(classroom ? [classroom] : []);
      } catch {
        toast.error("Greška pri učitavanju odeljenja");
      } finally {
        setLoading(false);
      }
    }

    if (role === "TEACHER") {
      loadForTeacher();
    } else if (role === "STUDENT") {
      loadForStudent();
    } else {
      // ADMIN i ostali se preusmeravaju nazad na dashboard
      router.replace("/dashboard");
    }
  }, [role, router]);

  if (loading) {
    return <div className="p-6">Učitavanje odeljenja...</div>;
  }

  if (!role || (role !== "TEACHER" && role !== "STUDENT")) {
    return null;
  }

  const isTeacher = role === "TEACHER";

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-semibold">
        {isTeacher ? "Moja odeljenja" : "Moje odeljenje i vršnjaci"}
      </h1>

      {classrooms.length === 0 ? (
        <p className="text-slate-600">
          {isTeacher
            ? "Trenutno nemate dodeljena odeljenja."
            : "Niste dodeljeni ni jednom odeljenju. Obratite se administratoru."}
        </p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {classrooms.map((c) => (
            <Card key={c.id}>
              <CardHeader>
                <CardTitle>{c.name}</CardTitle>
                <CardDescription>
                  {isTeacher ? (
                    <>
                      Broj učenika: <strong>{c.students.length}</strong>
                      {c.homeroomTeacher && (
                        <div className="mt-1 text-xs text-slate-600">
                          {username &&
                          c.homeroomTeacher.username === username ? (
                            "Ja sam razredni starešina ovog odeljenja."
                          ) : (
                            <>
                              Razredni starešina: {" "}
                              {c.homeroomTeacher.full_name ||
                                c.homeroomTeacher.username}
                            </>
                          )}
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      Broj vršnjaka u odeljenju:{" "}
                      <strong>{c.students.length}</strong>
                      {c.homeroomTeacher && (
                        <div className="mt-1 text-xs text-slate-600">
                          Razredni starešina:{" "}
                          {c.homeroomTeacher.full_name ||
                            c.homeroomTeacher.username}
                        </div>
                      )}
                    </>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {c.students.length === 0 ? (
                  <p className="text-sm text-slate-600">
                    Nema učenika u ovom odeljenju.
                  </p>
                ) : (
                  <ul className="list-disc pl-5 text-sm text-slate-700">
                    {c.students.map((s) => (
                      <li key={s.id}>
                        {s.full_name || s.username}{" "}
                        <span className="text-xs text-slate-500">
                          ({s.username})
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ClassroomsPage;
