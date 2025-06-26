/*
  Warnings:

  - Added the required column `genre` to the `Scenario` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Genre" AS ENUM ('MADAMIS', 'TRPG', 'OTHER');

-- AlterTable
ALTER TABLE "Scenario" ADD COLUMN     "genre" "Genre" NOT NULL,
ADD COLUMN     "rulebookId" TEXT;

-- CreateTable
CREATE TABLE "Rulebook" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "system" TEXT NOT NULL,
    "publisher" TEXT,
    "url" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Rulebook_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Scenario" ADD CONSTRAINT "Scenario_rulebookId_fkey" FOREIGN KEY ("rulebookId") REFERENCES "Rulebook"("id") ON DELETE SET NULL ON UPDATE CASCADE;
