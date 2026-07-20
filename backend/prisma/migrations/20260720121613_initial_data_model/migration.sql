-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PROCESSING', 'DELIVERED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "DiscrepancyType" AS ENUM ('SHORTAGE', 'DAMAGED');

-- CreateEnum
CREATE TYPE "CaseStatus" AS ENUM ('SUBMITTED', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "DecisionType" AS ENUM ('APPROVE', 'REJECT');

-- CreateEnum
CREATE TYPE "CaseEventType" AS ENUM ('CREATED', 'DECIDED');

-- CreateTable
CREATE TABLE "operators" (
    "id" UUID NOT NULL,
    "full_name" VARCHAR(120) NOT NULL,
    "email" VARCHAR(254) NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "operators_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customers" (
    "id" UUID NOT NULL,
    "customer_code" VARCHAR(24) NOT NULL,
    "full_name" VARCHAR(160) NOT NULL,
    "phone" VARCHAR(16) NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "customers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orders" (
    "id" UUID NOT NULL,
    "order_number" VARCHAR(32) NOT NULL,
    "customer_id" UUID NOT NULL,
    "status" "OrderStatus" NOT NULL,
    "delivered_at" TIMESTAMPTZ(3),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_items" (
    "id" UUID NOT NULL,
    "order_id" UUID NOT NULL,
    "sku" VARCHAR(48) NOT NULL,
    "product_name" VARCHAR(240) NOT NULL,
    "unit" VARCHAR(24) NOT NULL,
    "delivered_quantity" INTEGER NOT NULL,

    CONSTRAINT "order_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "discrepancy_cases" (
    "id" UUID NOT NULL,
    "case_number" VARCHAR(32) NOT NULL,
    "order_id" UUID NOT NULL,
    "status" "CaseStatus" NOT NULL DEFAULT 'SUBMITTED',
    "created_by_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "discrepancy_cases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "discrepancy_items" (
    "id" UUID NOT NULL,
    "case_id" UUID NOT NULL,
    "order_item_id" UUID NOT NULL,
    "type" "DiscrepancyType" NOT NULL,
    "quantity" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "discrepancy_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "open_discrepancies" (
    "order_item_id" UUID NOT NULL,
    "type" "DiscrepancyType" NOT NULL,
    "case_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "open_discrepancies_pkey" PRIMARY KEY ("order_item_id","type")
);

-- CreateTable
CREATE TABLE "case_decisions" (
    "id" UUID NOT NULL,
    "case_id" UUID NOT NULL,
    "type" "DecisionType" NOT NULL,
    "explanation" TEXT NOT NULL,
    "decided_by_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "case_decisions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "case_history" (
    "id" UUID NOT NULL,
    "case_id" UUID NOT NULL,
    "event_type" "CaseEventType" NOT NULL,
    "resulting_status" "CaseStatus" NOT NULL,
    "performed_by_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "case_history_pkey" PRIMARY KEY ("id")
);

-- AddCheckConstraint
ALTER TABLE "orders"
ADD CONSTRAINT "order_delivered_at_matches_status"
CHECK (("status" = 'DELIVERED') = ("delivered_at" IS NOT NULL));

-- AddCheckConstraint
ALTER TABLE "order_items"
ADD CONSTRAINT "order_item_delivered_quantity_positive"
CHECK ("delivered_quantity" > 0);

-- AddCheckConstraint
ALTER TABLE "discrepancy_items"
ADD CONSTRAINT "discrepancy_item_quantity_positive"
CHECK ("quantity" > 0);

-- AddCheckConstraint
ALTER TABLE "case_decisions"
ADD CONSTRAINT "decision_explanation_not_blank"
CHECK (btrim("explanation") <> '');

-- AddCheckConstraint
ALTER TABLE "case_history"
ADD CONSTRAINT "case_history_event_matches_status"
CHECK (
    ("event_type" = 'CREATED' AND "resulting_status" = 'SUBMITTED')
    OR
    ("event_type" = 'DECIDED' AND "resulting_status" IN ('APPROVED', 'REJECTED'))
);

-- CreateIndex
CREATE UNIQUE INDEX "operators_email_key" ON "operators"("email");

-- CreateIndex
CREATE UNIQUE INDEX "customers_customer_code_key" ON "customers"("customer_code");

-- CreateIndex
CREATE UNIQUE INDEX "customers_phone_key" ON "customers"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "orders_order_number_key" ON "orders"("order_number");

-- CreateIndex
CREATE INDEX "orders_customer_id_status_idx" ON "orders"("customer_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "order_items_order_id_sku_key" ON "order_items"("order_id", "sku");

-- CreateIndex
CREATE UNIQUE INDEX "discrepancy_cases_case_number_key" ON "discrepancy_cases"("case_number");

-- CreateIndex
CREATE INDEX "discrepancy_cases_status_created_at_idx" ON "discrepancy_cases"("status", "created_at");

-- CreateIndex
CREATE INDEX "discrepancy_cases_order_id_idx" ON "discrepancy_cases"("order_id");

-- CreateIndex
CREATE INDEX "discrepancy_items_order_item_id_idx" ON "discrepancy_items"("order_item_id");

-- CreateIndex
CREATE UNIQUE INDEX "discrepancy_items_case_id_order_item_id_type_key" ON "discrepancy_items"("case_id", "order_item_id", "type");

-- CreateIndex
CREATE INDEX "open_discrepancies_case_id_idx" ON "open_discrepancies"("case_id");

-- CreateIndex
CREATE UNIQUE INDEX "case_decisions_case_id_key" ON "case_decisions"("case_id");

-- CreateIndex
CREATE INDEX "case_history_case_id_created_at_idx" ON "case_history"("case_id", "created_at");

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "discrepancy_cases" ADD CONSTRAINT "discrepancy_cases_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "discrepancy_cases" ADD CONSTRAINT "discrepancy_cases_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "operators"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "discrepancy_items" ADD CONSTRAINT "discrepancy_items_case_id_fkey" FOREIGN KEY ("case_id") REFERENCES "discrepancy_cases"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "discrepancy_items" ADD CONSTRAINT "discrepancy_items_order_item_id_fkey" FOREIGN KEY ("order_item_id") REFERENCES "order_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "open_discrepancies" ADD CONSTRAINT "open_discrepancies_order_item_id_fkey" FOREIGN KEY ("order_item_id") REFERENCES "order_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "open_discrepancies" ADD CONSTRAINT "open_discrepancies_case_id_fkey" FOREIGN KEY ("case_id") REFERENCES "discrepancy_cases"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "case_decisions" ADD CONSTRAINT "case_decisions_case_id_fkey" FOREIGN KEY ("case_id") REFERENCES "discrepancy_cases"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "case_decisions" ADD CONSTRAINT "case_decisions_decided_by_id_fkey" FOREIGN KEY ("decided_by_id") REFERENCES "operators"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "case_history" ADD CONSTRAINT "case_history_case_id_fkey" FOREIGN KEY ("case_id") REFERENCES "discrepancy_cases"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "case_history" ADD CONSTRAINT "case_history_performed_by_id_fkey" FOREIGN KEY ("performed_by_id") REFERENCES "operators"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
