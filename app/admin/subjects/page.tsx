"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Role = "ADMIN" | "TEACHER" | "STUDENT";

type Subject = {
  id: number;
  name: string;
};

const AdminSubjectsPage = () => {
  const router = useRouter();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);

  const role =
    typeof window !== "undefined"
      ? (localStorage.getItem("role") as Role | null)
      : null;

  const loadSubjects = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/admin/subjects", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error();
      const data = await res.json();
      setSubjects(data);
    } catch {
      toast.error("Greška pri učitavanju predmeta");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (role !== "ADMIN") {
      router.replace("/dashboard");
      return;
    }

    loadSubjects();
  }, [role, router]);

  const createSubject = async () => {
    try {
      if (!newName.trim()) {
        toast.error("Unesite naziv predmeta");
        return;
      }
      setCreating(true);
      const token = localStorage.getItem("token");
      const res = await fetch("/api/admin/subjects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: newName }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Greška pri kreiranju predmeta");
        return;
      }

      toast.success("Predmet je dodat");
      setNewName("");
      await loadSubjects();
    } catch {
      toast.error("Greška pri kreiranju predmeta");
    } finally {
      setCreating(false);
    }
  };

  const deleteSubject = async (id: number) => {
    if (!window.confirm("Da li ste sigurni da želite da obrišete predmet?")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/admin/subjects?id=${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.error || "Greška pri brisanju predmeta");
        return;
      }

      toast.success("Predmet je obrisan");
      setSubjects((prev) => prev.filter((s) => s.id !== id));
    } catch {
      toast.error("Greška pri brisanju predmeta");
    }
  };

  if (loading) {
    return <div className="p-6">Učitavanje...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-xl font-semibold">Upravljanje predmetima</h1>

      <div className="border bg-white p-4 rounded space-y-3">
        <h2 className="font-medium">Dodaj predmet</h2>
        <div className="flex gap-2 flex-wrap items-center">
          <Input
            className="flex-1 min-w-[200px]"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Matematika"
          />
          <Button type="button" onClick={createSubject} disabled={creating}>
            {creating ? "Kreiranje..." : "Dodaj predmet"}
          </Button>
        </div>
      </div>

      <table className="w-full border bg-white">
        <thead>
          <tr className="border-b">
            <th className="p-2 text-left">ID</th>
            <th className="p-2 text-left">Naziv</th>
            <th className="p-2 text-center">Akcije</th>
          </tr>
        </thead>
        <tbody>
          {subjects.map((s) => (
            <tr key={s.id} className="border-b">
              <td className="p-2 text-sm text-slate-500">{s.id}</td>
              <td className="p-2 font-medium">{s.name}</td>
              <td className="p-2 text-center">
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => deleteSubject(s.id)}>
                  Obriši
                </Button>
              </td>
            </tr>
          ))}
          {subjects.length === 0 && (
            <tr>
              <td colSpan={3} className="p-3 text-center text-slate-600">
                Nema definisanih predmeta.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default AdminSubjectsPage;
