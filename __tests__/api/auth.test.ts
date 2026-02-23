import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock Prisma
vi.mock("@/lib/prisma", () => ({
  default: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },
}));

// Mock bcrypt
vi.mock("bcryptjs", () => ({
  default: {
    hash: vi.fn().mockResolvedValue("hashed_password"),
    compare: vi.fn(),
  },
}));

// Mock JWT
vi.mock("@/lib/auth/jwt", () => ({
  signToken: vi.fn().mockReturnValue("mock_jwt_token"),
  verifyToken: vi.fn(),
}));

import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

describe("Auth API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("POST /api/auth/login", () => {
    it("treba da vrati 401 za nepostojeceg korisnika", async () => {
      // Arrange
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

      const mockRequest = {
        json: vi.fn().mockResolvedValue({
          username: "nepostojeci",
          password: "password123",
        }),
      } as unknown as Request;

      // Act
      const { POST } = await import("@/app/api/auth/login/route");
      const response = await POST(mockRequest);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(401);
      expect(data.error).toBe("Neispravno korisničko ime ili lozinka");
    });

    it("treba da vrati 401 za pogresnu lozinku", async () => {
      // Arrange
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: 1,
        username: "test",
        password: "hashed_password",
        role: "STUDENT",
        full_name: "Test User",
        classroomId: null,
      });
      vi.mocked(bcrypt.compare).mockResolvedValue(false as never);

      const mockRequest = {
        json: vi.fn().mockResolvedValue({
          username: "test",
          password: "pogresna_lozinka",
        }),
      } as unknown as Request;

      // Act
      const { POST } = await import("@/app/api/auth/login/route");
      const response = await POST(mockRequest);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(401);
      expect(data.error).toBe("Neispravno korisničko ime ili lozinka");
    });

    it("treba da vrati token za ispravne kredencijale", async () => {
      // Arrange
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: 1,
        username: "test",
        password: "hashed_password",
        role: "STUDENT",
        full_name: "Test User",
        classroomId: null,
      });
      vi.mocked(bcrypt.compare).mockResolvedValue(true as never);

      const mockRequest = {
        json: vi.fn().mockResolvedValue({
          username: "test",
          password: "ispravna_lozinka",
        }),
      } as unknown as Request;

      // Act
      const { POST } = await import("@/app/api/auth/login/route");
      const response = await POST(mockRequest);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(data.token).toBe("mock_jwt_token");
      expect(data.user.username).toBe("test");
      expect(data.user.role).toBe("STUDENT");
    });
  });

  describe("POST /api/auth/register", () => {
    it("treba da vrati 400 ako nedostaju obavezna polja", async () => {
      // Arrange
      const mockRequest = {
        json: vi.fn().mockResolvedValue({
          username: "test",
          // nedostaje password i role
        }),
      } as unknown as Request;

      // Act
      const { POST } = await import("@/app/api/auth/register/route");
      const response = await POST(mockRequest);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(400);
      expect(data.error).toBe("Nedostaju obavezna polja");
    });

    it("treba da kreira novog korisnika", async () => {
      // Arrange
      vi.mocked(prisma.user.create).mockResolvedValue({
        id: 1,
        username: "novi_korisnik",
        password: "hashed_password",
        role: "STUDENT",
        full_name: null,
        classroomId: null,
      });

      const mockRequest = {
        json: vi.fn().mockResolvedValue({
          username: "novi_korisnik",
          password: "password123",
          role: "STUDENT",
        }),
      } as unknown as Request;

      // Act
      const { POST } = await import("@/app/api/auth/register/route");
      const response = await POST(mockRequest);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(201);
      expect(data.username).toBe("novi_korisnik");
    });
  });
});
