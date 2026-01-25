"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";

type Role = "ADMIN" | "TEACHER" | "STUDENT";

type TeacherOption = {
  id: number;
  label: string;
};

type SubjectOption = {
  id: number;
  name: string;
};

type ClassroomOption = {
  id: number;
  name: string;
};

type Link = {
  id: number;
  teacherId: number;
  subjectId: number;
  classroomId: number;
  teacherLabel: string;
  subjectName: string;
  classroomName: string;
};

const AdminTeacherSubjectsPage = () => {
  const router = useRouter();
  const [teachers, setTeachers] = useState<TeacherOption[]>([]);
  const [subjects, setSubjects] = useState<SubjectOption[]>([]);
  const [classrooms, setClassrooms] = useState<ClassroomOption[]>([]);
  const [links, setLinks] = useState<Link[]>([]);
  const [loading, setLoading] = useState(true);

  const [teacherId, setTeacherId] = useState<number | "">("");
  const [subjectId, setSubjectId] = useState<number | "">("");
  const [classroomId, setClassroomId] = useState<number | "">("");
  const [creating, setCreating] = useState(false);

  const role =
    typeof window !== "undefined"
      ? (localStorage.getItem("role") as Role | null)
      : null;

  useEffect(() => {
    if (role !== "ADMIN") {
      router.replace("/dashboard");
      return;
    }

    const loadAll = async () => {
      try {
        const token = localStorage.getItem("token");

        const [teachersRes, subjectsRes, classroomsRes, linksRes] =
          await Promise.all([
            fetch("/api/admin/teachers", {
              headers: { Authorization: `Bearer ${token}` },
            }),
            fetch("/api/admin/subjects", {
              headers: { Authorization: `Bearer ${token}` },
            }),
            fetch("/api/admin/classrooms", {
              headers: { Authorization: `Bearer ${token}` },
            }),
            fetch("/api/admin/teacher-subjects", {
              headers: { Authorization: `Bearer ${token}` },
            }),
          ]);

        if (!teachersRes.ok || !subjectsRes.ok || !classroomsRes.ok || !linksRes.ok) {
          throw new Error();
        }

        const teachersJson = await teachersRes.json();
        const subjectsJson = await subjectsRes.json();
        const classroomsJson = await classroomsRes.json();
        const linksJson = await linksRes.json();

        setTeachers(teachersJson);
        setSubjects(subjectsJson);
        setClassrooms(classroomsJson.map((c: any) => ({ id: c.id, name: c.name })));
        setLinks(linksJson);
      } catch {
        toast.error("Greška pri učitavanju podataka za dodelu predmeta");
      } finally {
        setLoading(false);
      }
    };

    loadAll();
  }, [role, router]);

  const createLink = async () => {
    try {
      if (!teacherId || !subjectId || !classroomId) {
        toast.error("Izaberite nastavnika, predmet i odeljenje");
        return;
      }
      setCreating(true);
      const token = localStorage.getItem("token");
      const res = await fetch("/api/admin/teacher-subjects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          teacherId: Number(teacherId),
          subjectId: Number(subjectId),
          classroomId: Number(classroomId),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Greška pri dodeli predmeta");
        return;
      }

      toast.success("Veza nastavnik–predmet–odeljenje je dodata");
      setLinks((prev) => [...prev, data]);
      setTeacherId("");
      setSubjectId("");
      setClassroomId("");
    } catch {
      toast.error("Greška pri dodeli predmeta");
    } finally {
      setCreating(false);
    }
  };

  const deleteLink = async (id: number) => {
    if (!window.confirm("Da li ste sigurni da želite da obrišete ovu dodelu?")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/admin/teacher-subjects?id=${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.error || "Greška pri brisanju veze");
        return;
      }

      toast.success("Veza je obrisana");
      setLinks((prev) => prev.filter((l) => l.id !== id));
    } catch {
      toast.error("Greška pri brisanju veze");
    }
  };

  if (loading) {
    return <div className="p-6">Učitavanje...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <h1 className="text-xl font-semibold">Dodela predmeta nastavnicima</h1>

      <div className="border bg-white p-4 rounded space-y-3">
        <h2 className="font-medium">Nova dodela</h2>
        <div className="grid gap-3 md:grid-cols-3">
          <div className="space-y-1">
            <label className="text-sm font-medium">Nastavnik</label>
            <select
              className="w-full border rounded px-2 py-1 text-sm"
              value={teacherId}
              onChange={(e) => setTeacherId(e.target.value ? Number(e.target.value) : "")}
            >
              <option value="">Izaberite nastavnika</option>
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Predmet</label>
            <select
              className="w-full border rounded px-2 py-1 text-sm"
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value ? Number(e.target.value) : "")}
            >
              <option value="">Izaberite predmet</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Odeljenje</label>
            <select
              className="w-full border rounded px-2 py-1 text-sm"
              value={classroomId}
              onChange={(e) => setClassroomId(e.target.value ? Number(e.target.value) : "")}
            >
              <option value="">Izaberite odeljenje</option>
              {classrooms.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <Button type="button" onClick={createLink} disabled={creating}>
          {creating ? "Dodavanje..." : "Dodaj dodelu"}
        </Button>
      </div>

      <table className="w-full border bg-white">
        <thead>
          <tr className="border-b">
            <th className="p-2 text-left">Nastavnik</th>
            <th className="p-2 text-left">Predmet</th>
            <th className="p-2 text-left">Odeljenje</th>
            <th className="p-2 text-center">Akcije</th>
          </tr>
        </thead>
        <tbody>
          {links.map((l) => (
            <tr key={l.id} className="border-b">
              <td className="p-2 text-sm">{l.teacherLabel}</td>
              <td className="p-2 text-sm">{l.subjectName}</td>
              <td className="p-2 text-sm">{l.classroomName}</td>
              <td className="p-2 text-center">
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => deleteLink(l.id)}
                >
                  Obriši
                </Button>
              </td>
            </tr>
          ))}
          {links.length === 0 && (
            <tr>
              <td colSpan={4} className="p-3 text-center text-slate-600">
                Trenutno nema dodela nastavnik–predmet–odeljenje.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default AdminTeacherSubjectsPage;
