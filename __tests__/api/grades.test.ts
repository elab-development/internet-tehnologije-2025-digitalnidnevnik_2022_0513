import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock Prisma
vi.mock("@/lib/prisma", () => ({
  default: {
    grade: {
      findMany: vi.fn(),
      create: vi.fn(),
    },
  },
}));

// Mock requireAuth
vi.mock("@/lib/auth/requireAuth", () => ({
  requireAuth: vi.fn(),
}));

import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth/requireAuth";

describe("Grades API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("GET /api/grades", () => {
    it("treba da vrati 401 za neautentifikovanog korisnika", async () => {
      // Arrange
      vi.mocked(requireAuth).mockImplementation(() => {
        throw new Error("Unauthorized");
      });

      const mockRequest = {
        headers: new Headers(),
      } as unknown as Request;

      // Act
      const { GET } = await import("@/app/api/grades/route");
      const response = await GET(mockRequest);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(401);
      expect(data.error).toBe("Unauthorized");
    });

    it("treba da vrati sve ocene za ADMIN korisnika", async () => {
      // Arrange
      vi.mocked(requireAuth).mockReturnValue({ id: 1, role: "ADMIN" });
      vi.mocked(prisma.grade.findMany).mockResolvedValue([
        {
          id: 1,
          value: 5,
          comment: "Odlicno",
          date: new Date(),
          studentId: 2,
          teacherId: 3,
          subjectId: 1,
          classroomId: 1,
        },
      ]);

      const mockRequest = {
        headers: new Headers({ Authorization: "Bearer token" }),
      } as unknown as Request;

      // Act
      const { GET } = await import("@/app/api/grades/route");
      const response = await GET(mockRequest);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(data).toHaveLength(1);
      expect(data[0].value).toBe(5);
    });

    it("treba da filtrira ocene za STUDENT korisnika", async () => {
      // Arrange
      const studentId = 5;
      vi.mocked(requireAuth).mockReturnValue({
        id: studentId,
        role: "STUDENT",
      });
      vi.mocked(prisma.grade.findMany).mockResolvedValue([]);

      const mockRequest = {
        headers: new Headers({ Authorization: "Bearer token" }),
      } as unknown as Request;

      // Act
      const { GET } = await import("@/app/api/grades/route");
      await GET(mockRequest);

      // Assert - provera da li je findMany pozvan sa studentId filterom
      expect(prisma.grade.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { studentId },
        }),
      );
    });
  });

  describe("POST /api/grades", () => {
    it("treba da vrati 403 za STUDENT korisnika", async () => {
      // Arrange
      vi.mocked(requireAuth).mockReturnValue({ id: 1, role: "STUDENT" });

      const mockRequest = {
        headers: new Headers({ Authorization: "Bearer token" }),
        json: vi.fn().mockResolvedValue({
          value: 5,
          studentId: 2,
          subjectId: 1,
          classroomId: 1,
        }),
      } as unknown as Request;

      // Act
      const { POST } = await import("@/app/api/grades/route");
      const response = await POST(mockRequest);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(403);
      expect(data.error).toBe("Učenicima nije dozvoljeno da dodaju ocene");
    });

    it("treba da kreira ocenu za TEACHER korisnika", async () => {
      // Arrange
      const teacherId = 3;
      vi.mocked(requireAuth).mockReturnValue({
        id: teacherId,
        role: "TEACHER",
      });
      vi.mocked(prisma.grade.create).mockResolvedValue({
        id: 1,
        value: 5,
        comment: null,
        date: new Date(),
        studentId: 2,
        teacherId: teacherId,
        subjectId: 1,
        classroomId: 1,
      });

      const mockRequest = {
        headers: new Headers({ Authorization: "Bearer token" }),
        json: vi.fn().mockResolvedValue({
          value: 5,
          studentId: 2,
          subjectId: 1,
          classroomId: 1,
        }),
      } as unknown as Request;

      // Act
      const { POST } = await import("@/app/api/grades/route");
      const response = await POST(mockRequest);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(201);
      expect(data.value).toBe(5);
      expect(data.teacherId).toBe(teacherId);
    });

    it("treba da vrati 400 za nevalidnu ocenu", async () => {
      // Arrange
      vi.mocked(requireAuth).mockReturnValue({ id: 1, role: "TEACHER" });

      const mockRequest = {
        headers: new Headers({ Authorization: "Bearer token" }),
        json: vi.fn().mockResolvedValue({
          value: 6, // nevalidna ocena (mora biti 1-5)
          studentId: 2,
          subjectId: 1,
          classroomId: 1,
        }),
      } as unknown as Request;

      // Act
      const { POST } = await import("@/app/api/grades/route");
      const response = await POST(mockRequest);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(400);
      expect(data.error).toBe("Neispravni podaci za ocenu");
    });
  });
});
