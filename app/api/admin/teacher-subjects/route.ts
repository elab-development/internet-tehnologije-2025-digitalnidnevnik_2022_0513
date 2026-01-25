import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth/requireAuth";

/**
 * GET /api/admin/teacher-subjects
 *
 * vraca listu veza nastavnik–predmet–odeljenje
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
      { error: "Samo administratori mogu da pristupe ovim podacima" },
      { status: 403 },
    );
  }

  try {
    const links = await prisma.teacherSubjectClassroom.findMany({
      include: {
        teacher: true,
        subject: true,
        classroom: true,
      },
      orderBy: [
        { teacher: { full_name: "asc" } },
        { subject: { name: "asc" } },
        { classroom: { name: "asc" } },
      ],
    });

    const result = links.map((l) => ({
      id: l.id,
      teacherId: l.teacherId,
      subjectId: l.subjectId,
      classroomId: l.classroomId,
      teacherLabel: l.teacher.full_name ?? l.teacher.username,
      subjectName: l.subject.name,
      classroomName: l.classroom.name,
    }));

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        error: `Neuspešno učitavanje veza nastavnik–predmet–odeljenje: ${error}`,
      },
      { status: 500 },
    );
  }
}

/**
 * POST /api/admin/teacher-subjects
 *
 * kreira novu vezu nastavnik–predmet–odeljenje
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
      { error: "Samo administratori mogu da menjaju ove veze" },
      { status: 403 },
    );
  }

  try {
    const body = await req.json();
    const { teacherId, subjectId, classroomId } = body as {
      teacherId?: number;
      subjectId?: number;
      classroomId?: number;
    };

    if (!teacherId || !subjectId || !classroomId) {
      return NextResponse.json(
        { error: "teacherId, subjectId i classroomId su obavezni" },
        { status: 400 },
      );
    }

    // opcionalno: spreci duplikate iste kombinacije
    const existing = await prisma.teacherSubjectClassroom.findFirst({
      where: { teacherId, subjectId, classroomId },
    });
    if (existing) {
      return NextResponse.json(
        { error: "Ova veza nastavnik–predmet–odeljenje već postoji" },
        { status: 400 },
      );
    }

    const created = await prisma.teacherSubjectClassroom.create({
      data: { teacherId, subjectId, classroomId },
      include: {
        teacher: true,
        subject: true,
        classroom: true,
      },
    });

    return NextResponse.json(
      {
        id: created.id,
        teacherId: created.teacherId,
        subjectId: created.subjectId,
        classroomId: created.classroomId,
        teacherLabel: created.teacher.full_name ?? created.teacher.username,
        subjectName: created.subject.name,
        classroomName: created.classroom.name,
      },
      { status: 201 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        error: `Neuspešno kreiranje veze nastavnik–predmet–odeljenje: ${error}`,
      },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/admin/teacher-subjects?id=ID
 */
export async function DELETE(req: Request) {
  let user;
  try {
    user = requireAuth(req);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (user.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Samo administratori mogu da brišu ove veze" },
      { status: 403 },
    );
  }

  const url = new URL(req.url);
  const idParam = url.searchParams.get("id");
  const linkId = idParam ? Number(idParam) : NaN;

  if (!idParam || Number.isNaN(linkId)) {
    return NextResponse.json({ error: "Neispravan ID veze" }, { status: 400 });
  }

  try {
    await prisma.teacherSubjectClassroom.delete({ where: { id: linkId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      {
        error: `Neuspešno brisanje veze nastavnik–predmet–odeljenje: ${error}`,
      },
      { status: 500 },
    );
  }
}
