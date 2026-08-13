import { NextRequest, NextResponse } from "next/server";
import { findEventsOverlapping } from "@/lib/eventsQuery";
import { eventOccursOnDay } from "@/lib/recurrence";
import { USERS } from "@/lib/auth";
import { sendWhatsApp } from "@/lib/whatsapp";
import { buildDailyReminderMessage } from "@/lib/notifyMessages";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const now = new Date();
  const today = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  );

  const candidates = await findEventsOverlapping(today, today);
  const todaysEvents = candidates.filter((event) => eventOccursOnDay(event, today));

  if (todaysEvents.length === 0) {
    return NextResponse.json({ sent: false, count: 0 });
  }

  const message = buildDailyReminderMessage(todaysEvents);
  await Promise.all(USERS.map((user) => sendWhatsApp(user, message)));

  return NextResponse.json({ sent: true, count: todaysEvents.length });
}
