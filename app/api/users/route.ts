import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      include: {
        classroom: true,
      },
      orderBy: {
        id: "asc",
      },
    });

    return NextResponse.json(users);
  } catch (error) {
    //console.error("GET /api/users error:", error);
    return NextResponse.json(
      { error: `Neuspešno učitavanje korisnika: ${error}` },
      { status: 500 }
    );
  }
}
