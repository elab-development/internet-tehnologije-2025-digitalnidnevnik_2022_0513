import ClassroomRowActions from "./classroom-row-actions";

type Classroom = {
  id: number;
  name: string;
  homeroomTeacher: string | null;
  homeroomTeacherId?: number | null;
  studentsCount: number;
};

const ClassroomsTable = ({
  classrooms,
  onChange,
}: {
  classrooms: Classroom[];
  onChange: (c: Classroom[]) => void;
}) => {
  return (
    <table className="w-full border bg-white">
      <thead>
        <tr className="border-b">
          <th className="p-2 text-left">Odeljenje</th>
          <th className="p-2">Razredni starešina</th>
          <th className="p-2">Broj učenika</th>
          <th className="p-2">Akcije</th>
        </tr>
      </thead>
      <tbody>
        {classrooms.map((c) => (
          <tr key={c.id} className="border-b">
            <td className="p-2 font-medium">{c.name}</td>
            <td className="p-2 text-center">{c.homeroomTeacher ?? "—"}</td>
            <td className="p-2 text-center">{c.studentsCount}</td>
            <td className="p-2 text-center">
              <ClassroomRowActions classroom={c} onChange={onChange} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default ClassroomsTable;
