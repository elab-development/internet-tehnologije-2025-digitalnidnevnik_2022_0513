import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth/requireAuth";

/**
 * GET /api/admin/classrooms
 *
 * vraca listu odeljenja za admin panel, ukljucujuci:
 *  - trenutnog razrednog staresinu (ime + id)
 *  - broj ucenika u odeljenju.
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
      { error: "Samo administratori mogu da pristupe odeljenjima" },
      { status: 403 }
    );
  }

  try {
    // ucitavamo odeljenja sa trenutnim razrednim staresinom i listom ucenika
    const classrooms = await prisma.classroom.findMany({
      include: {
        homeroomTeacher: {
          select: {
            full_name: true,
          },
        },
        students: {
          select: { id: true },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    // rezultat cuvamo u formatu za admin tabelu na frontendu
    const result = classrooms.map((c) => ({
      id: c.id,
      name: c.name,
      homeroomTeacher: c.homeroomTeacher?.full_name ?? null,
      homeroomTeacherId: c.homeroomTeacherId,
      studentsCount: c.students.length,
    }));

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: `Neuspešno učitavanje odeljenja: ${error}` },
      { status: 500 }
    );
  }
}
