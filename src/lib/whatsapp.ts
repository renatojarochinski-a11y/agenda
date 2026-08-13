import type { UserName } from "@/lib/auth";

function getCreds(user: UserName): { phone: string; apiKey: string } | null {
  const phone = process.env[`${user.toUpperCase()}_WHATSAPP_PHONE`];
  const apiKey = process.env[`${user.toUpperCase()}_WHATSAPP_APIKEY`];
  if (!phone || !apiKey) return null;
  return { phone, apiKey };
}

export function otherUser(user: UserName): UserName {
  return user === "Renato" ? "Nicole" : "Renato";
}

/** Best-effort: nunca lança erro (não deve derrubar a request principal). */
export async function sendWhatsApp(user: UserName, message: string): Promise<void> {
  const creds = getCreds(user);
  if (!creds) return;

  const url = `https://api.callmebot.com/whatsapp.php?phone=${encodeURIComponent(
    creds.phone
  )}&text=${encodeURIComponent(message)}&apikey=${encodeURIComponent(creds.apiKey)}`;

  try {
    await fetch(url);
  } catch (err) {
    console.error(`Falha ao enviar WhatsApp para ${user}:`, err);
  }
}
