export type AppointmentStatus = "pending" | "confirmed" | "cancelled" | "completed";

export type ServiceType =
  | "bridal"
  | "quinceanera"
  | "event"
  | "photoshoot"
  | "natural"
  | "other";

export interface Appointment {
  id: string;
  clientName: string;
  clientPhone: string;
  clientEmail?: string;
  service: ServiceType;
  date: string;       // ISO date string "YYYY-MM-DD"
  time: string;       // "HH:mm"
  notes?: string;
  status: AppointmentStatus;
  createdAt: string;
}

export interface TimeSlot {
  time: string;
  available: boolean;
}
