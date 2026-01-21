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
    </div>
  );
};

export default AdminDashboard;
