"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  CalendarGrid,
  formatDisplayDate,
} from "@/components/shared/CalendarGrid";

// ── Types ─────────────────────────────────────────────────────────────────────

type Service = {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  imageUrl: string | null;
};

type WizardStep = 1 | 2 | "bridge";

// ── Constants ─────────────────────────────────────────────────────────────────

const TIME_SLOTS = [
  "05:00", "06:00", "07:00", "08:00", "09:00", "10:00", "11:00", "12:00",
  "13:00", "14:00", "15:00", "16:00", "17:00", "18:00",
];

const WHATSAPP_NUMBER = (
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? ""
).replace(/\D/g, "");

// ── Step Indicator ────────────────────────────────────────────────────────────

function StepIndicator({ current }: { current: 1 | 2 }) {
  const steps = [
    { n: 1 as const, label: "Servicio" },
    { n: 2 as const, label: "Fecha y hora" },
  ];

  return (
    <div className="flex items-center justify-center mb-10">
      {steps.map((step, i) => (
        <div key={step.n} className="flex items-center">
          <div className="flex flex-col items-center gap-1.5">
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium transition-colors
                ${current === step.n
                  ? "bg-muted-rose text-white shadow-md"
                  : current > step.n
                  ? "bg-muted-rose-dark text-white"
                  : "bg-cream-deep text-charcoal-light"
                }`}
            >
              {current > step.n ? (
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path
                    d="M2.5 7.5l3 3 6-6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              ) : (
                step.n
              )}
            </div>
            <span
              className={`text-xs font-medium ${
                current === step.n ? "text-muted-rose" : "text-charcoal-light"
              }`}
            >
              {step.label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div
              className={`h-px w-14 mx-2 mb-5 transition-colors ${
                current > step.n ? "bg-muted-rose-dark" : "bg-cream-deep"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}

// ── Step 1: Service Selection ─────────────────────────────────────────────────

function Step1Services({
  services,
  selected,
  onSelect,
  onNext,
}: {
  services: Service[];
  selected: string | null;
  onSelect: (id: string) => void;
  onNext: () => void;
}) {
  return (
    <div>
      <div className="text-center mb-8">
        <h2 className="font-serif text-2xl text-dark-charcoal">
          ¿Qué servicio deseas?
        </h2>
        <p className="text-sm text-charcoal-light mt-1">
          Selecciona el servicio que mejor se adapte a tu ocasión
        </p>
      </div>

      <div className="grid gap-4">
        {services.map((service) => {
          const isSelected = selected === service.id;
          return (
            <button
              key={service.id}
              onClick={() => onSelect(service.id)}
              className={`w-full text-left p-5 rounded-2xl border-2 transition-all duration-200 cursor-pointer
                ${
                  isSelected
                    ? "border-muted-rose bg-muted-rose-light/20 shadow-md"
                    : "border-cream-deep bg-cream-mid hover:border-muted-rose-light hover:bg-cream-soft"
                }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <div
                      className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors
                        ${isSelected ? "border-muted-rose bg-muted-rose" : "border-cream-deep"}`}
                    >
                      {isSelected && (
                        <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                          <path
                            d="M1.5 4l2 2 3-3"
                            stroke="white"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </div>
                    <span
                      className={`font-medium text-base ${
                        isSelected ? "text-muted-rose-dark" : "text-dark-charcoal"
                      }`}
                    >
                      {service.name}
                    </span>
                  </div>
                  <p className="text-sm text-charcoal-light leading-relaxed ml-6">
                    {service.description}
                  </p>
                  <div className="flex items-center gap-3 mt-3 ml-6">
                    <span className="text-xs text-charcoal-light bg-cream-deep px-2.5 py-0.5 rounded-full">
                      ⏱ {service.duration} min
                    </span>
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-8 flex justify-end">
        <button
          disabled={!selected}
          onClick={onNext}
          className="px-8 py-3 rounded-full bg-muted-rose text-white font-medium text-sm tracking-wide
            hover:bg-muted-rose-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
        >
          Siguiente →
        </button>
      </div>
    </div>
  );
}

// ── Step 2: Date & Time ───────────────────────────────────────────────────────

function Step2DateTime({
  year,
  month,
  today,
  selectedDate,
  selectedTime,
  onSelectDate,
  onSelectTime,
  onPrevMonth,
  onNextMonth,
  isDisabled,
  onBack,
  onNext,
}: {
  year: number;
  month: number;
  today: Date;
  selectedDate: string | null;
  selectedTime: string | null;
  onSelectDate: (dateStr: string) => void;
  onSelectTime: (t: string) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  isDisabled: (y: number, m: number, d: number) => boolean;
  onBack: () => void;
  onNext: () => void;
}) {
  return (
    <div>
      <div className="text-center mb-8">
        <h2 className="font-serif text-2xl text-dark-charcoal">
          ¿Cuándo te vemos?
        </h2>
        <p className="text-sm text-charcoal-light mt-1">
          Selecciona una fecha y el horario de tu preferencia
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <CalendarGrid
          year={year}
          month={month}
          today={today}
          selectedDate={selectedDate}
          onSelectDate={onSelectDate}
          onPrevMonth={onPrevMonth}
          onNextMonth={onNextMonth}
          isDateDisabled={isDisabled}
        />

        {/* ── Time slots ── */}
        <div>
          <p className="text-sm font-medium text-dark-charcoal mb-3">
            {selectedDate
              ? `Horarios — ${formatDisplayDate(selectedDate)}`
              : "Primero selecciona una fecha"}
          </p>

          {!selectedDate ? (
            <div className="h-full min-h-40 bg-cream-mid rounded-2xl border-2 border-dashed border-cream-deep flex items-center justify-center">
              <p className="text-sm text-charcoal-light">
                ← Elige un día en el calendario
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {TIME_SLOTS.map((slot) => {
                const isSelected = selectedTime === slot;
                return (
                  <button
                    key={slot}
                    onClick={() => onSelectTime(slot)}
                    className={`py-2.5 rounded-xl text-sm font-medium transition-all duration-150 border
                      ${
                        isSelected
                          ? "bg-muted-rose text-white border-muted-rose shadow-sm"
                          : "bg-cream-mid border-cream-deep text-dark-charcoal hover:border-muted-rose-light hover:text-muted-rose"
                      }`}
                  >
                    {slot}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 flex justify-between">
        <button
          onClick={onBack}
          className="px-6 py-3 rounded-full border border-cream-deep text-charcoal-mid text-sm font-medium
            hover:bg-cream-mid transition-colors"
        >
          ← Volver
        </button>
        <button
          disabled={!selectedDate || !selectedTime}
          onClick={onNext}
          className="px-8 py-3 rounded-full bg-muted-rose text-white font-medium text-sm tracking-wide
            hover:bg-muted-rose-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
        >
          Siguiente →
        </button>
      </div>
    </div>
  );
}

// ── WhatsApp Bridge Screen ─────────────────────────────────────────────────────

function WhatsAppBridge({
  service,
  date,
  time,
  onBack,
}: {
  service: Service | null;
  date: string;
  time: string;
  onBack: () => void;
}) {
  const [name, setName] = useState("");
  const shortDate = date.split("-").reverse().join("/"); // "YYYY-MM-DD" -> "DD/MM/YYYY"

  const message =
    `Hola! Me gustaría agendar: ${service?.name ?? ""} el ${shortDate} a las ${time}. ` +
    `Mi nombre es: ${name.trim() || "___"}`;

  const waLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

  return (
    <div className="text-center py-6">
      <div className="w-20 h-20 rounded-full bg-muted-rose-light/40 flex items-center justify-center mx-auto mb-6">
        <div className="w-12 h-12 rounded-full bg-muted-rose flex items-center justify-center shadow-md">
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <path
              d="M4 11.5l5 5 9-9"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>

      <h2 className="font-serif text-3xl text-dark-charcoal mb-2">
        ¡Ya casi! Un último paso
      </h2>
      <p className="text-charcoal-light text-sm max-w-sm mx-auto leading-relaxed">
        Continúa por WhatsApp para coordinar tu cita directamente con
        nosotras.
      </p>

      <div className="mt-6 max-w-sm mx-auto text-left">
        <label className="block text-xs font-semibold text-charcoal-mid tracking-widest uppercase mb-1.5">
          Tu nombre
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ej. María López"
          className="w-full px-4 py-3 rounded-xl border border-cream-deep bg-cream-mid text-dark-charcoal
            placeholder:text-charcoal-light/60 focus:outline-none focus:border-muted-rose focus:bg-white
            text-sm transition-colors"
        />
      </div>

      {service && (
        <div className="mt-8 inline-block text-left bg-cream-mid border border-cream-deep rounded-2xl p-6 w-full max-w-sm">
          <p className="text-xs font-semibold tracking-widest uppercase text-charcoal-light mb-4">
            Detalle de tu solicitud
          </p>
          <p className="font-serif text-xl text-dark-charcoal mb-4">
            {service.name}
          </p>
          <div className="space-y-2.5 text-sm">
            <div className="flex justify-between gap-8">
              <span className="text-charcoal-light">Fecha</span>
              <span className="text-dark-charcoal font-medium capitalize">
                {formatDisplayDate(date)}
              </span>
            </div>
            <div className="flex justify-between gap-8">
              <span className="text-charcoal-light">Hora</span>
              <span className="text-dark-charcoal font-medium">{time}</span>
            </div>
            <div className="flex justify-between gap-8">
              <span className="text-charcoal-light">Duración</span>
              <span className="text-dark-charcoal font-medium">
                {service.duration} min
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="mt-8 flex gap-3 justify-center flex-wrap">
        <button
          onClick={onBack}
          className="px-6 py-3 rounded-full border border-cream-deep text-charcoal-mid text-sm font-medium
            hover:bg-cream-mid transition-colors"
        >
          ← Volver
        </button>
        <a
          href={waLink}
          target="_blank"
          rel="noopener noreferrer"
          className="px-8 py-3 rounded-full bg-muted-rose text-white font-medium text-sm
            hover:bg-muted-rose-dark transition-colors shadow-sm"
        >
          Continuar en WhatsApp →
        </a>
      </div>

      <div className="mt-6">
        <Link
          href="/"
          className="text-xs text-charcoal-light hover:text-muted-rose transition-colors tracking-widest uppercase"
        >
          ← Volver al inicio
        </Link>
      </div>
    </div>
  );
}

// ── Main exported component ───────────────────────────────────────────────────

export function BookingWizard({ services }: { services: Service[] }) {
  const today = useMemo(() => new Date(), []);

  const [step, setStep] = useState<WizardStep>(1);
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [calYear, setCalYear] = useState(today.getFullYear());
  const [calMonth, setCalMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const selectedService =
    services.find((s) => s.id === selectedServiceId) ?? null;

  function handleSelectDate(dateStr: string) {
    setSelectedDate(dateStr);
    setSelectedTime(null);
  }

  function handlePrevMonth() {
    if (calYear === today.getFullYear() && calMonth === today.getMonth()) return;
    if (calMonth === 0) {
      setCalMonth(11);
      setCalYear((y) => y - 1);
    } else {
      setCalMonth((m) => m - 1);
    }
    setSelectedDate(null);
    setSelectedTime(null);
  }

  function handleNextMonth() {
    if (calMonth === 11) {
      setCalMonth(0);
      setCalYear((y) => y + 1);
    } else {
      setCalMonth((m) => m + 1);
    }
    setSelectedDate(null);
    setSelectedTime(null);
  }

  function isDateDisabled(y: number, m: number, d: number) {
    const picked = new Date(y, m, d);
    const todayMidnight = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );
    return picked < todayMidnight;
  }

  if (step === "bridge") {
    return (
      <div className="w-full max-w-3xl mx-auto">
        <WhatsAppBridge
          service={selectedService}
          date={selectedDate!}
          time={selectedTime!}
          onBack={() => setStep(2)}
        />
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto">
      <StepIndicator current={step} />

      {step === 1 && (
        <Step1Services
          services={services}
          selected={selectedServiceId}
          onSelect={setSelectedServiceId}
          onNext={() => setStep(2)}
        />
      )}

      {step === 2 && (
        <Step2DateTime
          year={calYear}
          month={calMonth}
          today={today}
          selectedDate={selectedDate}
          selectedTime={selectedTime}
          onSelectDate={handleSelectDate}
          onSelectTime={setSelectedTime}
          onPrevMonth={handlePrevMonth}
          onNextMonth={handleNextMonth}
          isDisabled={isDateDisabled}
          onBack={() => setStep(1)}
          onNext={() => setStep("bridge")}
        />
      )}
    </div>
  );
}
