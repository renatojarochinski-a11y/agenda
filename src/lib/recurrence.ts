import {
  differenceInCalendarDays,
  differenceInCalendarMonths,
  differenceInCalendarWeeks,
  differenceInCalendarYears,
  eachDayOfInterval,
  isSameDay,
  startOfDay,
} from "date-fns";
import type { Event as PrismaEvent } from "@prisma/client";

/**
 * Decide se `day` é uma ocorrência do evento `event`, testando dia a dia.
 * Isso evita ter que "avançar" a partir da data original quando ela é muito
 * antiga: como o intervalo de consulta é sempre curto (uma grade de mês),
 * checar cada dia candidato contra a regra é simples e suficientemente rápido.
 */
export function eventOccursOnDay(event: PrismaEvent, day: Date): boolean {
  const start = startOfDay(new Date(event.date));
  const target = startOfDay(day);

  if (target < start) return false;
  if (event.recurrenceEnd && target > startOfDay(new Date(event.recurrenceEnd))) {
    return false;
  }

  const interval = Math.max(1, event.interval || 1);

  switch (event.recurrence) {
    case "NONE":
      return isSameDay(start, target);

    case "DAILY":
      return differenceInCalendarDays(target, start) % interval === 0;

    case "WEEKLY": {
      const weekDays = event.byWeekDays.length > 0 ? event.byWeekDays : [start.getDay()];
      if (!weekDays.includes(target.getDay())) return false;
      return differenceInCalendarWeeks(target, start, { weekStartsOn: 0 }) % interval === 0;
    }

    case "MONTHLY": {
      if (target.getDate() !== start.getDate()) return false;
      return differenceInCalendarMonths(target, start) % interval === 0;
    }

    case "YEARLY": {
      if (
        target.getDate() !== start.getDate() ||
        target.getMonth() !== start.getMonth()
      ) {
        return false;
      }
      return differenceInCalendarYears(target, start) % interval === 0;
    }

    default:
      return false;
  }
}

export interface EventOccurrence {
  event: PrismaEvent;
  date: Date;
}

export function expandEventsInRange(
  events: PrismaEvent[],
  rangeStart: Date,
  rangeEnd: Date
): EventOccurrence[] {
  const days = eachDayOfInterval({ start: rangeStart, end: rangeEnd });
  const occurrences: EventOccurrence[] = [];

  for (const event of events) {
    for (const day of days) {
      if (eventOccursOnDay(event, day)) {
        occurrences.push({ event, date: day });
      }
    }
  }

  return occurrences.sort((a, b) => a.date.getTime() - b.date.getTime());
}
