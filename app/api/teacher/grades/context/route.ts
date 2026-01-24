import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth/requireAuth";

/**
 * GET /api/teacher/grades/context
 *
 * vraca kontekst za unos ocena kod nastavnika
 *  - listu predmeta koje nastavnik predaje
 *  - listu odeljenja sa ucenicima za tog nastavnika
 *
 * koristi se na strani nastavnika za popunjavanje select polja
 */
export async function GET(req: Request) {
  let user;
  try {
    user = requireAuth(req);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (user.role !== "TEACHER" && user.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Samo nastavnici mogu da pristupe ovim podacima" },
      { status: 403 },
    );
  }

  try {
    // paralelno ucitavamo predmete i odeljenja koja su vezana za datog nastavnika
    const [subjects, classrooms] = await Promise.all([
      prisma.subject.findMany({
        where: {
          teachingAssignments: {
            some: { teacherId: user.id },
          },
        },
        select: {
          id: true,
          name: true,
        },
        orderBy: {
          name: "asc",
        },
      }),
      prisma.classroom.findMany({
        where: {
          teachingAssignments: {
            some: { teacherId: user.id },
          },
        },
        include: {
          homeroomTeacher: {
            select: {
              id: true,
              full_name: true,
              username: true,
            },
          },
          students: {
            select: {
              id: true,
              full_name: true,
              username: true,
            },
            orderBy: {
              full_name: "asc",
            },
          },
        },
        orderBy: {
          name: "asc",
        },
      }),
    ]);

    return NextResponse.json({ subjects, classrooms });
  } catch (error) {
    return NextResponse.json(
      { error: `Neuspešno učitavanje konteksta za ocene: ${error}` },
      { status: 500 },
    );
  }
}
