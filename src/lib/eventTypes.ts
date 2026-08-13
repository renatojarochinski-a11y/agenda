export const EVENT_TYPE_OPTIONS = [
  { value: "FESTA", label: "Festa / evento especial", emoji: "🎉", color: "bg-pink-100 text-pink-800 border-pink-300" },
  { value: "FIXO", label: "Compromisso fixo", emoji: "📌", color: "bg-blue-100 text-blue-800 border-blue-300" },
  { value: "TAREFA", label: "Tarefa doméstica", emoji: "🧹", color: "bg-emerald-100 text-emerald-800 border-emerald-300" },
  { value: "ANIVERSARIO", label: "Aniversário", emoji: "🎂", color: "bg-amber-100 text-amber-800 border-amber-300" },
  { value: "OUTRO", label: "Outro", emoji: "📅", color: "bg-neutral-100 text-neutral-700 border-neutral-300" },
] as const;

export type EventTypeValue = (typeof EVENT_TYPE_OPTIONS)[number]["value"];

export function getEventTypeMeta(type: string) {
  return EVENT_TYPE_OPTIONS.find((t) => t.value === type) ?? EVENT_TYPE_OPTIONS[4];
}

export const RECURRENCE_OPTIONS = [
  { value: "NONE", label: "Não se repete (pontual)" },
  { value: "DAILY", label: "Diariamente" },
  { value: "WEEKLY", label: "Semanalmente (escolha os dias)" },
  { value: "MONTHLY", label: "Mensalmente" },
  { value: "YEARLY", label: "Anualmente" },
] as const;

export type RecurrenceValue = (typeof RECURRENCE_OPTIONS)[number]["value"];

export const WEEKDAYS = [
  { value: 0, short: "Dom", label: "Domingo" },
  { value: 1, short: "Seg", label: "Segunda" },
  { value: 2, short: "Ter", label: "Terça" },
  { value: 3, short: "Qua", label: "Quarta" },
  { value: 4, short: "Qui", label: "Quinta" },
  { value: 5, short: "Sex", label: "Sexta" },
  { value: 6, short: "Sáb", label: "Sábado" },
] as const;

export const USER_COLORS: Record<string, string> = {
  Renato: "ring-sky-400",
  Nicole: "ring-fuchsia-400",
};
