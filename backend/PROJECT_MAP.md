# PROJECT_MAP — Telecom Customer Management API (Admin)

External memory foundation for the backend-only Admin API. Maintained by the lead; update when architecture, flow, or scope changes.

Status: **IMPLEMENTATION COMPLETE** (2026-08-05) — + password reset, SQL deliverable, backend/ restructure (M8–M10), Service module (M11), Accessory module + image upload (M12), full E2E verification (M13), PROJECT_MAP accuracy + Swagger top-level tags (M14), Swagger response schemas + Update DTO bodies + avatarUrl type (M15)

---

## [TECH_STACK]

| Layer | Technology | Version | Notes |
|---|---|---|---|
| Runtime | Node.js | 22 LTS (min 20) | Nest 11 dropped Node <=18 |
| Framework | NestJS (`@nestjs/{common,core,platform-express}`) | 11.1.28 | latest stable, 2026-07-08 |
| CLI | `@nestjs/cli` | 11.0.24 | pinned to major 11 |
| ORM | Prisma (`prisma`, `@prisma/client`) | 7.9.1 | 7.9.1 = security patch over 7.9.0 |
| DB driver adapter | `@prisma/adapter-pg` + `pg` | 7.9.1 / 8.22.0 | Prisma 7 mandates driver adapters |
| Database | PostgreSQL | 17 (`postgres:17-alpine`, Docker) | via docker-compose: `telecom-db` (app DB) + `telecom-adminer` (web UI, :8080) |
| Swagger/OpenAPI | `@nestjs/swagger` | 11.4.6 | docs on every endpoint |
| Auth | `@nestjs/jwt`, `@nestjs/passport`, `passport`, `passport-jwt` | 11.0.2 / 11.0.5 / 0.7.0 / 4.0.1 | stateless JWT bearer |
| Password hashing | `bcrypt` | 6.0.0 | |
| Validation | `class-validator`, `class-transformer` | 0.15.1 / 0.5.1 | DTOs + global ValidationPipe |
| Config | `@nestjs/config` | 4.0.4 | env-driven |
| Uploads | `multer` (via platform-express) | 2.2.0 | disk storage, static serving |
| Language | TypeScript | **5.9.3** | deliberately NOT 6.x/7.x — Nest 11 toolchain compatibility |
| Logging | Nest built-in `Logger` | — | no third-party logger |

### Prisma 7 behavioral requirements (not deprecated, but changed)
- Driver adapter **mandatory**: `new PrismaClient({ adapter: new PrismaPg({ connectionString }) })`.
- Prisma 7 defaults to ESM; Nest 11 is CommonJS → `moduleFormat = "cjs"` in generator block.

---

## [SYSTEM_FLOW]

### Auth flow
```
POST /auth/register (public)          → bcrypt.hash(password) → create User(role=USER) → 201
POST /auth/login (public)             → bcrypt.compare → sign JWT{sub,email,role} (JWT_SECRET, expiry) → {accessToken,user}
Protected request                     → Authorization: Bearer <token>
  → JwtAuthGuard: verify signature + expiry → attach req.user {sub,email,role}
  → RolesGuard: compare role against @Roles() metadata → 403 if mismatch
```

### CRUD flow (per entity E ∈ {User, Contract, Resource, Service, Accessory})
```
POST   /E          create, DTO-validated            (ADMIN)
GET    /E          list w/ pagination/search/filter (ADMIN)
GET    /E/:id      single                           (ADMIN)
PATCH  /E/:id      update, DTO-validated            (ADMIN)
DELETE /E/:id      delete semantics below           (ADMIN)
```
- Search: `ILIKE %search%` on `email` (User), `clientName` (Contract), `iccid|imsi|msisdn` (Resource), `name` (Service, Accessory).
- Filters: enum params (`role`, `status`, `type`) + `contractId` (Resource); `type` + `isActive` (Service); `category` (Accessory).
- Pagination: `page=1`, `pageSize=20` (cap 100), `sortBy=createdAt`, `sortDir=desc`.
- Errors: uniform body `{statusCode, error, message, timestamp}` via global exception filter.
- Upload: `POST /users/:id/avatar` and `POST /accessories/:id/image` — multipart, image/jpeg|png|webp, <=2MB, disk → `./uploads`, url=`/uploads/<file>`, static serve on `/uploads`, re-upload unlinks the previous file. ADMIN-only (all entity endpoints are).
- Password reset: `PATCH /users/:id/reset-password` (ADMIN) — admin-supplied new password, validated like registration (`@IsString()` + `@MinLength(8)`), bcrypt-hashed (10 rounds), returns `SafeUser`, audit-logged via `Logger` (actor + target ids).

