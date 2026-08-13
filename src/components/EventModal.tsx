"use client";

import { useState } from "react";
import { format } from "date-fns";
import {
  EVENT_TYPE_OPTIONS,
  RECURRENCE_OPTIONS,
  WEEKDAYS,
  type EventTypeValue,
  type RecurrenceValue,
} from "@/lib/eventTypes";
import { dateKeyFromISO } from "@/lib/dateKey";

export interface Occurrence {
  id: string;
  title: string;
  description: string | null;
  type: EventTypeValue;
  date: string;
  time: string | null;
  allDay: boolean;
  recurrence: RecurrenceValue;
  interval: number;
  byWeekDays: number[];
  recurrenceEnd: string | null;
  createdBy: string;
  occurrenceDate: string;
}

const INTERVAL_UNIT: Record<RecurrenceValue, string> = {
  NONE: "",
  DAILY: "dia(s)",
  WEEKLY: "semana(s)",
  MONTHLY: "mês(es)",
  YEARLY: "ano(s)",
};

export default function EventModal({
  editing,
  defaultDate,
  onClose,
  onSaved,
  onDeleted,
}: {
  editing?: Occurrence;
  defaultDate: Date;
  onClose: () => void;
  onSaved: () => void;
  onDeleted: () => void;
}) {
  const [title, setTitle] = useState(editing?.title ?? "");
  const [description, setDescription] = useState(editing?.description ?? "");
  const [type, setType] = useState<EventTypeValue>(editing?.type ?? "OUTRO");
  const [date, setDate] = useState(
    editing ? dateKeyFromISO(editing.date) : format(defaultDate, "yyyy-MM-dd")
  );
  const [allDay, setAllDay] = useState(editing?.allDay ?? true);
  const [time, setTime] = useState(editing?.time ?? "");
  const [recurrence, setRecurrence] = useState<RecurrenceValue>(
    editing?.recurrence ?? "NONE"
  );
  const [interval, setInterval] = useState(editing?.interval ?? 1);
  const [byWeekDays, setByWeekDays] = useState<number[]>(editing?.byWeekDays ?? []);
  const [recurrenceEnd, setRecurrenceEnd] = useState(
    editing?.recurrenceEnd ? dateKeyFromISO(editing.recurrenceEnd) : ""
  );
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggleWeekDay(day: number) {
    setByWeekDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort()
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const payload = {
        title,
        description,
        type,
        date,
        time: allDay ? null : time || null,
        allDay,
        recurrence,
        interval,
        byWeekDays: recurrence === "WEEKLY" ? byWeekDays : [],
        recurrenceEnd: recurrenceEnd || null,
      };

      const res = await fetch(
        editing ? `/api/events/${editing.id}` : "/api/events",
        {
          method: editing ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Erro ao salvar evento.");
        return;
      }

      onSaved();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!editing) return;
    if (!confirm("Excluir este evento? Se for recorrente, todas as ocorrências serão removidas.")) {
      return;
    }
    setDeleting(true);
    try {
      const res = await fetch(`/api/events/${editing.id}`, { method: "DELETE" });
      if (!res.ok) {
        setError("Erro ao excluir evento.");
        return;
      }
      onDeleted();
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-3"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-5 shadow-xl"
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-neutral-800">
            {editing ? "Editar evento" : "Novo evento"}
          </h3>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600"
            aria-label="Fechar"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">
              Título
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-rose-400 focus:ring-1 focus:ring-rose-400"
              placeholder="Ex: Tirar o lixo, Festa de aniversário..."
              autoFocus
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">
              Tipo de evento
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as EventTypeValue)}
              className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-rose-400 focus:ring-1 focus:ring-rose-400"
            >
              {EVENT_TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.emoji} {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-neutral-700">
                Data
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => {
                  const value = e.target.value;
                  setDate(value);
                  if (recurrence === "WEEKLY" && value) {
                    const [y, m, d] = value.split("-").map(Number);
                    const weekday = new Date(y, m - 1, d).getDay();
                    setByWeekDays((prev) =>
                      prev.includes(weekday) ? prev : [...prev, weekday].sort()
                    );
                  }
                }}
                required
                className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-rose-400 focus:ring-1 focus:ring-rose-400"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-neutral-700">
                Horário
              </label>
              <input
                type="time"
                value={time}
                disabled={allDay}
                onChange={(e) => setTime(e.target.value)}
                className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-rose-400 focus:ring-1 focus:ring-rose-400 disabled:bg-neutral-50 disabled:text-neutral-400"
              />
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm text-neutral-600">
            <input
              type="checkbox"
              checked={allDay}
              onChange={(e) => setAllDay(e.target.checked)}
              className="h-4 w-4 rounded border-neutral-300"
            />
            Dia inteiro (sem horário definido)
          </label>

          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">
              Repetir
            </label>
            <select
              value={recurrence}
              onChange={(e) => setRecurrence(e.target.value as RecurrenceValue)}
              className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-rose-400 focus:ring-1 focus:ring-rose-400"
            >
              {RECURRENCE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {recurrence !== "NONE" && (
            <div className="space-y-3 rounded-lg border border-neutral-100 bg-neutral-50 p-3">
              {editing && (
                <p className="text-xs text-neutral-500">
                  Isso é um evento recorrente: alterar aqui muda a série
                  inteira, não só esta ocorrência.
                </p>
              )}
              <div className="flex items-center gap-2 text-sm text-neutral-700">
                <span>A cada</span>
                <input
                  type="number"
                  min={1}
                  value={interval}
                  onChange={(e) => setInterval(Math.max(1, Number(e.target.value)))}
                  className="w-16 rounded-lg border border-neutral-200 px-2 py-1 text-sm outline-none focus:border-rose-400 focus:ring-1 focus:ring-rose-400"
                />
                <span>{INTERVAL_UNIT[recurrence]}</span>
              </div>

              {recurrence === "WEEKLY" && (
                <div>
                  <span className="mb-1 block text-xs font-medium text-neutral-500">
                    Dias da semana
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {WEEKDAYS.map((wd) => (
                      <button
                        type="button"
                        key={wd.value}
                        onClick={() => toggleWeekDay(wd.value)}
                        className={`rounded-full border px-2.5 py-1 text-xs font-medium transition ${
                          byWeekDays.includes(wd.value)
                            ? "border-rose-400 bg-rose-100 text-rose-700"
                            : "border-neutral-200 bg-white text-neutral-500 hover:bg-neutral-100"
                        }`}
                      >
                        {wd.short}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="mb-1 block text-xs font-medium text-neutral-500">
                  Repetir até (opcional)
                </label>
                <input
                  type="date"
                  value={recurrenceEnd}
                  onChange={(e) => setRecurrenceEnd(e.target.value)}
                  className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-rose-400 focus:ring-1 focus:ring-rose-400"
                />
              </div>
            </div>
          )}

          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">
              Descrição (opcional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-rose-400 focus:ring-1 focus:ring-rose-400"
            />
          </div>

          {error && (
            <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
            </p>
          )}

          <div className="flex items-center justify-between gap-2 pt-2">
            {editing ? (
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-60"
              >
                {deleting ? "Excluindo..." : "Excluir"}
              </button>
            ) : (
              <span />
            )}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-neutral-200 px-3 py-2 text-sm text-neutral-600 hover:bg-neutral-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-rose-500 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-600 disabled:opacity-60"
              >
                {saving ? "Salvando..." : "Salvar"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
