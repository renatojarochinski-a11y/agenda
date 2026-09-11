import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";
import TibiaTimer from "@/components/TibiaTimer";

export const metadata = {
  title: "Cronômetro Tibia",
};

export default async function TibiaPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  const session = await verifySessionToken(token);

  if (!session) {
    redirect("/login");
  }

  return <TibiaTimer />;
}
