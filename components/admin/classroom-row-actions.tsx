"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";

type Classroom = {
  id: number;
  name: string;
  homeroomTeacher: string | null;
  homeroomTeacherId?: number | null;
  studentsCount: number;
};

type TeacherOption = {
  id: number;
  label: string;
};

type Props = {
  classroom: Classroom;
  onChange: (classrooms: Classroom[]) => void;
};

// dialog za izbor/uklanjanje razrednog staresine za dato odeljenje
// koristi se u admin panelu: /admin/classrooms.
const ClassroomRowActions = ({ classroom, onChange }: Props) => {
  const [open, setOpen] = useState(false);
  const [homeroomTeacherId, setHomeroomTeacherId] = useState<number | null>(
    classroom.homeroomTeacherId ?? null
  );
  const [teachers, setTeachers] = useState<TeacherOption[]>([]);
  const [loading, setLoading] = useState(false);

  // kada se dialog otvori povlacimo listu (TEACHER) za select.
  useEffect(() => {
    if (!open) return;

    const loadTeachers = async () => {
      try {
        // pozivamo /api/admin/teachers i dobijamo listu nastavnika za select
        const token = localStorage.getItem("token");
        const res = await fetch("/api/admin/teachers", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) return;
        const data = await res.json();
        setTeachers(data);
      } catch {
        // ignore jer toast vec postoji cuvanju
      }
    };

    loadTeachers();
  }, [open]);

  // ponovno ucitavanje odeljenja nakon uspesne izmene kako bi tabela ostala sinhronizovana
  const reloadClassrooms = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/admin/classrooms", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) return;
      const data = await res.json();
      onChange(data);
    } catch {
      // opet ignore
    }
  };

  // slanje PATCH: /api/admin/classrooms/[id] sa novim homeroomTeacherId.
  const save = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      // PATCH na admin/classrooms/[id] sa novim homeroomTeacherId vrednostima
      const res = await fetch(`/api/admin/classrooms/${classroom.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ homeroomTeacherId }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        toast.error(err.error || "Greška pri izmeni odeljenja");
        return;
      }

      toast.success("Razredni starešina uspešno izmenjen");
      setOpen(false);
      await reloadClassrooms();
    } catch {
      toast.error("Greška pri izmeni odeljenja");
    } finally {
      setLoading(false);
    }
  };

  const resetState = () => {
    setHomeroomTeacherId(classroom.homeroomTeacherId ?? null);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (isOpen) {
          resetState();
        }
        setOpen(isOpen);
      }}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Uredi starešinu
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Razredni starešina za {classroom.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">Razredni starešina</label>
            <select
              className="w-full border rounded px-2 py-1 text-sm"
              value={homeroomTeacherId ?? ""}
              onChange={(e) => {
                const v = e.target.value;
                setHomeroomTeacherId(v === "" ? null : Number(v));
              }}>
              <option value="">Bez starešine</option>
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <DialogFooter className="mt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}>
            Otkaži
          </Button>
          <Button type="button" onClick={save} disabled={loading}>
            {loading ? "Čuvanje..." : "Sačuvaj"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ClassroomRowActions;