### Delete semantics
| Entity | Behavior |
|---|---|
| User | **Hard delete** (row removal; no status field in spec, no FK children) |
| Contract | **Soft delete** → `status=TERMINATED` (idempotent) |
| Resource | **Soft delete** → `status=BLOCKED` (idempotent) |
| Service | **Hard delete** (204; no status field in spec) |
| Accessory | **Hard delete** (204; no status field in spec) |

Soft-deleted rows remain in lists; status is an exposed filterable enum (auditable). No soft-delete for User/Service/Accessory (fixed spec has no status field on them).

---

## [ARCHITECTURE]

Feature-based (domain-driven) modules; shared layer only for genuinely repeated logic.

```
backend/                     # repo layout: backend/ now holds the API (frontend/ planned later)
  src/
    main.ts                   # bootstrap: global ValidationPipe, Swagger, static /uploads
    app.module.ts             # root module wiring
    prisma/
      prisma.module.ts        # global PrismaModule
      prisma.service.ts       # PrismaClient + PrismaPg adapter; onModuleDestroy
    common/                   # shared ONLY where repeated (filter, pagination, guards)
      filters/http-exception.filter.ts
      dto/pagination.dto.ts   # page/pageSize/sortBy/sortDir + Paginated<T> shape
      guards/jwt-auth.guard.ts
      guards/roles.guard.ts
      decorators/roles.decorator.ts
    auth/                     # register, login, JWT strategy
    users/                    # ADMIN CRUD + avatar upload + password reset
    contracts/                # ADMIN CRUD
    resources/                # ADMIN CRUD
    services/                 # ADMIN CRUD + search/filter
    accessories/              # ADMIN CRUD + image upload
  database/
    schema.sql                # standalone DDL deliverable (no Prisma needed)
  prisma/
    schema.prisma             # 5 models: User, Contract, Resource, Service, Accessory + enums
    seed.ts                   # idempotent 1x ADMIN from env
  docker-compose.yml          # services: postgres:17 (telecom-db) + adminer (8080)
  .env / .env.example
  PROJECT_MAP.md
```

Entity model:
- `User`: id, email, password, role(ADMIN|USER), avatarUrl, createdAt, updatedAt
- `Contract`: id, clientName, status(ACTIVE|SUSPENDED|TERMINATED), type, startDate, endDate, createdAt, updatedAt
- `Resource`: id, type(SIM|ESIM), iccid, imsi, msisdn, status(ASSIGNED|AVAILABLE|BLOCKED), contractId FK→Contract, createdAt, updatedAt
- `Service`: id, name, type(INTERNET|ROAMING|VOLTE|SMS|OPTION), description, price, isActive (default true), createdAt, updatedAt
- `Accessory`: id, name, category(SMARTPHONE|CHARGER|HEADSET|MODEM), price, stockQuantity, imageUrl (nullable), createdAt, updatedAt

Rejected (feature creep / premature abstraction): repository layer, pagination library, CASL/permissions engine, CQRS, third-party logger, "own data scoping" for USER (future Client phase — explicitly out of scope).

---

## [LIVRABLES]

| # | Deliverable | State | Location / Notes |
|---|---|---|---|
| 1 | Password reset flow | **DONE 2026-08-05** | `PATCH /users/:id/reset-password` (ADMIN), `ResetPasswordDto` (min 8), bcrypt-hashed, audit-logged, Swagger documented. Verified end-to-end (old 200 → reset → new 200 / old 401; 400/403/404). |
| 2 | Standalone SQL creation script | **DONE 2026-08-05** | `backend/database/schema.sql` — full DDL (6 enums, User/Contract/Resource/Service/Accessory, PKs, unique indexes, FK `ON DELETE SET NULL`), mirrors Prisma migrations (init, add_service, add_accessory). Verified by executing in a scratch DB (5 tables, 6 constraints). |


---

## [COSMETIC / MINOR NOTES]

Documentation-only items — no behavioral impact.

