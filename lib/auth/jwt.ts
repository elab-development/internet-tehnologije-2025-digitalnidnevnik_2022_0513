import jwt from "jsonwebtoken";
import { JwtUser } from "./types";

export function signToken(payload: JwtUser) {
  return jwt.sign(payload, process.env.JWT_SECRET!, {
    expiresIn: "1d",
  });
}

export function verifyToken(token: string): JwtUser {
  return jwt.verify(token, process.env.JWT_SECRET!) as JwtUser;
}
