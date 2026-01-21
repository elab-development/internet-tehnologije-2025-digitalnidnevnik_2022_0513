import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { hashPassword } from "@/lib/security/password";

/**
 * POST /api/auth/register
 *
 * kreira novog korisnika sa hesiranom lozinkom
 * ruta postoji, koristi se samo za popunjavanje baze za sada
 * UI na front-u je onemogucen
 */
export async function POST(req: Request) {
  try {
    const { username, password, role } = await req.json();

    if (!username || !password || !role) {
      return NextResponse.json(
        { error: "Nedostaju obavezna polja" },
        { status: 400 }
      );
    }

    const hashedPassword = await hashPassword(password); //await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        role,
      },
    });

    return NextResponse.json(user, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Registracija nije uspela" },
      { status: 500 }
    );
  }
}
