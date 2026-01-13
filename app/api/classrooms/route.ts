import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const classrooms = await prisma.classroom.findMany({
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json(classrooms);
  } catch (error) {
    //console.error("GET /api/classrooms error:", error);
    return NextResponse.json(
      { error: `Failed to fetch classrooms: ${error}` },
      { status: 500 }
    );
  }
}
