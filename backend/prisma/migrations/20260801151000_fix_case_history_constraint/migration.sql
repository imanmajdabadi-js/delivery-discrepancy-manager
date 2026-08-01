-- DropConstraint
ALTER TABLE "case_history" DROP CONSTRAINT "case_history_event_matches_status";

-- AddCheckConstraint
ALTER TABLE "case_history"
ADD CONSTRAINT "case_history_event_matches_status"
CHECK (
    ("event_type" = 'CREATED' AND "resulting_status" = 'SUBMITTED')
    OR
    ("event_type" = 'DECIDED' AND "resulting_status" IN ('APPROVED', 'REJECTED'))
    OR
    ("event_type" = 'ASSIGNED' AND "resulting_status" = 'SUBMITTED')
    OR
    ("event_type" = 'ASSIGNMENT_RELEASED' AND "resulting_status" = 'SUBMITTED')
);
