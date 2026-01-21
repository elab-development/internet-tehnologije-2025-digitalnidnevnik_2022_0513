type SubjectGrades = {
  subject: string;
  grades: number[];
};

const GradesTable = ({ data }: { data: SubjectGrades[] }) => {
  return (
    <div className="space-y-3">
      {data.map((item) => (
        <div key={item.subject} className="border rounded p-4 bg-white">
          <h2 className="font-medium">{item.subject}</h2>

          <div className="flex gap-2 mt-2">
            {item.grades.map((grade, index) => (
              <span key={index} className="px-2 py-1 border rounded text-sm">
                {grade}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default GradesTable;
