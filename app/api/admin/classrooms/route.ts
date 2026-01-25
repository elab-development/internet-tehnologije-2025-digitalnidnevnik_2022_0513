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
      { status: 403 },
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
      { status: 500 },
    );
  }
}

/**
 * POST /api/admin/classrooms
 *
 * kreira novo odeljenje (samo naziv)
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
      { error: "Samo administratori mogu da kreiraju odeljenja" },
      { status: 403 },
    );
  }

  try {
    const body = await req.json();
    const { name } = body as { name?: string };

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: "Naziv odeljenja je obavezan" },
        { status: 400 },
      );
    }

    const trimmedName = name.trim();

    const existing = await prisma.classroom.findUnique({
      where: { name: trimmedName },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Odeljenje sa tim nazivom već postoji" },
        { status: 400 },
      );
    }

    let classroom;
    try {
      // prepustamo bazi da dodeli ID
      classroom = await prisma.classroom.create({
        data: { name: trimmedName },
      });
    } catch (error: any) {
      // ako je sekvenca za ID pokvarena
      // fallback je da sami izracunamo sledeci ID (max(id) + 1)
      if (error?.code === "P2002") {
        const last = await prisma.classroom.findFirst({
          orderBy: { id: "desc" },
        });
        const nextId = (last?.id ?? 0) + 1;
        classroom = await prisma.classroom.create({
          data: { id: nextId, name: trimmedName },
        });
      } else {
        throw error;
      }
    }

    return NextResponse.json(
      {
        id: classroom.id,
        name: classroom.name,
        homeroomTeacher: null,
        homeroomTeacherId: classroom.homeroomTeacherId,
        studentsCount: 0,
      },
      { status: 201 },
    );
  } catch (error) {
    return NextResponse.json(
      { error: `Neuspešno kreiranje odeljenja: ${error}` },
      { status: 500 },
    );
  }
}
