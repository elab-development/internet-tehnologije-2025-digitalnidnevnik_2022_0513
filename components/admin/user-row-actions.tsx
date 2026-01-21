"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";

export type AdminUser = {
  id: number;
  username: string;
  full_name: string;
  role: "ADMIN" | "TEACHER" | "STUDENT";
  classroom: string | null;
  classroomId: number | null;
};

type ClassroomOption = {
  id: number;
  name: string;
};

// dialog za edit osnovnih podataka o korisniku
// (uloga, ime, odeljenje)
// koristi se u admin panelu: /admin/users.
const UsersRowActions = ({
  user,
  onChange,
}: {
  user: AdminUser;
  onChange: (users: AdminUser[]) => void;
}) => {
  const [open, setOpen] = useState(false);
  const [fullName, setFullName] = useState(user.full_name ?? "");
  const [role, setRole] = useState<AdminUser["role"]>(user.role);
  const [classroomId, setClassroomId] = useState<number | null>(
    user.classroomId ?? null,
  );
  const [classrooms, setClassrooms] = useState<ClassroomOption[]>([]);
  const [loading, setLoading] = useState(false);

  // kada se dialog otvori ucitavamo listu odeljenja za select.
  useEffect(() => {
    if (!open) return;

    const loadClassrooms = async () => {
      try {
        // pozivamo admin/classrooms endpoint i mapiramo ga u jednostavan {id, name} oblik
        const token = localStorage.getItem("token");
        const res = await fetch("/api/admin/classrooms", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) return;
        const data = await res.json();
        const options: ClassroomOption[] = data.map(
          (c: { id: number; name: string }) => ({ id: c.id, name: c.name }),
        );
        setClassrooms(options);
      } catch {
        // ignore
      }
    };

    loadClassrooms();
  }, [open]);

  // ponovno ucitavanje korisnika - uspesna sinhronizacija tabele
  const reloadUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/admin/users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) return;
      const data = await res.json();
      onChange(data);
    } catch {
      // swallow
    }
  };

  // slanje PATCH: /api/admin/users/[id] sa unetim izmenama
  const save = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      // PATCH ka backendu sa novim vrednostima polja
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          role,
          full_name: fullName,
          classroomId,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        toast.error(err.error || "Greška pri izmeni korisnika");
        return;
      }

      toast.success("Korisnik uspešno izmenjen");
      setOpen(false);
      await reloadUsers();
    } catch {
      toast.error("Greška pri izmeni korisnika");
    } finally {
      setLoading(false);
    }
  };

  const resetState = () => {
    setFullName(user.full_name ?? "");
    setRole(user.role);
    setClassroomId(user.classroomId ?? null);
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
          Uredi
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Uređivanje korisnika</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">Ime i prezime</label>
            <Input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder={user.username}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Uloga</label>
            <select
              className="w-full border rounded px-2 py-1 text-sm"
              value={role}
              onChange={(e) => setRole(e.target.value as AdminUser["role"])}>
              <option value="STUDENT">STUDENT</option>
              <option value="TEACHER">TEACHER</option>
              <option value="ADMIN">ADMIN</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Odeljenje</label>
            <select
              className="w-full border rounded px-2 py-1 text-sm"
              value={classroomId ?? ""}
              onChange={(e) => {
                const v = e.target.value;
                setClassroomId(v === "" ? null : Number(v));
              }}>
              <option value="">Bez odeljenja</option>
              {classrooms.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
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

export default UsersRowActions;
