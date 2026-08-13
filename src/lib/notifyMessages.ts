import { getEventTypeMeta } from "@/lib/eventTypes";
import type { UserName } from "@/lib/auth";
import type { Event as PrismaEvent } from "@prisma/client";

const RECURRENCE_SHORT: Partial<Record<PrismaEvent["recurrence"], string>> = {
  DAILY: "todo dia",
  WEEKLY: "toda semana",
  MONTHLY: "todo mês",
  YEARLY: "todo ano",
};

/** event.date é sempre meia-noite UTC; usar getters UTC evita escorregar de dia. */
function formatDateLabel(date: Date): string {
  const dd = String(date.getUTCDate()).padStart(2, "0");
  const mm = String(date.getUTCMonth() + 1).padStart(2, "0");
  const yyyy = date.getUTCFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

export function buildEventCreatedMessage(event: PrismaEvent, creator: UserName): string {
  const meta = getEventTypeMeta(event.type);
  const lines = [
    `🗓️ ${creator} adicionou um evento na agenda:`,
    `${meta.emoji} ${event.title}`,
    `📆 ${formatDateLabel(event.date)}${event.time ? ` às ${event.time}` : ""}`,
  ];
  const recurrenceLabel = RECURRENCE_SHORT[event.recurrence];
  if (recurrenceLabel) {
    lines.push(`🔁 Repete ${recurrenceLabel}`);
  }
  return lines.join("\n");
}

export function buildDailyReminderMessage(events: PrismaEvent[]): string {
  const lines = ["☀️ Bom dia! Eventos de hoje:"];
  for (const event of events) {
    const meta = getEventTypeMeta(event.type);
    lines.push(`${meta.emoji} ${event.title}${event.time ? ` às ${event.time}` : ""}`);
  }
  return lines.join("\n");
}
