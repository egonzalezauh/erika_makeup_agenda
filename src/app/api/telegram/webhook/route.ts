import { sendMessage } from "@/lib/telegram/client";
import { HELP_TEXT, parseCommand, type ParsedCommand } from "@/lib/telegram/commands";
import {
  createAppointment,
  getAppointmentsByDate,
  getServices,
  searchAppointmentsByClientName,
  updateAppointmentStatus,
} from "@/actions/appointments";

// ── Telegram Update (minimal shape we care about) ───────────────────────────

type TelegramUpdate = {
  message?: {
    chat: { id: number };
    text?: string;
  };
};

const STATUS_LABEL: Record<string, string> = {
  PENDIENTE: "⏳ Pendiente",
  CONFIRMADA: "✅ Confirmada",
  CANCELADA: "❌ Cancelada",
  COMPLETADA: "🎉 Completada",
};

const STATUS_ACTION_TARGET: Record<string, string> = {
  confirmar: "CONFIRMADA",
  cancelar: "CANCELADA",
  completar: "COMPLETADA",
  reabrir: "PENDIENTE",
};

function formatDate(date: Date | string) {
  const iso = new Date(date).toISOString().split("T")[0];
  return new Date(iso + "T12:00:00").toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

// ── Route handler ────────────────────────────────────────────────────────────

export async function POST(req: Request) {
  const secret = req.headers.get("x-telegram-bot-api-secret-token");
  if (!secret || secret !== process.env.TELEGRAM_WEBHOOK_SECRET) {
    return new Response(null, { status: 401 });
  }

  let update: TelegramUpdate;
  try {
    update = await req.json();
  } catch {
    return new Response(null, { status: 200 });
  }

  const chatId = update.message?.chat?.id;
  const text = update.message?.text;
  if (!chatId || !text) {
    return new Response(null, { status: 200 });
  }

  const adminChatIds = (process.env.TELEGRAM_ADMIN_CHAT_IDS ?? "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);
  if (!adminChatIds.includes(String(chatId))) {
    // Not an authorized admin — ignore silently, no reply.
    return new Response(null, { status: 200 });
  }

  try {
    const command = parseCommand(text);
    const reply = await handleCommand(command);
    await sendMessage(chatId, reply);
  } catch (err) {
    console.error("[telegram/webhook]", err);
    await sendMessage(chatId, "Ocurrió un error procesando tu mensaje. Intenta de nuevo.");
  }

  return new Response(null, { status: 200 });
}

// ── Command dispatch ──────────────────────────────────────────────────────────

async function handleCommand(command: ParsedCommand): Promise<string> {
  switch (command.type) {
    case "ayuda":
      return HELP_TEXT;

    case "servicios": {
      const services = await getServices();
      if (services.length === 0) return "No hay servicios cargados.";
      return services
        .map((s) => `• ${s.name} — $${s.price} / ${s.duration} min`)
        .join("\n");
    }

    case "citas": {
      const appts = await getAppointmentsByDate(command.date);
      if (appts.length === 0) return `No hay citas para ${command.label}.`;
      return (
        `Citas para ${command.label}:\n\n` +
        appts
          .map(
            (a) =>
              `${a.timeSlot} — ${a.clientName} (${a.service.name}) [${STATUS_LABEL[a.status] ?? a.status}]`
          )
          .join("\n")
      );
    }

    case "status_change":
      return handleStatusChange(command.action, command.query);

    case "agendar":
      return handleAgendar(command.fields, command.errors);

    case "unknown":
      return "No entendí ese comando. Escribe 'ayuda' para ver las opciones.";
  }
}

async function handleStatusChange(
  action: "confirmar" | "cancelar" | "completar" | "reabrir",
  query: string
): Promise<string> {
  if (!query) return `Escribe: ${action} <nombre de la clienta>`;

  const matches = await searchAppointmentsByClientName(query);
  if (matches.length === 0) {
    return `No encontré ninguna cita con "${query}".`;
  }

  if (matches.length > 1) {
    const list = matches
      .map((a) => `- ${formatDate(a.date)} ${a.timeSlot} — ${a.clientName} (${a.service.name})`)
      .join("\n");
    return `Encontré varias citas con "${query}", sé más específica (agrega la fecha):\n\n${list}`;
  }

  const appt = matches[0];
  const newStatus = STATUS_ACTION_TARGET[action];
  const result = await updateAppointmentStatus(
    appt.id,
    newStatus as "PENDIENTE" | "CONFIRMADA" | "CANCELADA" | "COMPLETADA"
  );

  if (!result.success) return result.error ?? "No se pudo actualizar la cita.";

  return `${STATUS_LABEL[newStatus]} — ${appt.clientName}, ${formatDate(appt.date)} ${appt.timeSlot} (${appt.service.name})`;
}

async function handleAgendar(
  fields: { servicio?: string; fecha?: string; hora?: string; nombre?: string; telefono?: string; email?: string; notas?: string },
  errors: string[]
): Promise<string> {
  if (errors.length > 0) {
    return `No pude agendar la cita:\n${errors.map((e) => `- ${e}`).join("\n")}`;
  }

  const services = await getServices();
  const service = services.find((s) =>
    s.name.toLowerCase().includes(fields.servicio!.toLowerCase())
  );
  if (!service) {
    const list = services.map((s) => `- ${s.name}`).join("\n");
    return `No encontré el servicio "${fields.servicio}". Servicios disponibles:\n${list}`;
  }

  const result = await createAppointment({
    clientName: fields.nombre!,
    clientEmail: fields.email ?? "",
    clientPhone: fields.telefono!,
    date: fields.fecha!,
    timeSlot: fields.hora!,
    serviceId: service.id,
    notes: fields.notas,
    status: "CONFIRMADA",
  });

  if (!result.success) return result.error ?? "No se pudo agendar la cita.";

  return `✅ Cita agendada — ${fields.nombre}, ${service.name}, ${fields.fecha} a las ${fields.hora}.`;
}
