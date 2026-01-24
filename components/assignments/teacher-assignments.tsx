"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

// tipovi koji odgovaraju strukturi objekata koje vraca /api/assignments
// (Assignment zajedno sa pridruzenim predmetom, odeljenjem i nastavnikom)
type Assignment = {
  id: number;
  title: string;
  description: string | null;
  dueDate: string;
  subject: { id: number; name: string };
  classroom: { id: number; name: string };
};

type Subject = {
  id: number;
  name: string;
};

type Classroom = {
  id: number;
  name: string;
};

const TeacherAssignments = () => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [subjectId, setSubjectId] = useState<number | undefined>();
  const [classroomId, setClassroomId] = useState<number | undefined>();

  // ucitavanje postojecih zadataka i konteksta (predmeti + odeljenja)
  useEffect(() => {
    async function loadData() {
      try {
        const token = localStorage.getItem("token");

        // zadaci za ovog nastavnika
        const assignmentsRes = await fetch("/api/assignments", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!assignmentsRes.ok) throw new Error();
        const assignmentsJson = await assignmentsRes.json();
        setAssignments(assignmentsJson);

        // za izbor predmeta i odeljenja mozemo da iskoristimo isti kontekst kao za ocene
        const contextRes = await fetch("/api/teacher/grades/context", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!contextRes.ok) throw new Error();
        const contextJson = await contextRes.json();
        setSubjects(contextJson.subjects ?? []);
        setClassrooms(contextJson.classrooms ?? []);
      } catch {
        toast.error("Greška pri učitavanju zadataka ili konteksta");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  // slanje POST /api/assignments za kreiranje novog zadatka
  const createAssignment = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!title || !dueDate || !subjectId || !classroomId) {
        toast.error("Popunite naslov, rok, predmet i odeljenje");
        return;
      }

      const res = await fetch("/api/assignments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          description: description || null,
          dueDate, // frontend salje string, backend radi new Date(dueDate)
          subjectId,
          classroomId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Greška pri kreiranju zadatka");
        return;
      }

      toast.success("Zadatak je kreiran");
      // dodajemo novi zadatak u lokalnu listu bez ponovnog poziva na backend
      setAssignments((prev) => [...prev, data]);

      // reset forme
      setTitle("");
      setDescription("");
      setDueDate("");
      setSubjectId(undefined);
      setClassroomId(undefined);
    } catch {
      toast.error("Greška pri kreiranju zadatka");
    }
  };

  // brisanje zadatka preko DELETE /api/assignments?id=...
  const deleteAssignment = async (id: number) => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`/api/assignments?id=${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        toast.error(data.error || "Greška pri brisanju zadatka");
        return;
      }

      toast.success("Zadatak je obrisan");
      setAssignments((prev) => prev.filter((a) => a.id !== id));
    } catch {
      toast.error("Greška pri brisanju zadatka");
    }
  };

  if (loading) {
    return <div>Učitavanje zadataka...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Zadaci (nastavnik)</h1>

      {/* Forma za kreiranje novog zadatka */}
      <div className="space-y-3 border p-4 rounded bg-white">
        <h2 className="font-medium">Novi zadatak</h2>

        <div className="space-y-1">
          <label className="text-sm font-medium">Naslov</label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Kontrolni iz matematike"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">Opis (opciono)</label>
          <Input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Kratak opis zadatka"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">Rok (datum i vreme)</label>
          <Input
            type="datetime-local"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </div>

        <div className="flex gap-3 flex-wrap">
          <div className="flex-1 min-w-[150px]">
            <label className="text-sm font-medium">Predmet</label>
            <select
              className="w-full border rounded px-2 py-1 text-sm"
              value={subjectId ?? ""}
              onChange={(e) =>
                setSubjectId(
                  e.target.value ? Number(e.target.value) : undefined,
                )
              }>
              <option value="">Izaberi predmet</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1 min-w-[150px]">
            <label className="text-sm font-medium">Odeljenje</label>
            <select
              className="w-full border rounded px-2 py-1 text-sm"
              value={classroomId ?? ""}
              onChange={(e) =>
                setClassroomId(
                  e.target.value ? Number(e.target.value) : undefined,
                )
              }>
              <option value="">Izaberi odeljenje</option>
              {classrooms.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <Button onClick={createAssignment}>Sačuvaj zadatak</Button>
      </div>

      {/* Lista vec kreiranih zadataka */}
      <div className="space-y-3">
        <h2 className="font-medium">Moji zadaci</h2>
        {assignments.length === 0 ? (
          <p className="text-slate-600">Trenutno nema kreiranih zadataka.</p>
        ) : (
          <div className="space-y-2">
            {assignments.map((a) => {
              const due = new Date(a.dueDate);
              const msUntil = due.getTime() - Date.now();
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
                      <Button
                        variant="outline"
                        size="sm"
                        type="button"
                        onClick={() => deleteAssignment(a.id)}>
                        Obriši
                      </Button>
                    </div>
                  </div>
                  <div className="text-sm text-slate-600">
                    {a.description || "Bez opisa"}
                  </div>
                  <div className="text-xs text-slate-500">
                    Predmet: {a.subject?.name ?? "?"} | Odeljenje:{" "}
                    {a.classroom?.name ?? "?"}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherAssignments;
