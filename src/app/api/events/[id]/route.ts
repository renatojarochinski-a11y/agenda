import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { EventType, RecurrenceFreq } from "@prisma/client";

const EVENT_TYPES = Object.values(EventType);
const RECURRENCE_FREQS = Object.values(RecurrenceFreq);

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Corpo inválido." }, { status: 400 });
  }

  const existing = await prisma.event.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Evento não encontrado." }, { status: 404 });
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

  const event = await prisma.event.update({
    where: { id },
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
    },
  });

  return NextResponse.json({ event });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const existing = await prisma.event.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Evento não encontrado." }, { status: 404 });
  }
  await prisma.event.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
