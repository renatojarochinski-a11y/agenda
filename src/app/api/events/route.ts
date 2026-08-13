import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { expandEventsInRange } from "@/lib/recurrence";
import { findEventsOverlapping } from "@/lib/eventsQuery";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";
import { otherUser, sendWhatsApp } from "@/lib/whatsapp";
import { buildEventCreatedMessage } from "@/lib/notifyMessages";
import { EventType, RecurrenceFreq } from "@prisma/client";

const EVENT_TYPES = Object.values(EventType);
const RECURRENCE_FREQS = Object.values(RecurrenceFreq);

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const startParam = searchParams.get("start");
  const endParam = searchParams.get("end");

  if (!startParam || !endParam) {
    return NextResponse.json(
      { error: "Parâmetros 'start' e 'end' são obrigatórios." },
      { status: 400 }
    );
  }

  const rangeStart = new Date(startParam);
  const rangeEnd = new Date(endParam);

  if (Number.isNaN(rangeStart.getTime()) || Number.isNaN(rangeEnd.getTime())) {
    return NextResponse.json({ error: "Datas inválidas." }, { status: 400 });
  }

  const events = await findEventsOverlapping(rangeStart, rangeEnd);

  const occurrences = expandEventsInRange(events, rangeStart, rangeEnd).map(
    ({ event, date }) => ({
      ...event,
      date: date.toISOString(),
      occurrenceDate: date.toISOString(),
    })
  );

  return NextResponse.json({ occurrences });
}

export async function POST(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const session = await verifySessionToken(token);
  if (!session) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Corpo inválido." }, { status: 400 });
  }

  const { title, description, type, date, time, allDay, recurrence, interval, byWeekDays, recurrenceEnd } = body;

  if (typeof title !== "string" || title.trim().length === 0) {
    return NextResponse.json({ error: "Título é obrigatório." }, { status: 400 });
  }
  if (typeof date !== "string" || Number.isNaN(new Date(date).getTime())) {
    return NextResponse.json({ error: "Data inválida." }, { status: 400 });
  }
  if (type !== undefined && !EVENT_TYPES.includes(type)) {
    return NextResponse.json({ error: "Tipo de evento inválido." }, { status: 400 });
  }
  if (recurrence !== undefined && !RECURRENCE_FREQS.includes(recurrence)) {
    return NextResponse.json({ error: "Recorrência inválida." }, { status: 400 });
  }

  const event = await prisma.event.create({
    data: {
      title: title.trim(),
      description: typeof description === "string" ? description.trim() || null : null,
      type: type ?? "OUTRO",
      date: new Date(date),
      time: typeof time === "string" && time.length > 0 ? time : null,
      allDay: allDay ?? true,
      recurrence: recurrence ?? "NONE",
      interval: Number.isInteger(interval) && interval > 0 ? interval : 1,
      byWeekDays: Array.isArray(byWeekDays) ? byWeekDays.filter((d) => Number.isInteger(d) && d >= 0 && d <= 6) : [],
      recurrenceEnd: typeof recurrenceEnd === "string" && recurrenceEnd ? new Date(recurrenceEnd) : null,
      createdBy: session.name,
    },
  });

  await sendWhatsApp(otherUser(session.name), buildEventCreatedMessage(event, session.name));

  return NextResponse.json({ event }, { status: 201 });
}
