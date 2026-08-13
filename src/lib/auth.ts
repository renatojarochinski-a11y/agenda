import { SignJWT, jwtVerify } from "jose";

export const USERS = ["Renato", "Nicole"] as const;
export type UserName = (typeof USERS)[number];

export const SESSION_COOKIE = "agenda_session";
const SESSION_DURATION_SECONDS = 60 * 60 * 24 * 180; // 180 dias

function getSecretKey() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error("SESSION_SECRET não configurada");
  }
  return new TextEncoder().encode(secret);
}

export async function createSessionToken(name: UserName): Promise<string> {
  return new SignJWT({ name })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION_SECONDS}s`)
    .sign(getSecretKey());
}

export async function verifySessionToken(
  token: string | undefined
): Promise<{ name: UserName } | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    const name = payload.name;
    if (typeof name === "string" && (USERS as readonly string[]).includes(name)) {
      return { name: name as UserName };
    }
    return null;
  } catch {
    return null;
  }
}

export const SESSION_MAX_AGE = SESSION_DURATION_SECONDS;
