import { prisma } from "@/lib/prisma";
import type { Event as PrismaEvent } from "@prisma/client";

export async function findEventsOverlapping(
  rangeStart: Date,
  rangeEnd: Date
): Promise<PrismaEvent[]> {
  return prisma.event.findMany({
    where: {
      OR: [
        { recurrence: "NONE", date: { gte: rangeStart, lte: rangeEnd } },
        {
          recurrence: { not: "NONE" },
          date: { lte: rangeEnd },
          OR: [{ recurrenceEnd: null }, { recurrenceEnd: { gte: rangeStart } }],
        },
      ],
    },
  });
}
