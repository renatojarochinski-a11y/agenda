"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  addDays,
  addMonths,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { getEventTypeMeta, USER_COLORS } from "@/lib/eventTypes";
import EventModal, { type Occurrence } from "@/components/EventModal";

const WEEKDAY_LABELS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export default function CalendarApp({ currentUser }: { currentUser: string }) {
  const router = useRouter();
  const [currentMonth, setCurrentMonth] = useState(() => startOfMonth(new Date()));
  const [occurrences, setOccurrences] = useState<Occurrence[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modal, setModal] = useState<
    { open: false } | { open: true; editing?: Occurrence; defaultDate: Date }
  >({ open: false });

  const gridStart = useMemo(
    () => startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 0 }),
    [currentMonth]
  );
  const gridEnd = useMemo(
    () => endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 0 }),
    [currentMonth]
  );

  const days = useMemo(() => {
    const arr: Date[] = [];
    let d = gridStart;
    while (d <= gridEnd) {
      arr.push(d);
      d = addDays(d, 1);
    }
    return arr;
  }, [gridStart, gridEnd]);

  const loadEvents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        start: gridStart.toISOString(),
        end: gridEnd.toISOString(),
      });
      const res = await fetch(`/api/events?${params}`);
      if (!res.ok) throw new Error("Falha ao carregar eventos.");
      const data = await res.json();
      setOccurrences(data.occurrences);
    } catch {
      setError("Não foi possível carregar os eventos.");
    } finally {
      setLoading(false);
    }
  }, [gridStart, gridEnd]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch on mount/month change
    loadEvents();
  }, [loadEvents]);

  const occurrencesByDay = useMemo(() => {
    const map = new Map<string, Occurrence[]>();
    for (const occ of occurrences) {
      const key = format(new Date(occ.occurrenceDate), "yyyy-MM-dd");
      const list = map.get(key) ?? [];
      list.push(occ);
      map.set(key, list);
    }
    return map;
  }, [occurrences]);

  async function handleLogout() {
    await fetch("/api/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-3 py-4 sm:px-6 sm:py-8">
      <header className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold text-neutral-800 sm:text-xl">
            🗓️ Agenda Renato & Nicole
          </h1>
          <p className="text-sm text-neutral-500">
            Olá,{" "}
            <span
              className={`font-medium ${
                currentUser === "Renato" ? "text-sky-600" : "text-fuchsia-600"
              }`}
            >
              {currentUser}
            </span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() =>
              setModal({ open: true, defaultDate: new Date() })
            }
            className="rounded-lg bg-rose-500 px-3 py-2 text-sm font-semibold text-white hover:bg-rose-600"
          >
            + Novo evento
          </button>
          <button
            onClick={handleLogout}
            className="rounded-lg border border-neutral-200 px-3 py-2 text-sm text-neutral-600 hover:bg-neutral-50"
          >
            Sair
          </button>
        </div>
      </header>

      <div className="mb-3 flex flex-col items-center gap-2 sm:flex-row sm:justify-between">
        <h2 className="order-1 text-base font-medium capitalize text-neutral-700 sm:order-2 sm:text-lg">
          {format(currentMonth, "MMMM 'de' yyyy", { locale: ptBR })}
        </h2>
        <div className="order-2 flex items-center gap-1 sm:order-1">
          <button
            onClick={() => setCurrentMonth((m) => subMonths(m, 1))}
            className="rounded-lg border border-neutral-200 px-2.5 py-1.5 text-sm hover:bg-neutral-50"
            aria-label="Mês anterior"
          >
            ‹
          </button>
          <button
            onClick={() => setCurrentMonth(startOfMonth(new Date()))}
            className="rounded-lg border border-neutral-200 px-3 py-1.5 text-sm hover:bg-neutral-50"
          >
            Hoje
          </button>
          <button
            onClick={() => setCurrentMonth((m) => addMonths(m, 1))}
            className="rounded-lg border border-neutral-200 px-2.5 py-1.5 text-sm hover:bg-neutral-50"
            aria-label="Próximo mês"
          >
            ›
          </button>
        </div>
        <div className="order-3 hidden w-[104px] sm:block" />
      </div>

      {error && (
        <p className="mb-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
          {error}
        </p>
      )}

      <div className="grid grid-cols-7 overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
        {WEEKDAY_LABELS.map((label) => (
          <div
            key={label}
            className="border-b border-neutral-200 bg-neutral-50 py-2 text-center text-xs font-medium text-neutral-500"
          >
            {label}
          </div>
        ))}

        {days.map((day) => {
          const key = format(day, "yyyy-MM-dd");
          const dayOccurrences = occurrencesByDay.get(key) ?? [];
          const inMonth = isSameMonth(day, currentMonth);
          const today = isToday(day);
          const hasEvents = inMonth && dayOccurrences.length > 0;

          if (!inMonth) {
            return (
              <div
                key={key}
                className="min-h-[68px] border-b border-r border-neutral-100 bg-neutral-50/40 sm:min-h-[120px]"
              />
            );
          }

          return (
            <div
              key={key}
              onClick={() => setModal({ open: true, defaultDate: day })}
              className={`min-h-[68px] cursor-pointer border-b border-r border-neutral-100 p-1 transition hover:bg-rose-50/40 sm:min-h-[120px] sm:p-2 ${
                hasEvents ? "bg-amber-50/70" : "bg-white"
              }`}
            >
              <div
                className={`mb-1 inline-flex h-5 w-5 items-center justify-center rounded-full text-[11px] sm:h-6 sm:w-6 sm:text-xs ${
                  today
                    ? "bg-rose-500 font-semibold text-white"
                    : "text-neutral-700"
                }`}
              >
                {format(day, "d")}
              </div>
              <div className="flex flex-col gap-0.5 sm:gap-1">
                {dayOccurrences.slice(0, 3).map((occ) => {
                  const meta = getEventTypeMeta(occ.type);
                  return (
                    <button
                      key={`${occ.id}-${occ.occurrenceDate}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setModal({
                          open: true,
                          editing: occ,
                          defaultDate: new Date(occ.occurrenceDate),
                        });
                      }}
                      className={`truncate rounded border px-1 py-0.5 text-left text-[10px] ring-1 ring-inset sm:text-[11px] ${meta.color} ${
                        USER_COLORS[occ.createdBy] ?? ""
                      }`}
                      title={`${occ.title} (${occ.createdBy})`}
                    >
                      <span className="hidden sm:inline">{meta.emoji} </span>
                      {occ.time ? `${occ.time} ` : ""}
                      {occ.title}
                    </button>
                  );
                })}
                {dayOccurrences.length > 3 && (
                  <span className="text-[10px] text-neutral-400">
                    +{dayOccurrences.length - 3} mais
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {loading && (
        <p className="mt-3 text-center text-xs text-neutral-400">
          Carregando eventos...
        </p>
      )}

      <p className="mt-4 text-center text-xs text-neutral-400">
        Dica: clique em um dia para adicionar um evento, ou em um evento para editá-lo.
      </p>

      {modal.open && (
        <EventModal
          editing={modal.editing}
          defaultDate={modal.defaultDate}
          onClose={() => setModal({ open: false })}
          onSaved={() => {
            setModal({ open: false });
            loadEvents();
          }}
          onDeleted={() => {
            setModal({ open: false });
            loadEvents();
          }}
        />
      )}
    </div>
  );
}
