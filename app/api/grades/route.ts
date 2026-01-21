import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth/requireAuth";

/**
 * GET /api/grades
 *
 * vraca listu ocena filtriranu po ulozi
 *  - ADMIN   vidi sve ocene
 *  - TEACHER vidi samo ocene koje je on dodelio
 *  - STUDENT vidi samo svoje ocene
 */
export async function GET(req: Request) {
  let user;
  try {
    user = requireAuth(req);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const whereClause: any = {};

  if (user.role === "TEACHER") {
    whereClause.teacherId = user.id;
  }

  if (user.role === "STUDENT") {
    whereClause.studentId = user.id;
  }

  try {
    // uzimamo ocene zajedno sa ucenikom, nastavnikom, predmetom i odeljenjem
    const grades = await prisma.grade.findMany({
      where: whereClause,
      include: {
        student: {
          select: {
            id: true,
            full_name: true,
          },
        },
        teacher: {
          select: {
            id: true,
            full_name: true,
          },
        },
        subject: true,
        classroom: true,
      },
      orderBy: {
        date: "desc",
      },
    });

    return NextResponse.json(grades);
  } catch (error) {
    return NextResponse.json(
      { error: `Neuspešno učitavanje ocena: ${error}` },
      { status: 500 }
    );
  }
}

/**
 * POST /api/grades
 *
 * kreira novu ocenu
 *  - ADMIN   i   TEACHER mogu da dodaju ocene
 *  - STUDENT nema pravo upisa
 *
 * teacherId se ne salje iz frontenda vec se uvek uzima iz JWT tokena
 * (ulogovani nastavnik / administrator)
 */
export async function POST(req: Request) {
  let user;
  try {
    user = requireAuth(req);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (user.role === "STUDENT") {
    return NextResponse.json(
      { error: "Učenicima nije dozvoljeno da dodaju ocene" },
      { status: 403 }
    );
  }

  try {
    // citamo JSON telo zahteva (ocena + ID-jevi vezanih entiteta)
    const body = await req.json();
    const { value, comment, studentId, subjectId, classroomId } = body;

    // osnovna validacija
    if (
      !value ||
      value < 1 ||
      value > 5 ||
      !studentId ||
      !subjectId ||
      !classroomId
    ) {
      return NextResponse.json(
        { error: "Neispravni podaci za ocenu" },
        { status: 400 }
      );
    }

    // nastavnik (ili admin) unosi ocenu; teacherId uzimamo iz tokena
    const teacherId = user.id;

    const grade = await prisma.grade.create({
      data: {
        value,
        comment,
        studentId,
        teacherId,
        subjectId,
        classroomId,
      },
    });

    return NextResponse.json(grade, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: `Neuspešno kreiranje ocene: ${error}` },
      { status: 500 }
    );
  }
}
