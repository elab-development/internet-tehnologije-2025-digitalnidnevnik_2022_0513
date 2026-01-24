import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth/requireAuth";

/**
 * GET /api/me
 *
 * Vraca osnovne podatke o trenutno ulogovanom korisniku + detektovanu IP adresu.
 */
export async function GET(req: Request) {
  let jwtUser;
  try {
    jwtUser = requireAuth(req);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: jwtUser.id },
      include: {
        classroom: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Korisnik nije pronađen" },
        { status: 404 },
      );
    }

    // force izvlacenje IP adrese iz HTTP headera
    const forwarded = req.headers.get("x-forwarded-for");
    const ipFromForwarded = forwarded?.split(",")[0].trim();
    const ip =
      ipFromForwarded ||
      req.headers.get("x-real-ip") ||
      req.headers.get("x-forwarded-host") ||
      req.headers.get("host") ||
      "unknown";

    return NextResponse.json({
      id: user.id,
      username: user.username,
      full_name: user.full_name,
      role: user.role,
      classroom: user.classroom,
      ip,
    });
  } catch (error) {
    return NextResponse.json(
      { error: `Neuspešno učitavanje profila: ${error}` },
      { status: 500 },
    );
  }
}
