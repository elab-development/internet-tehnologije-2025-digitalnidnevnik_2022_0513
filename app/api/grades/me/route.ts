import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth/requireAuth";

/**
 * GET /api/grades/me
 *
 * vraca ocene za trenutno ulogovanog ucenika
 * grupisane po predmetima u formatu:
 *  [{ subject: string, grades: number[] }].
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
      { error: "Samo učenici mogu da vide svoje ocene" },
      { status: 403 }
    );
  }

  try {
    // sve ocene za ulogovanog ucenika, zajedno sa imenom predmeta
    const grades = await prisma.grade.findMany({
      where: { studentId: user.id },
      include: {
        subject: {
          select: { name: true },
        },
      },
      orderBy: {
        date: "desc",
      },
    });

    const grouped: Record<string, number[]> = {};

    for (const g of grades) {
      const subjectName = g.subject.name;
      if (!grouped[subjectName]) {
        grouped[subjectName] = [];
      }
      grouped[subjectName].push(g.value);
    }

    const result = Object.entries(grouped).map(([subject, grades]) => ({
      subject,
      grades,
    }));

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: `Neuspešno učitavanje ocena: ${error}` },
      { status: 500 }
    );
  }
}
