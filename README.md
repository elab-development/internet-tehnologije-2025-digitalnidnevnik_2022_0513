# eDnevnik - Digitalni Učenički Dnevnik

Digitalni sistem za vođenje učeničkog dnevnika. Omogućava nastavnicima unos ocena, učenicima pregled svojih ocena, i administratorima upravljanje sistemom.

## [- Tehnologije -]

- **Frontend**: Next.js 16, shadcn/ui
- **Backend**: Next.js API Routes, Prisma ORM
- **Baza**: PostgreSQL (Neon.tech)
- **Autentifikacija**: JWT (JSON Web Token)
- **Testiranje**: Vitest, Testing Library
- **Vizualizacija**: Recharts
- **Dokumentacija**: Swagger/OpenAPI 3.0

## [- Funkcionalnosti -]

### Tipovi korisnika

- **ADMIN** - Upravljanje korisnicima, odeljenjima, pun pristup
- **TEACHER** - Unos ocena, pregled odeljenja, kreiranje zadataka
- **STUDENT** - Pregled svojih ocena, zadataka i odeljenja

### Glavne funkcionalnosti

- ✅ Autentifikacija (login/logout) sa JWT
- ✅ CRUD operacije za korisnike, ocene, odeljenja, zadatke
- ✅ Role-based pristup (RBAC)
- ✅ Vizualizacija ocena (grafici)
- ✅ Integracija sa eksternim API-jima (vreme, praznici)
- ✅ Swagger API dokumentacija
- ✅ Automatizovani testovi

## [- Instalacija -]

### Preduslovi

- Node.js 20+
- npm ili yarn
- PostgreSQL baza (ili Neon.tech nalog)

### Koraci

1. **Kloniraj repozitorijum**

```bash
git clone https://github.com/your-username/ednevnik.git
cd ednevnik
```

2. **Instaliraj dependencije**

```bash
npm install
```

3. **Podesi environment varijable**

```bash
cp .env.example .env
```

Popuni `.env` fajl:

```env
DATABASE_URL="postgresql://user:password@host/database"
JWT_SECRET="kljuc-minimalna-duzina-32-karaktera"
```

4. **Pokreni migracije**

```bash
npx prisma migrate deploy
npx prisma generate
```

5. **Pokreni development server**

```bash
npm run dev
```

Aplikacija je dostupna na `http://localhost:3000`

## [- Docker -]

### Build i pokretanje

```bash
docker-compose up --build
```

### Samo build

```bash
docker build -t ednevnik .
```

## [- Testiranje -]

```bash
# Pokreni testove jednom
npm run test:run

# Pokreni sa coverage izveštajem
npm run test:coverage
```

## [- API Dokumentacija -]

Swagger UI je dostupan na `/docs` kada je aplikacija pokrenuta.

### Glavni endpointi

| Metoda | Endpoint             | Opis              |
| ------ | -------------------- | ----------------- |
| POST   | `/api/auth/login`    | Prijava korisnika |
| POST   | `/api/auth/register` | Registracija      |
| GET    | `/api/grades`        | Dohvati ocene     |
| POST   | `/api/grades`        | Dodaj ocenu       |
| GET    | `/api/admin/users`   | Lista korisnika   |
| GET    | `/api/stats`         | Statistika ocena  |
| GET    | `/api/classrooms`    | Lista odeljenja   |

## [- Bezbednost -]

Aplikacija implementira zaštitu od sledećih napada:

1. **SQL Injection** - Prisma ORM sa parametrizovanim upitima
2. **XSS (Cross-Site Scripting)** - CSP headers
3. **CSRF** - Token validacija
4. **Rate Limiting** - Ograničenje broja zahteva (10/min za auth, 100/min za API)
5. **CORS** - Konfigurisani dozvoljeni origins
6. **Clickjacking** - X-Frame-Options: DENY

## [- Eksterni API -]

1. **Nager.Date API** - Srpski državni praznici
   - Endpoint: `https://date.nager.at/api/v3/PublicHolidays/{year}/RS`
   - Prikaz predstojecih praznika na dashboard-u

2. **Open-Meteo API** - Vremenski uslovi
   - Endpoint: `https://api.open-meteo.com/v1/forecast`
   - Prikaz trenutne temperature u navbar-u

## [- Vizualizacija -]

Stranica `/stats` prikazuje:

- **Bar chart** - Prosek ocena po predmetima
- **Pie chart** - Distribucija ocena (koliko 5-ica, 4-ki...)
- **Line chart** - Trend ocena kroz vreme

## [- Demo nalozi -]

| Uloga     | Username | Password    |
| --------- | -------- | ----------- |
| Admin     | admin    | password123 |
| Nastavnik | milica   | password123 |
| Učenik    | marko    | password123 |
