-- AlterTable
ALTER TABLE "channels" ADD COLUMN     "sessionId" TEXT;

-- AddForeignKey
ALTER TABLE "channels" ADD CONSTRAINT "channels_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE SET NULL ON UPDATE CASCADE;
