import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// get
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const role = searchParams.get("role");
    const userId = searchParams.get("userId");

    if (!role) {
      return NextResponse.json({ error: "Role is required" }, { status: 400 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const whereClause: any = {};

    if (role === "TEACHER") {
      if (!userId) {
        return NextResponse.json(
          { error: "userId is required for TEACHER" },
          { status: 400 }
        );
      }
      whereClause.teacherId = Number(userId);
    }

    if (role === "STUDENT") {
      if (!userId) {
        return NextResponse.json(
          { error: "userId is required for STUDENT" },
          { status: 400 }
        );
      }
      whereClause.studentId = Number(userId);
    }

    // ADMIN - nema filtera

    const grades = await prisma.grade.findMany({
      where: whereClause,
      include: {
        student: {
          select: { id: true, full_name: true },
        },
        teacher: {
          select: { id: true, full_name: true },
        },
        subject: true,
        classroom: true,
      },
      orderBy: { date: "desc" },
    });

    return NextResponse.json(grades);
  } catch (error) {
    return NextResponse.json(
      { error: `Failed to fetch grades: ${error}` },
      { status: 500 }
    );
  }
}

// post
export async function POST(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const role = searchParams.get("role");
    const userId = searchParams.get("userId");

    if (!role) {
      return NextResponse.json({ error: "Role is required" }, { status: 400 });
    }

    // student ne sme da doda ocenu
    if (role === "STUDENT") {
      return NextResponse.json(
        { error: "Students are not allowed to add grades" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { value, comment, studentId, teacherId, subjectId, classroomId } =
      body;

    // osnovna validacija
    if (
      !value ||
      value < 1 ||
      value > 5 ||
      !studentId ||
      !teacherId ||
      !subjectId ||
      !classroomId
    ) {
      return NextResponse.json(
        { error: "Invalid grade data" },
        { status: 400 }
      );
    }

    // nastavnik sme sme da unosi samo svoje ocene
    if (role === "TEACHER" && Number(userId) !== teacherId) {
      return NextResponse.json(
        { error: "Teacher can only assign their own grades" },
        { status: 403 }
      );
    }

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
      { error: `Failed to create grade: ${error}` },
      { status: 500 }
    );
  }
}
