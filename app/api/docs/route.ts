import { NextResponse } from "next/server";
import { swaggerSpec } from "@/lib/swagger";

/**
 * GET /api/docs
 *
 * vraca OpenAPI/Swagger specifikaciju u JSON formatu
 */
export async function GET() {
  return NextResponse.json(swaggerSpec);
}
