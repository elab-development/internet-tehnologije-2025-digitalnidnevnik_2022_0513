/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import UsersTable from "@/components/admin/users-table";

type Role = "ADMIN" | "TEACHER" | "STUDENT";

const AdminUsersPage = () => {
  const router = useRouter();
  // stanje sa listom korisnika koja se prikazuje u tabeli
  // (jednostavnost tip any[], ali struktura dolazi sa /api/admin/users)

  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // rola je potrebna da sprecimo pristup stranici ako korisnik nije ADMIN
  const role =
    typeof window !== "undefined"
      ? (localStorage.getItem("role") as Role | null)
      : null;

  useEffect(() => {
    if (role !== "ADMIN") {
      router.replace("/dashboard");
      return;
    }

    // pomocna funkcija koja uzima korisnike preko admin api-ja
    async function loadUsers() {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch("/api/admin/users", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error();

        const data = await res.json();
        setUsers(data);
      } catch {
        toast.error("Greška pri učitavanju korisnika");
      } finally {
        setLoading(false);
      }
    }

    loadUsers();
  }, [role, router]);

  if (loading) {
    return <div className="p-6">Učitavanje...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <h1 className="text-xl font-semibold">Upravljanje korisnicima</h1>
      <UsersTable users={users} onChange={setUsers} />
    </div>
  );
};

export default AdminUsersPage;