| # | Note | State |
|---|---|---|
| 1 | Top-level Swagger `tags` array | **FIXED 2026-08-05** — `main.ts` DocumentBuilder now declares `.addTag(...)` for auth/users/contracts/resources/services/accessories (with descriptions), so `/docs` groups are explicit in the OpenAPI document. Verified: 6 tags, 15 paths, summaries/schemas intact, stderr empty. |
| 2 | Standalone `ServiceType` / `AccessoryCategory` enum schemas | **SKIPPED (cosmetic)** — enum values are inlined in the DTO property schemas (`CreateServiceDto.type`, `CreateAccessoryDto.category`), so Swagger UI and validation already expose all values. Emitting them as standalone named schemas would require editing the DTO decorators (code beyond the Swagger config), so it was deliberately left as-is. |
| 3 | Response schemas + Update DTO bodies + avatarUrl type | **FIXED 2026-08-06** — all CRUD/upload operations now declare typed response schemas (`@ApiOkResponse`/`@ApiCreatedResponse`/`@ApiNoContentResponse`) via per-entity response DTOs (`*ResponseDto` + `Paginated*ResponseDto` + `PaginationMetaDto`). Update DTOs switched from `@nestjs/mapped-types` to `@nestjs/swagger` `PartialType` so PATCH bodies show their (all-optional) fields. `UserResponseDto.avatarUrl` now typed `string` (nullable). Verified: spec shows schemas on all 27 previously-missing ops, PATCH bodies populated, enums/`string|null` correct, build + lint clean, live PATCH/GET behavior unchanged. |

---

## [ORPHANS & PENDING]

Live tracking of incomplete/unresolved items.

