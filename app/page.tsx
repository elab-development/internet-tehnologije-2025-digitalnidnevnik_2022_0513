import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero sekcija */}
      <main className="flex-1 flex items-center justify-center px-6">
        <div className="max-w-xl text-center space-y-6">
          <h2 className="text-3xl font-bold">Digitalni učenički dnevnik</h2>

          <p className="text-slate-600">
            eDnevnik je veb aplikacija namenjena digitalnom vođenju evidencije o
            učenicima, nastavnicima, odeljenjima i ocenama. Sistem omogućava
            različite nivoe pristupa u zavisnosti od uloge korisnika.
          </p>

          <div className="flex justify-center gap-4">
            <Button asChild>
              <Link href="/login">Prijavi se</Link>
            </Button>

            <Button variant="outline" asChild>
              <Link href="/register">Registruj se</Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
