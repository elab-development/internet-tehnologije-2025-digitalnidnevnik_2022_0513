import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { signToken } from "@/lib/auth/jwt";
import { comparePassword } from "@/lib/security/password";

/**
 * POST /api/auth/login
 *
 * proverava korisnika i vraca JWT token + osnovne podatke o korisniku
 */
export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();

    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Neispravno korisničko ime ili lozinka" },
        { status: 401 }
      );
    }

    const isValid = await comparePassword(password, user.password);

    // console.log("samo sifra:", password);
    // console.log("hash za sifru :", user.password);
    // console.log("da li su iste:", await bcrypt.compare(password, user.password));

    if (!isValid) {
      return NextResponse.json(
        { error: "Neispravno korisničko ime ili lozinka" },
        { status: 401 }
      );
    }

    const token = signToken({
      id: user.id,
      role: user.role,
    });

    return NextResponse.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
      },
    });
  } catch {
    return NextResponse.json({ error: "Prijava nije uspela" }, { status: 500 });
  }
}