| # | Item | State | Resolution |
|---|---|---|---|
| 1 | RBAC matrix | **RESOLVED 2026-08-05** | USER = register/login only. All entity endpoints (GET/POST/PATCH/DELETE) ADMIN-only. No own-data scoping. |
| 2 | USER role data exposure | **RESOLVED 2026-08-05** | USER JWT is valid (authenticated) but 403 on every entity endpoint; JwtAuthGuard + RolesGuard enforce. |
| 3 | User delete semantics | **RESOLVED 2026-08-05** | Hard delete (spec has no User status field). |
| 4 | Avatar storage | **RESOLVED 2026-08-05** | Local disk + static serving. |
| 5 | Seed strategy | **RESOLVED 2026-08-05** | Idempotent seed of 1 ADMIN from env. |
| 6 | Public register | **RESOLVED 2026-08-05** | `/auth/register` creates USER role (role not client-suppliable). |
| 7 | Implementation approval | **RESOLVED 2026-08-05** | Approved; M0 in progress. |
| 8 | Env/JWT secret strength | **RESOLVED 2026-08-05** | 64-char hex JWT_SECRET; .env + .env.example; npm `overrides` pins js-yaml ^5.2.2 (0 vulnerabilities). |
| M0 | Scaffold + infra | **DONE 2026-08-05** | Nest 11.1.28 scaffold, deps installed, Postgres 17 healthy, `GET /` → 200, `npm run build` clean. |
| M1 | Prisma schema + migration + seed | **DONE 2026-08-05** | Prisma 7.9.1; client → `src/generated/prisma` (moduleFormat cjs); `prisma.config.ts` with dotenv; 3 tables migrated; ADMIN seeded (bcrypt $2b$10). |
| M2 | Global plumbing (pipe/filter/pagination/Swagger) | **DONE 2026-08-05** | ValidationPipe (whitelist+forbidNonWhitelisted+transform), HttpExceptionFilter (uniform body, Prisma P2002/P2003/P2025 mapping, level-gated logs), PaginationDto/Paginated/parseSort/paginate, Swagger at /docs + /docs-json, static /uploads, LOG_LEVEL gating, build excludes prisma config. |
| M3 | Auth (register/login/JWT/guards) | **DONE 2026-08-05** | register(201)+login(200) verified, role claims in JWT, 409 dup email, 401 bad creds, 400 invalid body. JwtAuthGuard+RolesGuard+@Roles() ready. |
| M4 | Users CRUD + avatar upload | **DONE 2026-08-05** | Full ADMIN CRUD (create 201, patch 200, delete 204, 404 on missing), pagination/search/role filter verified, USER token 403 / no token 401, avatar upload (png 200 + /uploads static 200, bad mime 400, >2MB 413 via MulterError) all live-verified. |
| M5 | Contracts CRUD | **DONE 2026-08-05** | create (default ACTIVE), search ILIKE on clientName, status filter, PATCH partial, soft DELETE → TERMINATED (row persists, 200), 404 uniform, date-range 400, USER 403 — all live-verified. |
| M6 | Resources CRUD | **DONE 2026-08-05** | create with FK contractId, dup iccid 409, bad contractId 400 (P2003), search across iccid/imsi/msisdn, type/status/contractId filters, PATCH partial, soft DELETE → BLOCKED (persists, 200), USER 403 — all live-verified. |
| M7 | Swagger every endpoint + smoke | **DONE 2026-08-05** | /docs-json: 9 paths at completion (auth public; users/contracts/resources secured bearer); now **15 paths** across 6 module groups (auth, users, contracts, resources, services, accessories). avatar multipart requestBody added, tags per module, /docs 200. Final smoke: public 200, ADMIN 200, USER 403, anonymous 401, clean stderr. Lint 0 errors, build clean. |
| M8 | Password reset endpoint | **DONE 2026-08-05** | `PATCH /users/:id/reset-password` — see LIVRABLES #1. |
| M9 | Standalone SQL script | **DONE 2026-08-05** | `backend/database/schema.sql` — see LIVRABLES #2. |
| M10 | Repo restructure backend/ | **DONE 2026-08-05** | All backend files moved under `backend/` (frontend/ planned). App re-verified booting from `backend/`; docker-compose + adminer now under `backend/`. Note: user's stale `node dist/main.js` on :3000 (PID 24948) predates move + Mod 1 — restart from `backend/` to pick up new code. |
| M11 | Service module | **DONE 2026-08-05** | Model Service + enum ServiceType (migration 20260805223432_add_service). Full ADMIN CRUD, search on name, filters type/isActive (boolean transform), pagination, Swagger. Verified: create 201, invalid type 400, search/filters, patch, delete 204, 404, USER 403, anon 401. |
| M12 | Accessory module | **DONE 2026-08-05** | Model Accessory + enum AccessoryCategory (migration 20260805223803_add_accessory). Full ADMIN CRUD, search on name, category filter, pagination, image upload `POST /accessories/:id/image` (2MB jpeg/png/webp, old file unlinked). Shared upload util `common/utils/upload.util.ts` (users avatar refactored to it). Verified: create 201, invalid category/negative price 400, search/filter, patch, upload 201 + static 200, bad mime 400, >2MB 413, missing file 400, delete 204, 404, USER 403, anon 401. |
| M13 | Final verification | **DONE 2026-08-05** | Build + lint clean (0 errors). Avatar + password reset regression pass; smoke: public 200, admin 200, user 403, anon 401; stderr empty. |
| M14 | Full E2E audit + docs accuracy | **DONE 2026-08-05** | 38-item E2E audit: 37 PASS, 1 FAIL (PROJECT_MAP stale). Fixed all stale entries (items 1–8, see below) and added Swagger top-level tags in `main.ts` (verified: 6 tags, 15 paths, stderr empty). Standalone enum schemas deliberately skipped — see [COSMETIC / MINOR NOTES]. |
| M15 | Swagger response schemas + update DTO bodies + avatarUrl type | **DONE 2026-08-06** | Final Swagger sanity check flagged 3 real issues, all fixed: (1) Update DTOs (`users/contracts/resources/services/accessories`) switched to `PartialType` from `@nestjs/swagger` — PATCH bodies now show optional fields; (2) response schemas added to all previously-undocumented operations via new response DTOs (`auth/dto` `UserResponseDto`, `common/dto` `PaginationMetaDto`, `users|contracts|resources|services|accessories/dto/*ResponseDto` + `Paginated*ResponseDto`), wired with `@ApiOkResponse`/`@ApiCreatedResponse`/`@ApiNoContentResponse`; (3) `UserResponseDto.avatarUrl` now `@ApiProperty({ type: String, nullable: true })`. Re-verified: `/docs-json` shows schemas on all ops (409/401 error paths remain description-only; 204s bodyless), enums + `string|null` correct, `npm run build` + `npm run lint` clean (0 errors), live PATCH (user role, contract status) + GET + delete regression all unchanged, server restarted from `backend/` on :3000, stderr empty. |
