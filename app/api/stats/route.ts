import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth/requireAuth";
export async function GET(req: Request) {
  let user;
  try {
    user = requireAuth(req);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // filtriramo ocene u zavisnosti od uloge
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const whereClause: any = {};

    if (user.role === "STUDENT") {
      whereClause.studentId = user.id;
    } else if (user.role === "TEACHER") {
      whereClause.teacherId = user.id;
    }
    // ADMIN vidi sve ocene

    // uzimamo sve relevantne ocene sa predmetima
    const grades = await prisma.grade.findMany({
      where: whereClause,
      include: {
        subject: true,
      },
      orderBy: {
        date: "asc",
      },
    });

    // prosek ocena po predmetima
    const subjectMap = new Map<string, { total: number; count: number }>();
    for (const grade of grades) {
      const subjectName = grade.subject.name;
      if (!subjectMap.has(subjectName)) {
        subjectMap.set(subjectName, { total: 0, count: 0 });
      }
      const entry = subjectMap.get(subjectName)!;
      entry.total += grade.value;
      entry.count += 1;
    }

    const bySubject = Array.from(subjectMap.entries()).map(
      ([subject, data]) => ({
        subject,
        average: Math.round((data.total / data.count) * 100) / 100,
        count: data.count,
      }),
    );

    // distribucija ocena
    const distributionMap = new Map<number, number>();
    for (let i = 1; i <= 5; i++) {
      distributionMap.set(i, 0);
    }
    for (const grade of grades) {
      distributionMap.set(
        grade.value,
        (distributionMap.get(grade.value) || 0) + 1,
      );
    }

    const distribution = Array.from(distributionMap.entries()).map(
      ([grade, count]) => ({
        grade,
        count,
        name: getGradeName(grade),
      }),
    );

    // trend ocena po mesecima
    const trendMap = new Map<string, { total: number; count: number }>();
    for (const grade of grades) {
      const date = new Date(grade.date);
      const monthKey = `${date.getFullYear()}-${String(
        date.getMonth() + 1,
      ).padStart(2, "0")}`;
      if (!trendMap.has(monthKey)) {
        trendMap.set(monthKey, { total: 0, count: 0 });
      }
      const entry = trendMap.get(monthKey)!;
      entry.total += grade.value;
      entry.count += 1;
    }

    const trend = Array.from(trendMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, data]) => ({
        month: formatMonth(month),
        average: Math.round((data.total / data.count) * 100) / 100,
        count: data.count,
      }));

    // ukupna statistika
    const totalCount = grades.length;
    const totalSum = grades.reduce((sum, g) => sum + g.value, 0);
    const overallAverage =
      totalCount > 0 ? Math.round((totalSum / totalCount) * 100) / 100 : 0;

    return NextResponse.json({
      bySubject,
      distribution,
      trend,
      summary: {
        totalGrades: totalCount,
        overallAverage,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: `Greška pri učitavanju statistike: ${error}` },
      { status: 500 },
    );
  }
}

function getGradeName(grade: number): string {
  const names: Record<number, string> = {
    1: "Nedovoljan",
    2: "Dovoljan",
    3: "Dobar",
    4: "Vrlo dobar",
    5: "Odličan",
  };
  return names[grade] || String(grade);
}

function formatMonth(monthKey: string): string {
  const [year, month] = monthKey.split("-");
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "Maj",
    "Jun",
    "Jul",
    "Avg",
    "Sep",
    "Okt",
    "Nov",
    "Dec",
  ];
  return `${monthNames[parseInt(month) - 1]} ${year}`;
}
