import Link from "next/link";
import { Button } from "@/components/ui/button";
import GuestGuard from "@/components/auth/guest-guard";

const RegisterPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <GuestGuard>
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-semibold">Registracija</h1>

          <p className="text-slate-600">
            Registracija korisnika je privremeno onemogućena.
          </p>

          <Button asChild>
            <Link href="/login">Nazad na prijavu</Link>
          </Button>
        </div>
      </GuestGuard>
    </div>
  );
};

export default RegisterPage;
