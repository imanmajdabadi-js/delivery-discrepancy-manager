-- DropForeignKey
ALTER TABLE "discrepancy_cases" DROP CONSTRAINT "discrepancy_cases_assignee_id_fkey";

-- CreateIndex
CREATE INDEX "discrepancy_cases_assignee_id_status_created_at_idx" ON "discrepancy_cases"("assignee_id", "status", "created_at");

-- AddForeignKey
ALTER TABLE "discrepancy_cases" ADD CONSTRAINT "discrepancy_cases_assignee_id_fkey" FOREIGN KEY ("assignee_id") REFERENCES "operators"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
