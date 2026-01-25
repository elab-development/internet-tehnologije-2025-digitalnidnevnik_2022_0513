/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import UsersTable from "@/components/admin/users-table";

type Role = "ADMIN" | "TEACHER" | "STUDENT";

const AdminUsersPage = () => {
  const router = useRouter();
  // stanje sa listom korisnika koja se prikazuje u tabeli
  // (jednostavnost tip any[], ali struktura dolazi sa /api/admin/users)

  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [newUsername, setNewUsername] = useState("");
  const [newFullName, setNewFullName] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState<Role>("STUDENT");
  const [creating, setCreating] = useState(false);

  // rola je potrebna da sprecimo pristup stranici ako korisnik nije ADMIN
  const role =
    typeof window !== "undefined"
      ? (localStorage.getItem("role") as Role | null)
      : null;

  const loadUsers = async () => {
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
  };

  useEffect(() => {
    if (role !== "ADMIN") {
      router.replace("/dashboard");
      return;
    }

    loadUsers();
  }, [role, router]);

  const createUser = async () => {
    try {
      if (!newUsername || !newPassword) {
        toast.error("Popunite korisničko ime i lozinku");
        return;
      }
      setCreating(true);
      const token = localStorage.getItem("token");
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          username: newUsername,
          password: newPassword,
          role: newRole,
          full_name: newFullName || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Greška pri kreiranju korisnika");
        return;
      }

      toast.success("Korisnik je dodat");
      setNewUsername("");
      setNewFullName("");
      setNewPassword("");
      setNewRole("STUDENT");
      // osvezavamo listu korisnika sa servera
      await loadUsers();
    } catch {
      toast.error("Greška pri kreiranju korisnika");
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return <div className="p-6">Učitavanje...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <h1 className="text-xl font-semibold">Upravljanje korisnicima</h1>

      <div className="border bg-white p-4 rounded space-y-3">
        <h2 className="font-medium">Dodaj korisnika</h2>
        <div className="grid gap-3 md:grid-cols-4">
          <div className="space-y-1">
            <label className="text-sm font-medium">Korisničko ime</label>
            <Input
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              placeholder="novo_korisnicko_ime"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">
              Ime i prezime (opciono)
            </label>
            <Input
              value={newFullName}
              onChange={(e) => setNewFullName(e.target.value)}
              placeholder="Ime i prezime"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Lozinka</label>
            <Input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Uloga</label>
            <select
              className="w-full border rounded px-2 py-1 text-sm"
              value={newRole}
              onChange={(e) => setNewRole(e.target.value as Role)}>
              <option value="STUDENT">STUDENT</option>
              <option value="TEACHER">TEACHER</option>
              <option value="ADMIN">ADMIN</option>
            </select>
          </div>
        </div>
        <Button
          type="button"
          className="mt-2"
          onClick={createUser}
          disabled={creating}>
          {creating ? "Kreiranje..." : "Dodaj korisnika"}
        </Button>
      </div>

      <UsersTable users={users} onChange={setUsers} />
    </div>
  );
};

export default AdminUsersPage;
