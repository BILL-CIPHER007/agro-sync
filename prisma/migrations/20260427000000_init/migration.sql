CREATE TYPE "Role" AS ENUM ('ADMIN', 'OPERADOR');
CREATE TYPE "MovementType" AS ENUM ('ENTRADA', 'SAIDA');
CREATE TYPE "RestockStatus" AS ENUM ('PENDENTE', 'APROVADO', 'RECEBIDO', 'CANCELADO');

CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'OPERADOR',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AgriculturalAgent" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "unit" TEXT NOT NULL,
    "description" TEXT,
    "currentQuantity" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "minimumQuantity" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AgriculturalAgent_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "StockMovement" (
    "id" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "restockRequestId" TEXT,
    "type" "MovementType" NOT NULL,
    "quantity" DECIMAL(12,2) NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StockMovement_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "RestockRequest" (
    "id" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "requestedQuantity" DECIMAL(12,2) NOT NULL,
    "status" "RestockStatus" NOT NULL DEFAULT 'PENDENTE',
    "requestDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expectedDate" TIMESTAMP(3),
    "receivedDate" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RestockRequest_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE INDEX "User_role_idx" ON "User"("role");
CREATE INDEX "AgriculturalAgent_name_idx" ON "AgriculturalAgent"("name");
CREATE INDEX "AgriculturalAgent_category_idx" ON "AgriculturalAgent"("category");
CREATE INDEX "StockMovement_agentId_idx" ON "StockMovement"("agentId");
CREATE INDEX "StockMovement_userId_idx" ON "StockMovement"("userId");
CREATE INDEX "StockMovement_type_idx" ON "StockMovement"("type");
CREATE INDEX "StockMovement_createdAt_idx" ON "StockMovement"("createdAt");
CREATE INDEX "RestockRequest_agentId_idx" ON "RestockRequest"("agentId");
CREATE INDEX "RestockRequest_userId_idx" ON "RestockRequest"("userId");
CREATE INDEX "RestockRequest_status_idx" ON "RestockRequest"("status");
CREATE INDEX "RestockRequest_requestDate_idx" ON "RestockRequest"("requestDate");

ALTER TABLE "StockMovement" ADD CONSTRAINT "StockMovement_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "AgriculturalAgent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "StockMovement" ADD CONSTRAINT "StockMovement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "StockMovement" ADD CONSTRAINT "StockMovement_restockRequestId_fkey" FOREIGN KEY ("restockRequestId") REFERENCES "RestockRequest"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "RestockRequest" ADD CONSTRAINT "RestockRequest_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "AgriculturalAgent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "RestockRequest" ADD CONSTRAINT "RestockRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
