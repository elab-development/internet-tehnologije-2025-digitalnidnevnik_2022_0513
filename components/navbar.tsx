"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";

type Role = "ADMIN" | "TEACHER" | "STUDENT" | null;
const Navbar = () => {
  const router = useRouter();

  const [role, setRole] = useState<Role>(null);
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    function syncAuth() {
      setRole(localStorage.getItem("role") as Role);
      setUsername(localStorage.getItem("username"));
    }

    syncAuth();

    window.addEventListener("auth-changed", syncAuth);

    return () => {
      window.removeEventListener("auth-changed", syncAuth);
    };
  }, []);

  const logout = () => {
    localStorage.clear();
    setRole(null);
    setUsername(null);
    toast.success("Uspešno ste se odjavili");
    router.push("/login");
  };

  useEffect(() => {
    const syncAuth = () => {
      setRole(localStorage.getItem("role") as Role);
      setUsername(localStorage.getItem("username"));
    };

    window.addEventListener("auth-changed", syncAuth);

    return () => {
      window.removeEventListener("auth-changed", syncAuth);
    };
  }, []);

  return (
    <nav className="flex justify-between items-center px-8 py-4 border-b">
      {/* LEFT */}
      <Link href="/" className="text-lg font-semibold">
        eDnevnik | <span className="text-sm text-blue-800">{role}</span>
      </Link>

      {/* RIGHT */}
      <div className="flex items-center gap-4">
        {!role && (
          <>
            <Button variant="ghost" asChild>
              <Link href="/login">Prijava</Link>
            </Button>
            <Button asChild>
              <Link href="/register">Registracija</Link>
            </Button>
          </>
        )}

        {role === "ADMIN" && (
          <>
            <Link href="/dashboard">Dashboard</Link>
            <Link href="/admin/users">Korisnici</Link>
            <Link href="/admin/classrooms">Odeljenja</Link>
          </>
        )}

        {role === "TEACHER" && (
          <>
            <Link href="/dashboard">Panel</Link>
            <Link href="/grades">Ocene</Link>
            <Link href="/classrooms">Moje odeljenje</Link>
          </>
        )}

        {role === "STUDENT" && (
          <>
            <Link href="/dashboard">Panel</Link>
            <Link href="/grades">Moje ocene</Link>
            <Link href="/classrooms">Moje odeljenje</Link>
          </>
        )}

        {role && (
          <>
            <span className="text-sm text-slate-500">{username}</span>
            <Button variant="outline" size="sm" onClick={logout}>
              Odjava
            </Button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
