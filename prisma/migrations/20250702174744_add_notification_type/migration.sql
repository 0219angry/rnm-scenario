-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('FILE_SHARE', 'CHAT_MESSAGE');

-- AlterTable
ALTER TABLE "Notification" 
ADD COLUMN "type" "NotificationType" NOT NULL DEFAULT 'FILE_SHARE',
ADD COLUMN "channelId" TEXT;

-- CreateTable
CREATE TABLE "channels" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    CONSTRAINT "channels_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Notification_channelId_idx" ON "Notification"("channelId");

-- AddForeignKey
ALTER TABLE "Notification" 
ADD CONSTRAINT "Notification_channelId_fkey" 
FOREIGN KEY ("channelId") REFERENCES "channels"("id") 
ON DELETE CASCADE ON UPDATE CASCADE;
