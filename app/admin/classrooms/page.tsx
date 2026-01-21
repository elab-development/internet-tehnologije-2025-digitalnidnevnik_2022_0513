/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import ClassroomsTable from "@/components/admin/classrooms-table";

type Role = "ADMIN" | "TEACHER" | "STUDENT";

const AdminClassroomsPage = () => {
  const router = useRouter();
  // lista odeljenja koja se prikazuje u admin tabeli
  const [classrooms, setClassrooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // proveravamo rolu korisnika kako bismo ogranicili pristup samo na ADMIN
  const role =
    typeof window !== "undefined"
      ? (localStorage.getItem("role") as Role | null)
      : null;

  useEffect(() => {
    if (role !== "ADMIN") {
      router.replace("/dashboard");
      return;
    }

    // uzimamo listu odeljenja iz /api/admin/classrooms
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
    loadClassrooms();
  }, [role, router]);

  if (loading) {
    return <div className="p-6">Učitavanje...</div>;
  }
  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <h1 className="text-xl font-semibold">Upravljanje odeljenjima</h1>

      <ClassroomsTable classrooms={classrooms} onChange={setClassrooms} />
    </div>
  );
};

export default AdminClassroomsPage;
