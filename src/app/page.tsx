import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";
import CalendarApp from "@/components/CalendarApp";

export default async function Home() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  const session = await verifySessionToken(token);

  if (!session) {
    redirect("/login");
  }

  return <CalendarApp currentUser={session.name} />;
}
