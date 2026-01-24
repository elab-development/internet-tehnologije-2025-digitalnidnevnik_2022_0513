import Link from "next/link";
import { Button } from "@/components/ui/button";

const StudentDashboard = () => {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Učenički panel</h2>

      <ul className="list-disc pl-5 text-slate-600">
        <li>Pregled ocena po predmetima</li>
        <li>Pregled zadataka i rokova</li>
      </ul>

      <div className="pt-2 flex gap-2 flex-wrap">
        <Button asChild variant="outline">
          <Link href="/grades">Moje ocene</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/classrooms">Moje odeljenje</Link>
        </Button>
        <Button asChild>
          <Link href="/assignments/student">Moji zadaci</Link>
        </Button>
      </div>
    </div>
  );
};

export default StudentDashboard;
