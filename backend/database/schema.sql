-- ============================================================================
-- Telecom Customer Management API — Database Schema (standalone deliverable)
-- ============================================================================
-- Target : PostgreSQL 17
-- Scope  : User, Contract, Resource, Service, Accessory, Order, OrderItem
--          (+ enums, constraints, indexes, FK)
-- Source : prisma/schema.prisma (Prisma 7, migrations 20260805162406_init,
--          20260805223432_add_service, 20260805223803_add_accessory,
--          20260813171351_add_user_profile_contract_client_and_orders)
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
--   * Deleting an Order cascades to its OrderItems (ON DELETE CASCADE).
--   * Users referenced by a Contract or Order cannot be deleted (ON DELETE RESTRICT).
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

CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED');

CREATE TYPE "OrderItemType" AS ENUM ('ACCESSORY', 'SERVICE', 'RESOURCE');

-- ----------------------------------------------------------------------------
-- Table: User
-- ----------------------------------------------------------------------------
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "avatarUrl" TEXT,
    "firstName" TEXT,
    "lastName" TEXT,
    "phone" TEXT,
    "birthDate" TIMESTAMP(3),
    "address" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- ----------------------------------------------------------------------------
-- Table: Contract (FK -> User, ON DELETE RESTRICT)
-- ----------------------------------------------------------------------------
CREATE TABLE "Contract" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
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
-- Table: Order (FK -> User, ON DELETE RESTRICT)
-- ----------------------------------------------------------------------------
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- ----------------------------------------------------------------------------
-- Table: OrderItem (FK -> Order, ON DELETE CASCADE)
-- ----------------------------------------------------------------------------
CREATE TABLE "OrderItem" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "itemType" "OrderItemType" NOT NULL,
    "itemName" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "priceAtPurchase" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id")
);

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
-- Unique constraints
-- ----------------------------------------------------------------------------
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

CREATE UNIQUE INDEX "Resource_iccid_key" ON "Resource"("iccid");

CREATE UNIQUE INDEX "Resource_imsi_key" ON "Resource"("imsi");

CREATE UNIQUE INDEX "Resource_msisdn_key" ON "Resource"("msisdn");

-- ----------------------------------------------------------------------------
-- Secondary indexes
-- ----------------------------------------------------------------------------
CREATE INDEX "Resource_contractId_idx" ON "Resource"("contractId");

CREATE INDEX "Contract_clientId_idx" ON "Contract"("clientId");

CREATE INDEX "Order_clientId_idx" ON "Order"("clientId");

CREATE INDEX "Order_status_idx" ON "Order"("status");

CREATE INDEX "OrderItem_orderId_idx" ON "OrderItem"("orderId");

-- ----------------------------------------------------------------------------
-- Foreign keys
-- ----------------------------------------------------------------------------
ALTER TABLE "Contract" ADD CONSTRAINT "Contract_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Resource" ADD CONSTRAINT "Resource_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "Contract"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Order" ADD CONSTRAINT "Order_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
