CREATE TYPE "OperatorRole" AS ENUM ('OPERATOR', 'MANAGER');

-- AlterTable
ALTER TABLE "operators" ADD COLUMN "role" "OperatorRole" NOT NULL DEFAULT 'OPERATOR';
