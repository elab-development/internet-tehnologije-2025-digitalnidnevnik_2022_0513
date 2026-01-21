import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth/requireAuth";

/**
 * PATCH /api/admin/classrooms/[id]
 *
 * menja razrednog staresinu za dato odeljenje (homeroomTeacherId)
 * UNIQUE na koloni govori da jedan nastavnik moze biti
 * razredni staresina najvise jednog odeljenja
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
      { error: "Samo administratori mogu da menjaju odeljenja" },
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

  const classroomId = Number(rawId);
  if (Number.isNaN(classroomId)) {
    return NextResponse.json(
      { error: `Neispravan ID odeljenja: '${rawId}'` },
      { status: 400 }
    );
  }

  try {
    const body = await req.json();
    const { homeroomTeacherId } = body as { homeroomTeacherId: number | null };

    await prisma.classroom.update({
      where: { id: classroomId },
      data: { homeroomTeacherId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    // ako postoji UNIQUE na homeroomTeacherId

    const message =
      error instanceof Error ? error.message : String(error ?? "unknown");

    if (message.includes("homeroomTeacherId")) {
      return NextResponse.json(
        {
          error: "Jedan nastavnik može biti starešina samo jednog odeljenja.",
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: `Neuspešna izmena odeljenja: ${message}` },
      { status: 500 }
    );
  }
}
