// Thin wrapper over the Telegram Bot API. Plain-text replies only (no
// parse_mode) — avoids MarkdownV2's escaping footguns for client names,
// emails, and notes that may contain "special" characters.
export async function sendMessage(
  chatId: number | string,
  text: string
): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    console.error("[telegram/client] TELEGRAM_BOT_TOKEN no configurado");
    return;
  }

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text }),
    });
    if (!res.ok) {
      console.error("[telegram/client] sendMessage falló", res.status, await res.text());
    }
  } catch (err) {
    console.error("[telegram/client] sendMessage error", err);
  }
}
