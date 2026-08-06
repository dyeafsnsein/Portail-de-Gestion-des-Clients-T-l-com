-- ============================================================================
-- Telecom Customer Management API — Database Schema (standalone deliverable)
-- ============================================================================
-- Target : PostgreSQL 17
-- Scope  : User, Contract, Resource, Service, Accessory (+ enums, constraints, indexes, FK)
-- Source : prisma/schema.prisma (Prisma 7, migrations 20260805162406_init,
--          20260805223432_add_service, 20260805223803_add_accessory)
-- Usage  : Run against an empty database (fresh install), e.g.:
--            psql -U postgres -d telecom -f schema.sql
--          No Prisma/application is required.
--
-- Notes:
--   * "id" columns are TEXT PRIMARY KEY; their cuid() values are generated
--     by the application, not by the database (no DB default).
--   * TIMESTAMP(3) matches Prisma's DateTime mapping (millisecond precision).
--   * "updatedAt" has no DB-level default; it is maintained by the app.
--   * Deleting a Contract sets Resource.contractId to NULL (ON DELETE SET NULL).
--   * Enum type names are quoted and match the Prisma enum names exactly.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Enums
-- ----------------------------------------------------------------------------
CREATE TYPE "Role" AS ENUM ('ADMIN', 'USER');

CREATE TYPE "ContractStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'TERMINATED');

CREATE TYPE "ResourceType" AS ENUM ('SIM', 'ESIM');

CREATE TYPE "ResourceStatus" AS ENUM ('ASSIGNED', 'AVAILABLE', 'BLOCKED');

CREATE TYPE "ServiceType" AS ENUM ('INTERNET', 'ROAMING', 'VOLTE', 'SMS', 'OPTION');

CREATE TYPE "AccessoryCategory" AS ENUM ('SMARTPHONE', 'CHARGER', 'HEADSET', 'MODEM');

-- ----------------------------------------------------------------------------
-- Table: User
-- ----------------------------------------------------------------------------
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "avatarUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- ----------------------------------------------------------------------------
-- Table: Contract
-- ----------------------------------------------------------------------------
CREATE TABLE "Contract" (
    "id" TEXT NOT NULL,
    "clientName" TEXT NOT NULL,
    "status" "ContractStatus" NOT NULL DEFAULT 'ACTIVE',
    "type" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Contract_pkey" PRIMARY KEY ("id")
);

-- ----------------------------------------------------------------------------
-- Table: Resource (FK -> Contract, ON DELETE SET NULL)
-- ----------------------------------------------------------------------------
CREATE TABLE "Resource" (
    "id" TEXT NOT NULL,
    "type" "ResourceType" NOT NULL,
    "iccid" TEXT NOT NULL,
    "imsi" TEXT NOT NULL,
    "msisdn" TEXT NOT NULL,
    "status" "ResourceStatus" NOT NULL DEFAULT 'AVAILABLE',
    "contractId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Resource_pkey" PRIMARY KEY ("id")
);

-- ----------------------------------------------------------------------------
-- Indexes & unique constraints
-- ----------------------------------------------------------------------------
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

CREATE UNIQUE INDEX "Resource_iccid_key" ON "Resource"("iccid");

CREATE UNIQUE INDEX "Resource_imsi_key" ON "Resource"("imsi");

CREATE UNIQUE INDEX "Resource_msisdn_key" ON "Resource"("msisdn");

CREATE INDEX "Resource_contractId_idx" ON "Resource"("contractId");

-- ----------------------------------------------------------------------------
-- Table: Service
-- ----------------------------------------------------------------------------
CREATE TABLE "Service" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "ServiceType" NOT NULL,
    "description" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Service_pkey" PRIMARY KEY ("id")
);

-- ----------------------------------------------------------------------------
-- Table: Accessory
-- ----------------------------------------------------------------------------
CREATE TABLE "Accessory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" "AccessoryCategory" NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "stockQuantity" INTEGER NOT NULL,
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Accessory_pkey" PRIMARY KEY ("id")
);

-- ----------------------------------------------------------------------------
-- Foreign key: Resource.contractId -> Contract.id
-- ----------------------------------------------------------------------------
ALTER TABLE "Resource" ADD CONSTRAINT "Resource_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "Contract"("id") ON DELETE SET NULL ON UPDATE CASCADE;
