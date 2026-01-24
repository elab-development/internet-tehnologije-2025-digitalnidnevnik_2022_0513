import Link from "next/link";
import { Button } from "@/components/ui/button";

const AdminDashboard = () => {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Administratorski panel</h2>

      <ul className="list-disc pl-5 text-slate-600">
        <li>Upravljanje korisnicima</li>
        <li>Upravljanje odeljenjima</li>
        <li>Dodela nastavnika i predmeta</li>
        <li>Pregled celog sistema</li>
      </ul>

      <div className="pt-2 flex flex-wrap gap-2">
        <Button asChild variant="outline">
          <Link href="/admin/users">Korisnici</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/admin/classrooms">Odeljenja</Link>
        </Button>
      </div>
    </div>
  );
};

export default AdminDashboard;
