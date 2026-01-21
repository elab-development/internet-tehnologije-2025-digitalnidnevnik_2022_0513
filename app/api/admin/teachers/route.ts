import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth/requireAuth";

/**
 * GET /api/admin/teachers
 *
 * vraca listu nastavnika (id + citljiva labela) koju koristi
 * admin dialog za izbor razrednog staresine.
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
      { error: "Samo administratori mogu da pristupe nastavnicima" },
      { status: 403 }
    );
  }

  try {
    // svi korisnici koji imaju rolu TEACHER, sortirani po imenu
    const teachers = await prisma.user.findMany({
      where: { role: "TEACHER" },
      select: {
        id: true,
        username: true,
        full_name: true,
      },
      orderBy: {
        full_name: "asc",
      },
    });

    const result = teachers.map((t) => ({
      id: t.id,
      label: t.full_name ?? t.username,
    }));

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: `Neuspešno učitavanje nastavnika: ${error}` },
      { status: 500 }
    );
  }
}
