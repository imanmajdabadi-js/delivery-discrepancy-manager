-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.

ALTER TYPE "CaseEventType" ADD VALUE 'ASSIGNED';
ALTER TYPE "CaseEventType" ADD VALUE 'ASSIGNMENT_RELEASED';

-- AlterTable
ALTER TABLE "discrepancy_cases"
  ADD COLUMN "assigned_at" TIMESTAMPTZ(3),
  ADD COLUMN "assignee_id" UUID;

-- CreateIndex
CREATE INDEX "discrepancy_cases_assignee_id_status_created_at_idx"
  ON "discrepancy_cases" ("assignee_id", "status", "created_at");

-- AddForeignKey
ALTER TABLE "discrepancy_cases"
  ADD CONSTRAINT "discrepancy_cases_assignee_id_fkey"
  FOREIGN KEY ("assignee_id") REFERENCES "operators"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;
