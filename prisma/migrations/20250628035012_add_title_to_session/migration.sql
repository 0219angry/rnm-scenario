/*
  Warnings:

  - You are about to drop the column `comment` on the `Scenario` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Scenario" DROP COLUMN "comment";

-- AlterTable
ALTER TABLE "Session" ADD COLUMN     "title" TEXT;
