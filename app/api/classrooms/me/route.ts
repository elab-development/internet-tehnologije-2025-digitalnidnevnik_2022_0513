import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth/requireAuth";

/**
 * GET /api/classrooms/me
 *
 * vracaa odeljenje u koje je ulogovani ucenik upisan,
 * zajedno sa spiskom vrsnjaka (ucenika u istom odeljenju)
 * i razrednim staresinom.
 */
export async function GET(req: Request) {
  let user;
  try {
    user = requireAuth(req);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (user.role !== "STUDENT") {
    return NextResponse.json(
      { error: "Samo učenici mogu da pristupe svom odeljenju" },
      { status: 403 },
    );
  }

  try {
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        classroom: {
          select: {
            id: true,
            name: true,
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
        },
      },
    });

    if (!dbUser || !dbUser.classroom) {
      return NextResponse.json(
        { error: "Učenik trenutno nije dodeljen ni jednom odeljenju" },
        { status: 404 },
      );
    }

    // vracamo samo podatke o odeljenju sa ucenicima i razrednim staresinom
    return NextResponse.json(dbUser.classroom);
  } catch (error) {
    return NextResponse.json(
      { error: `Neuspešno učitavanje odeljenja učenika: ${error}` },
      { status: 500 },
    );
  }
}
