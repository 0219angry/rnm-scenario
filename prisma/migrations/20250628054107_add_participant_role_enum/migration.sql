/*
  Warnings:

  - Added the required column `role` to the `SessionParticipant` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ParticipantRole" AS ENUM ('GM', 'KP', 'PL', 'PC', 'SPECTATOR', 'UNDECIDED');

-- AlterTable
ALTER TABLE "SessionParticipant" DROP COLUMN "role",
ADD COLUMN     "role" "ParticipantRole" NOT NULL;
