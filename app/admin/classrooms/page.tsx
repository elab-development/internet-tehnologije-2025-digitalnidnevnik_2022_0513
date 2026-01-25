/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ClassroomsTable from "@/components/admin/classrooms-table";

type Role = "ADMIN" | "TEACHER" | "STUDENT";

const AdminClassroomsPage = () => {
  const router = useRouter();
  // lista odeljenja koja se prikazuje u admin tabeli
  const [classrooms, setClassrooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);

  // proveravamo rolu korisnika kako bismo ogranicili pristup samo na ADMIN
  const role =
    typeof window !== "undefined"
      ? (localStorage.getItem("role") as Role | null)
      : null;

  const loadClassrooms = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch("/api/admin/classrooms", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error();

      const data = await res.json();
      setClassrooms(data);
    } catch {
      toast.error("Greška pri učitavanju odeljenja");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (role !== "ADMIN") {
      router.replace("/dashboard");
      return;
    }

    loadClassrooms();
  }, [role, router]);

  const createClassroom = async () => {
    try {
      if (!newName.trim()) {
        toast.error("Unesite naziv odeljenja");
        return;
      }
      setCreating(true);
      const token = localStorage.getItem("token");
      const res = await fetch("/api/admin/classrooms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: newName }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Greška pri kreiranju odeljenja");
        return;
      }

      toast.success("Odeljenje je dodato");
      setNewName("");
      // osvezavamo sa servera da bismo imali tacan broj ucenika itd.
      await loadClassrooms();
    } catch {
      toast.error("Greška pri kreiranju odeljenja");
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return <div className="p-6">Učitavanje...</div>;
  }
  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <h1 className="text-xl font-semibold">Upravljanje odeljenjima</h1>

      <div className="border bg-white p-4 rounded space-y-3">
        <h2 className="font-medium">Dodaj odeljenje</h2>
        <div className="flex gap-2 flex-wrap items-center">
          <Input
            className="flex-1 min-w-[200px]"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="I-1"
          />
          <Button
            type="button"
            onClick={createClassroom}
            disabled={creating}>
            {creating ? "Kreiranje..." : "Dodaj odeljenje"}
          </Button>
        </div>
      </div>

      <ClassroomsTable classrooms={classrooms} onChange={setClassrooms} />
    </div>
  );
};

export default AdminClassroomsPage;
