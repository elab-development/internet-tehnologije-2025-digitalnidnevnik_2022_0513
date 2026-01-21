/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth/requireAuth";

/**
 * PATCH /api/admin/users/[id]
 *
 * menja podatke o korisniku (uloga/rola, ime i prezime, odeljenje)
 * prima samo polja koja treba izmeniti i gradi dinamicki update objekat
 */
export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  let user;
  try {
    user = requireAuth(req);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (user.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Samo administratori mogu da menjaju korisnike" },
      { status: 403 }
    );
  }

  // probaj da procitas ID iz params, a ako ne postoji, fallback na poslednji segment URL-a
  const { id } = await context.params;
  let rawId = id;
  if (!rawId) {
    try {
      const url = new URL(req.url);
      const segments = url.pathname.split("/").filter(Boolean);
      rawId = segments[segments.length - 1];
    } catch {
      rawId = undefined as unknown as string;
    }
  }

  const userId = Number(rawId);
  if (Number.isNaN(userId)) {
    return NextResponse.json(
      { error: `Neispravan ID korisnika: '${rawId}'` },
      { status: 400 }
    );
  }

  try {
    const body = await req.json();
    const { role, full_name, classroomId } = body as {
      role?: string;
      full_name?: string;
      classroomId?: number | null;
    };

    // priprema objekta sa poljima koje treba menjati
    const data: any = {};

    if (role) {
      if (!["ADMIN", "TEACHER", "STUDENT"].includes(role)) {
        return NextResponse.json(
          { error: "Neispravna uloga" },
          { status: 400 }
        );
      }
      data.role = role;
    }

    if (typeof full_name === "string") {
      data.full_name = full_name;
    }

    if (typeof classroomId === "number" || classroomId === null) {
      data.classroomId = classroomId;
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        { error: "Nema promena za korisnika" },
        { status: 400 }
      );
    }

    await prisma.user.update({
      where: { id: userId },
      data,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: `Neuspešna izmena korisnika: ${error}` },
      { status: 500 }
    );
  }
}
