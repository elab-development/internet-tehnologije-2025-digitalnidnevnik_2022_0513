import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth/requireAuth";

/**
 * GET /api/admin/users
 *
 * vraca listu korisnika prilagodjenu za admin tabelu
 *  - ukljucuje i naziv i ID odeljenja (ukoliko postoji)
 */
export async function GET(req: Request) {
  let user;
  try {
    user = requireAuth(req);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (user.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Samo administratori mogu da pristupe korisnicima" },
      { status: 403 }
    );
  }

  try {
    // citamo sve korisnike zajedno sa eventualnim odeljenjem kojem pripadaju
    const users = await prisma.user.findMany({
      include: {
        classroom: true,
      },
      orderBy: {
        id: "asc",
      },
    });

    // mapiramo prisma model u uprosceni oblik koji frontend tabela ocekuje
    const result = users.map((u) => ({
      id: u.id,
      username: u.username,
      full_name: u.full_name ?? u.username,
      role: u.role,
      classroom: u.classroom ? u.classroom.name : null,
      classroomId: u.classroomId,
    }));

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: `Neuspešno učitavanje korisnika: ${error}` },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/users
 *
 * kreira novog korisnika (admin funkcionalnost)
 *  - telo zahteva treba da sadrzi: username, password, role, optional full_name
 */
export async function POST(req: Request) {
  let user;
  try {
    user = requireAuth(req);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (user.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Samo administratori mogu da kreiraju korisnike" },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();
    const { username, password, role, full_name } = body as {
      username?: string;
      password?: string;
      role?: "ADMIN" | "TEACHER" | "STUDENT";
      full_name?: string;
    };

    if (!username || !password || !role) {
      return NextResponse.json(
        { error: "username, password i role su obavezni" },
        { status: 400 }
      );
    }

    if (!["ADMIN", "TEACHER", "STUDENT"].includes(role)) {
      return NextResponse.json(
        { error: "Neispravna uloga" },
        { status: 400 }
      );
    }

    // koristimo istu logiku hesiranja lozinke kao i kod /api/auth/register
    const { hashPassword } = await import("@/lib/security/password");
    const hashedPassword = await hashPassword(password);

    const created = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        role,
        full_name: full_name && full_name.trim() ? full_name : null,
      },
    });

    return NextResponse.json(
      {
        id: created.id,
        username: created.username,
        full_name: created.full_name ?? created.username,
        role: created.role,
        classroom: null,
        classroomId: created.classroomId,
      },
      { status: 201 }
    );
  } catch (error: any) {
    // P2002 = unique constraint (npr. username vec postoji)
    if (error?.code === "P2002") {
      return NextResponse.json(
        { error: "Korisničko ime je već zauzeto" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: `Neuspešno kreiranje korisnika: ${error}` },
      { status: 500 }
    );
  }
}
