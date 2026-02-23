/**
 * SWAGGER.TS - OpenAPI 3.0 Specifikacija za eDnevnik API
 * - JSON format: GET /api/docs
 * - Swagger UI: /docs stranica
 *
 * INFO - osnovne informacije o API-ju (naziv, verzija, opis)
 *
 * TAGS - Grupacija endpoint-a po kategorijama
 *    - Auth: login, register
 *    - Users: Upravljanje korisnicima (ADMIN)
 *    - Grades: Upravljanje ocenama
 *    - Classrooms: Upravljanje odeljenjima
 *    - Assignments: Upravljanje zadacima
 *    - Stats: Statistika i analitika
 *
 * PATHS - Definicija svih API endpoint-a sa:
 *    - HTTP metodama (GET, POST, PATCH, DELETE)
 *    - Request body semama
 *    - Response semama
 *    - Security zahtevima (Bearer token)
 *
 * COMPONENTS - Reusable seme i security definicije
 *    - Schemas: User, Grade, Classroom, Assignment, Error
 *    - SecuritySchemes: Bearer JWT autentifikacija
 */
export const swaggerSpec = {
  openapi: "3.0.0",
  info: {
    title: "eDnevnik API",
    version: "1.0.0",
    description: `
API za digitalni učenički dnevnik.

## Autentifikacija
API koristi JWT (JSON Web Token) za autentifikaciju. Token se dobija putem /api/auth/login endpointa i šalje se u Authorization header-u:

\`Authorization: Bearer <token>\`

## Tipovi korisnika
- **ADMIN** - Administrator sistema, ima pristup svim funkcionalnostima
- **TEACHER** - Nastavnik, može da unosi ocene i upravlja zadacima
- **STUDENT** - Učenik, može da vidi svoje ocene i zadatke
    `,
    contact: {
      name: "eDnevnik Tim",
      email: "support@ednevnik.rs",
    },
  },
  servers: [
    {
      url: "http://localhost:3000",
      description: "Development server",
    },
    {
      url: "https://ednevnik.vercel.app",
      description: "Production server",
    },
  ],
  tags: [
    { name: "Auth", description: "Autentifikacija korisnika" },
    { name: "Users", description: "Upravljanje korisnicima (Admin)" },
    { name: "Grades", description: "Upravljanje ocenama" },
    { name: "Classrooms", description: "Upravljanje odeljenjima" },
    { name: "Assignments", description: "Upravljanje zadacima" },
    { name: "Stats", description: "Statistika i analitika" },
  ],
  paths: {
    "/api/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Prijava korisnika",
        description: "Autentifikuje korisnika i vraća JWT token",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["username", "password"],
                properties: {
                  username: {
                    type: "string",
                    example: "marko",
                  },
                  password: {
                    type: "string",
                    example: "password123",
                  },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Uspešna prijava",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    token: { type: "string" },
                    user: {
                      type: "object",
                      properties: {
                        id: { type: "integer" },
                        username: { type: "string" },
                        role: {
                          type: "string",
                          enum: ["ADMIN", "TEACHER", "STUDENT"],
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          "401": {
            description: "Neispravni kredencijali",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
    "/api/auth/register": {
      post: {
        tags: ["Auth"],
        summary: "Registracija korisnika",
        description:
          "Kreira novog korisnika (koristi se za inicijalno popunjavanje baze)",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["username", "password", "role"],
                properties: {
                  username: { type: "string" },
                  password: { type: "string" },
                  role: {
                    type: "string",
                    enum: ["ADMIN", "TEACHER", "STUDENT"],
                  },
                },
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Korisnik kreiran",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/User" },
              },
            },
          },
          "400": {
            description: "Nedostaju obavezna polja",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
    "/api/grades": {
      get: {
        tags: ["Grades"],
        summary: "Izvuci ocene",
        description: "Vraća listu ocena filtriranu po ulozi korisnika",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "Lista ocena",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/Grade" },
                },
              },
            },
          },
          "401": {
            description: "Neautorizovan pristup",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
      post: {
        tags: ["Grades"],
        summary: "Dodaj ocenu",
        description: "Kreira novu ocenu (samo ADMIN i TEACHER)",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["value", "studentId", "subjectId", "classroomId"],
                properties: {
                  value: {
                    type: "integer",
                    minimum: 1,
                    maximum: 5,
                    example: 5,
                  },
                  comment: { type: "string", example: "Odličan odgovor" },
                  studentId: { type: "integer" },
                  subjectId: { type: "integer" },
                  classroomId: { type: "integer" },
                },
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Ocena kreirana",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Grade" },
              },
            },
          },
          "400": {
            description: "Neispravni podaci",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
          "403": {
            description: "Zabranjen pristup (STUDENT ne može dodavati ocene)",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
    "/api/admin/users": {
      get: {
        tags: ["Users"],
        summary: "Izvuci sve korisnike",
        description: "Vraća listu svih korisnika (samo ADMIN)",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "Lista korisnika",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/User" },
                },
              },
            },
          },
          "403": {
            description: "Zabranjen pristup",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
      post: {
        tags: ["Users"],
        summary: "Kreiraj korisnika",
        description: "Kreira novog korisnika (samo ADMIN)",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["username", "password", "role"],
                properties: {
                  username: { type: "string" },
                  password: { type: "string" },
                  role: {
                    type: "string",
                    enum: ["ADMIN", "TEACHER", "STUDENT"],
                  },
                  full_name: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Korisnik kreiran",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/User" },
              },
            },
          },
        },
      },
    },
    "/api/admin/users/{id}": {
      patch: {
        tags: ["Users"],
        summary: "Izmeni korisnika",
        description: "Menja podatke o korisniku (samo ADMIN)",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  role: {
                    type: "string",
                    enum: ["ADMIN", "TEACHER", "STUDENT"],
                  },
                  full_name: { type: "string" },
                  classroomId: { type: "integer", nullable: true },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Korisnik izmenjen",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { success: { type: "boolean" } },
                },
              },
            },
          },
        },
      },
      delete: {
        tags: ["Users"],
        summary: "Obriši korisnika",
        description: "Briše korisnika po ID-u (samo ADMIN)",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: {
          "200": {
            description: "Korisnik obrisan",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { success: { type: "boolean" } },
                },
              },
            },
          },
          "400": {
            description: "Brisanje nije uspelo (postoje povezani podaci)",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
    "/api/classrooms": {
      get: {
        tags: ["Classrooms"],
        summary: "Izvuci odeljenja",
        description: "Vraća listu svih odeljenja",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "Lista odeljenja",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/Classroom" },
                },
              },
            },
          },
        },
      },
    },
    "/api/assignments": {
      get: {
        tags: ["Assignments"],
        summary: "Izvuci zadatke",
        description: "Vraća listu zadataka filtriranu po ulozi korisnika",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "Lista zadataka",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/Assignment" },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ["Assignments"],
        summary: "Kreiraj zadatak",
        description: "Kreira novi zadatak (samo TEACHER i ADMIN)",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["title", "dueDate", "subjectId", "classroomId"],
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                  dueDate: { type: "string", format: "date-time" },
                  subjectId: { type: "integer" },
                  classroomId: { type: "integer" },
                },
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Zadatak kreiran",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Assignment" },
              },
            },
          },
        },
      },
    },
    "/api/stats": {
      get: {
        tags: ["Stats"],
        summary: "Izvuci statistiku ocena",
        description: "Vraća agregiranu statistiku ocena za grafikone",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "Statistika ocena",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    bySubject: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          subject: { type: "string" },
                          average: { type: "number" },
                          count: { type: "integer" },
                        },
                      },
                    },
                    distribution: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          grade: { type: "integer" },
                          count: { type: "integer" },
                        },
                      },
                    },
                    trend: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          month: { type: "string" },
                          average: { type: "number" },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
    schemas: {
      Error: {
        type: "object",
        properties: {
          error: { type: "string" },
        },
      },
      User: {
        type: "object",
        properties: {
          id: { type: "integer" },
          username: { type: "string" },
          full_name: { type: "string", nullable: true },
          role: { type: "string", enum: ["ADMIN", "TEACHER", "STUDENT"] },
          classroom: { type: "string", nullable: true },
          classroomId: { type: "integer", nullable: true },
        },
      },
      Grade: {
        type: "object",
        properties: {
          id: { type: "integer" },
          value: { type: "integer", minimum: 1, maximum: 5 },
          comment: { type: "string", nullable: true },
          date: { type: "string", format: "date-time" },
          studentId: { type: "integer" },
          teacherId: { type: "integer" },
          subjectId: { type: "integer" },
          classroomId: { type: "integer" },
          student: {
            type: "object",
            properties: {
              id: { type: "integer" },
              full_name: { type: "string" },
            },
          },
          teacher: {
            type: "object",
            properties: {
              id: { type: "integer" },
              full_name: { type: "string" },
            },
          },
          subject: { $ref: "#/components/schemas/Subject" },
          classroom: { $ref: "#/components/schemas/Classroom" },
        },
      },
      Subject: {
        type: "object",
        properties: {
          id: { type: "integer" },
          name: { type: "string" },
        },
      },
      Classroom: {
        type: "object",
        properties: {
          id: { type: "integer" },
          name: { type: "string" },
          homeroomTeacherId: { type: "integer", nullable: true },
        },
      },
      Assignment: {
        type: "object",
        properties: {
          id: { type: "integer" },
          title: { type: "string" },
          description: { type: "string", nullable: true },
          dueDate: { type: "string", format: "date-time" },
          teacherId: { type: "integer" },
          subjectId: { type: "integer" },
          classroomId: { type: "integer" },
        },
      },
    },
  },
};
