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
