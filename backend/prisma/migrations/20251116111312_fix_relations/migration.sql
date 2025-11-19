/*
  Warnings:

  - The values [NO_SHOW] on the enum `InterviewStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `description` on the `interviews` table. All the data in the column will be lost.
  - You are about to drop the column `endTime` on the `interviews` table. All the data in the column will be lost.
  - You are about to drop the column `startTime` on the `interviews` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `interviews` table. All the data in the column will be lost.
  - Added the required column `candidateId` to the `interviews` table without a default value. This is not possible if the table is not empty.
  - Added the required column `date` to the `interviews` table without a default value. This is not possible if the table is not empty.
  - Added the required column `duration` to the `interviews` table without a default value. This is not possible if the table is not empty.
  - Added the required column `interviewerId` to the `interviews` table without a default value. This is not possible if the table is not empty.
  - Added the required column `interviewerName` to the `interviews` table without a default value. This is not possible if the table is not empty.
  - Added the required column `time` to the `interviews` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `interviews` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "InterviewType" AS ENUM ('PHONE', 'VIDEO', 'IN_PERSON');

-- AlterEnum
BEGIN;
CREATE TYPE "InterviewStatus_new" AS ENUM ('SCHEDULED', 'COMPLETED', 'CANCELLED', 'RESCHEDULED');
ALTER TABLE "interviews" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "interviews" ALTER COLUMN "status" TYPE "InterviewStatus_new" USING ("status"::text::"InterviewStatus_new");
ALTER TYPE "InterviewStatus" RENAME TO "InterviewStatus_old";
ALTER TYPE "InterviewStatus_new" RENAME TO "InterviewStatus";
DROP TYPE "InterviewStatus_old";
ALTER TABLE "interviews" ALTER COLUMN "status" SET DEFAULT 'SCHEDULED';
COMMIT;

-- DropForeignKey
ALTER TABLE "interviews" DROP CONSTRAINT "interviews_applicationId_fkey";

-- AlterTable
ALTER TABLE "interviews" DROP COLUMN "description",
DROP COLUMN "endTime",
DROP COLUMN "startTime",
DROP COLUMN "title",
ADD COLUMN     "candidateId" TEXT NOT NULL,
ADD COLUMN     "date" TEXT NOT NULL,
ADD COLUMN     "duration" INTEGER NOT NULL,
ADD COLUMN     "interviewerId" TEXT NOT NULL,
ADD COLUMN     "interviewerName" TEXT NOT NULL,
ADD COLUMN     "meetingLink" TEXT,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "tags" TEXT[],
ADD COLUMN     "time" TEXT NOT NULL,
ADD COLUMN     "type" "InterviewType" NOT NULL,
ALTER COLUMN "applicationId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "interviews" ADD CONSTRAINT "interviews_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "candidates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interviews" ADD CONSTRAINT "interviews_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "applications"("id") ON DELETE SET NULL ON UPDATE CASCADE;
