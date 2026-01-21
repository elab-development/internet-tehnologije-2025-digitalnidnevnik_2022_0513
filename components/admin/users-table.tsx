import UserRowActions, { AdminUser } from "./user-row-actions";

// potpuno isti tip kao AdminUser iz user-row-actions
type User = AdminUser;

const UsersTable = ({
  users,
  onChange,
}: {
  users: User[];
  onChange: (users: User[]) => void;
}) => {
  return (
    <table className="w-full border bg-white">
      <thead>
        <tr className="border-b">
          <th className="p-2 text-left">Korisnik</th>
          <th className="p-2">Uloga</th>
          <th className="p-2">Odeljenje</th>
          <th className="p-2">Akcije</th>
        </tr>
      </thead>
      <tbody>
        {users.map((u) => (
          <tr key={u.id} className="border-b">
            <td className="p-2">
              <div className="font-medium">{u.full_name}</div>
              <div className="text-sm text-slate-500">{u.username}</div>
            </td>
            <td className="p-2 text-center">{u.role}</td>
            <td className="p-2 text-center">{u.classroom ?? "—"}</td>
            <td className="p-2 text-center">
              <UserRowActions user={u} onChange={onChange} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default UsersTable;
