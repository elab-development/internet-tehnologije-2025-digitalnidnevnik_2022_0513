/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth/requireAuth";

/**
 * GET /api/assignments
 *
 * vraca listu zadataka (Assignment) filtriranu po ulozi korisnika
 *  - ADMIN   vidi sve zadatke
 *  - TEACHER vidi samo zadatke koje je on kreirao
 *  - STUDENT vidi zadatke za svoje odeljenje
 */
export async function GET(req: Request) {
  let user;
  try {
    user = requireAuth(req);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const where: any = {};

  if (user.role === "TEACHER") {
    // nastavnik vidi samo svoje zadatke
    where.teacherId = user.id;
  }

  if (user.role === "STUDENT") {
    // student vidi zadatke za svoje odeljenje (classroom)
    try {
      const dbUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: { classroomId: true },
      });

      if (!dbUser?.classroomId) {
        // ako ucenik nije dodeljen ni jednom odeljenju - nema zadataka
        return NextResponse.json([]);
      }

      where.classroomId = dbUser.classroomId;
    } catch (error) {
      return NextResponse.json(
        { error: `Neuspešno učitavanje zadataka za učenika: ${error}` },
        { status: 500 },
      );
    }
  }

  try {
    // uzimamo zadatke zajedno sa predmetom, odeljenjem i nastavnikom koji ih je kreirao
    const assignments = await prisma.assignment.findMany({
      where,
      include: {
        subject: {
          select: {
            id: true,
            name: true,
          },
        },
        classroom: {
          select: {
            id: true,
            name: true,
          },
        },
        teacher: {
          select: {
            id: true,
            full_name: true,
            username: true,
          },
        },
      },
      orderBy: {
        dueDate: "asc",
      },
    });

    return NextResponse.json(assignments);
  } catch (error) {
    return NextResponse.json(
      { error: `Neuspešno učitavanje zadataka: ${error}` },
      { status: 500 },
    );
  }
}

/**
 * POST /api/assignments
 *
 * kreira novi zadatak (Assignment)
 *  - ADMIN   i TEACHER mogu da kreiraju zadatke
 *  - STUDENT nema pravo upisa
 *
 * Nastavniku (TEACHER) se teacherId uvek uzima iz tokena,
 * dok ADMIN moze da prosledi teacherId eksplicitno u telu zahteva
 */
/**
 * DELETE /api/assignments?id=...
 *
 * brise postojeci zadatak
 *  - TEACHER moze da brise SAMO svoje zadatke
 *  - ADMIN moze da brise bilo koji zadatak
 */
export async function DELETE(req: Request) {
  let user;
  try {
    user = requireAuth(req);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (user.role === "STUDENT") {
    return NextResponse.json(
      { error: "Učenicima nije dozvoljeno da brišu zadatke" },
      { status: 403 },
    );
  }

  const url = new URL(req.url);
  const idParam = url.searchParams.get("id");

  if (!idParam) {
    return NextResponse.json(
      { error: "Parametar 'id' je obavezan" },
      { status: 400 },
    );
  }

  const assignmentId = Number(idParam);
  if (Number.isNaN(assignmentId)) {
    return NextResponse.json(
      { error: `Neispravan ID zadatka: '${idParam}'` },
      { status: 400 },
    );
  }

  try {
    // prvo pronalazimo zadatak kako bismo proverili da li nastavnik ima pravo da ga obrise
    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
      select: { teacherId: true },
    });

    if (!assignment) {
      return NextResponse.json(
        { error: "Zadatak nije pronađen" },
        { status: 404 },
      );
    }

    if (user.role === "TEACHER" && assignment.teacherId !== user.id) {
      return NextResponse.json(
        { error: "Nemate pravo da obrišete ovaj zadatak" },
        { status: 403 },
      );
    }

    await prisma.assignment.delete({ where: { id: assignmentId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: `Neuspešno brisanje zadatka: ${error}` },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  let user;
  try {
    user = requireAuth(req);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (user.role === "STUDENT") {
    return NextResponse.json(
      { error: "Učenicima nije dozvoljeno da kreiraju zadatke" },
      { status: 403 },
    );
  }

  try {
    // citamo JSON telo zahteva (osnovni podaci o zadatku + veze)
    const body = await req.json();
    const {
      title,
      description,
      dueDate,
      subjectId,
      classroomId,
      teacherId: teacherIdFromBody,
    } = body;

    // osnovna validacija ulaza
    if (!title || !dueDate || !subjectId || !classroomId) {
      return NextResponse.json(
        { error: "Nedostaju obavezna polja za zadatak" },
        { status: 400 },
      );
    }

    let teacherId: number;

    if (user.role === "TEACHER") {
      // nastavnik uvek kreira zadatke u svoje ime
      teacherId = user.id;
    } else {
      // ADMIN mora eksplicitno da navede nastavnika kome zadatak pripada
      if (!teacherIdFromBody) {
        return NextResponse.json(
          { error: "teacherId je obavezan kada administrator kreira zadatak" },
          { status: 400 },
        );
      }
      teacherId = teacherIdFromBody;
    }

    const assignment = await prisma.assignment.create({
      data: {
        title,
        description,
        dueDate: new Date(dueDate),
        subjectId,
        classroomId,
        teacherId,
      },
      // vracamo i povezane entitete kako bi frontend odmah imao sve podatke
      include: {
        subject: {
          select: {
            id: true,
            name: true,
          },
        },
        classroom: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json(assignment, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: `Neuspešno kreiranje zadatka: ${error}` },
      { status: 500 },
    );
  }
}
