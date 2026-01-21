export type Role = "ADMIN" | "TEACHER" | "STUDENT";

export type JwtUser = {
  id: number;
  role: Role;
};
