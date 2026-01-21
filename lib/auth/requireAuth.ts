import { verifyToken } from "./jwt";
import { JwtUser } from "./types";

export function requireAuth(req: Request): JwtUser {
  const auth = req.headers.get("authorization");

  if (!auth) {
    throw new Error("Unauthorized");
  }

  const token = auth.replace("Bearer ", "");
  return verifyToken(token);
}
