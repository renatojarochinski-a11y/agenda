-- CreateEnum
CREATE TYPE "EventType" AS ENUM ('FESTA', 'FIXO', 'TAREFA', 'ANIVERSARIO', 'OUTRO');

-- CreateEnum
CREATE TYPE "RecurrenceFreq" AS ENUM ('NONE', 'DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY');

-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" "EventType" NOT NULL DEFAULT 'OUTRO',
    "date" TIMESTAMP(3) NOT NULL,
    "time" TEXT,
    "allDay" BOOLEAN NOT NULL DEFAULT true,
    "recurrence" "RecurrenceFreq" NOT NULL DEFAULT 'NONE',
    "interval" INTEGER NOT NULL DEFAULT 1,
    "byWeekDays" INTEGER[] DEFAULT ARRAY[]::INTEGER[],
    "recurrenceEnd" TIMESTAMP(3),
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Event_date_idx" ON "Event"("date");
