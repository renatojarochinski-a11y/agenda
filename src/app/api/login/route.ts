import { NextRequest, NextResponse } from "next/server";
import { createSessionToken, SESSION_COOKIE, SESSION_MAX_AGE, USERS } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const name = body?.name;
  const password = body?.password;

  if (typeof name !== "string" || !(USERS as readonly string[]).includes(name)) {
    return NextResponse.json({ error: "Selecione quem você é." }, { status: 400 });
  }

  const sharedPassword = process.env.SHARED_PASSWORD;
  if (!sharedPassword) {
    return NextResponse.json(
      { error: "Senha compartilhada não configurada no servidor." },
      { status: 500 }
    );
  }

  if (typeof password !== "string" || password !== sharedPassword) {
    return NextResponse.json({ error: "Senha incorreta." }, { status: 401 });
  }

  const token = await createSessionToken(name as "Renato" | "Nicole");
  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE,
    path: "/",
  });
  return response;
}
