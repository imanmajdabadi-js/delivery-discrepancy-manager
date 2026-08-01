-- DropForeignKey
ALTER TABLE "discrepancy_cases" DROP CONSTRAINT "discrepancy_cases_assignee_id_fkey";

-- AddForeignKey
ALTER TABLE "discrepancy_cases" ADD CONSTRAINT "discrepancy_cases_assignee_id_fkey" FOREIGN KEY ("assignee_id") REFERENCES "operators"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
