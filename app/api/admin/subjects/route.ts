import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth/requireAuth";

/**
 * GET /api/admin/subjects
 *
 * vraca listu svih predmeta za admin panel
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
      { error: "Samo administratori mogu da pristupe predmetima" },
      { status: 403 },
    );
  }

  try {
    const subjects = await prisma.subject.findMany({
      orderBy: { name: "asc" },
    });
    return NextResponse.json(subjects);
  } catch (error) {
    return NextResponse.json(
      { error: `Neuspešno učitavanje predmeta: ${error}` },
      { status: 500 },
    );
  }
}

/**
 * POST /api/admin/subjects
 *
 * kreira novi predmet
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
      { error: "Samo administratori mogu da kreiraju predmete" },
      { status: 403 },
    );
  }

  try {
    const body = await req.json();
    const { name } = body as { name?: string };

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: "Naziv predmeta je obavezan" },
        { status: 400 },
      );
    }

    const trimmedName = name.trim();

    // eksplicitno proveravamo da li predmet vec postoji
    const existing = await prisma.subject.findUnique({
      where: { name: trimmedName },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Predmet sa tim nazivom već postoji" },
        { status: 400 },
      );
    }

    const subject = await prisma.subject.create({
      data: { name: trimmedName },
    });

    return NextResponse.json(subject, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: `Neuspešno kreiranje predmeta: ${error}` },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/admin/subjects?id=ID
 *
 * brise predmet po ID-u, ukoliko nema zavisnosti
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
      { error: "Samo administratori mogu da brišu predmete" },
      { status: 403 },
    );
  }

  const url = new URL(req.url);
  const idParam = url.searchParams.get("id");
  const subjectId = idParam ? Number(idParam) : NaN;

  if (!idParam || Number.isNaN(subjectId)) {
    return NextResponse.json(
      { error: "Neispravan ID predmeta" },
      { status: 400 },
    );
  }

  try {
    await prisma.subject.delete({ where: { id: subjectId } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      {
        error:
          "Brisanje predmeta nije uspelo. Proverite da li predmet ima povezane ocene ili zadatke.",
      },
      { status: 400 },
    );
  }
}
