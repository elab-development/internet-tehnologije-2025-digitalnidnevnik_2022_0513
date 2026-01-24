import Link from "next/link";
import { Button } from "@/components/ui/button";

const TeacherDashboard = () => {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Nastavnički panel</h2>

      <ul className="list-disc pl-5 text-slate-600">
        <li>Pregled svog odeljenja</li>
        <li>Unos i izmena ocena</li>
        <li>Pregled predmeta koje predaješ</li>
        <li>Kreiranje i pregled zadataka za odeljenja</li>
      </ul>

      <div className="pt-2 flex gap-2 flex-wrap">
        <Button asChild variant="outline">
          <Link href="/grades">Otvori stranicu za ocene</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/classrooms">Moja odeljenja</Link>
        </Button>
        <Button asChild>
          <Link href="/assignments/teacher">Otvori zadatke</Link>
        </Button>
      </div>
    </div>
  );
};

export default TeacherDashboard;
