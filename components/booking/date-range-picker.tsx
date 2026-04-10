"use client";

import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface DateRangePickerProps {
  arrivalDate: string;
  departureDate: string;
  onArrivalChange: (date: string) => void;
  onDepartureChange: (date: string) => void;
  errorArrival?: string;
  errorDeparture?: string;
}

function toDateStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfWeek(year: number, month: number) {
  const d = new Date(year, month, 1).getDay();
  return d === 0 ? 6 : d - 1;
}

const MONTH_NAMES = [
  "Janvier",
  "Février",
  "Mars",
  "Avril",
  "Mai",
  "Juin",
  "Juillet",
  "Août",
  "Septembre",
  "Octobre",
  "Novembre",
  "Décembre",
];

const DAY_NAMES = ["Lu", "Ma", "Me", "Je", "Ve", "Sa", "Di"];

function MonthGrid({
  year,
  month,
  arrival,
  departure,
  selecting,
  today,
  onDayClick,
}: {
  year: number;
  month: number;
  arrival: Date | null;
  departure: Date | null;
  selecting: "arrival" | "departure";
  today: Date;
  onDayClick: (date: Date) => void;
}) {
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfWeek(year, month);
  const cells: (Date | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));

  return (
    <div className="flex-1 min-w-[260px]">
      <p className="mb-2 text-center text-sm font-semibold text-stone-800">
        {MONTH_NAMES[month]} {year}
      </p>
      <div className="grid grid-cols-7 gap-px text-center text-xs text-stone-400">
        {DAY_NAMES.map((d) => (
          <div key={d} className="py-1 font-medium">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-px">
        {cells.map((date, i) => {
          if (!date) {
            return <div key={`empty-${i}`} className="py-2" />;
          }

          const isPast = date < today && !isSameDay(date, today);
          const isArrival = arrival && isSameDay(date, arrival);
          const isDeparture = departure && isSameDay(date, departure);
          const isInRange =
            arrival && departure && date > arrival && date < departure;

          return (
            <button
              key={date.toISOString()}
              type="button"
              disabled={isPast}
              onClick={() => onDayClick(date)}
              className={cn(
                "py-2 text-center text-sm rounded-md transition-colors",
                isPast && "text-stone-300 cursor-not-allowed",
                !isPast &&
                  !isArrival &&
                  !isDeparture &&
                  !isInRange &&
                  "text-stone-700 hover:bg-stone-100",
                isInRange && "bg-stone-100 text-stone-800",
                isArrival &&
                  "bg-stone-800 text-white font-semibold rounded-r-none",
                isDeparture &&
                  "bg-stone-800 text-white font-semibold rounded-l-none",
                isArrival && isDeparture && "rounded-md"
              )}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function DateRangePicker({
  arrivalDate,
  departureDate,
  onArrivalChange,
  onDepartureChange,
  errorArrival,
  errorDeparture,
}: DateRangePickerProps) {
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const [baseMonth, setBaseMonth] = useState(() => ({
    year: today.getFullYear(),
    month: today.getMonth(),
  }));

  const [selecting, setSelecting] = useState<"arrival" | "departure">(
    "arrival"
  );

  const arrival = arrivalDate ? new Date(arrivalDate + "T00:00:00") : null;
  const departure = departureDate
    ? new Date(departureDate + "T00:00:00")
    : null;

  const nextMonth = {
    year: baseMonth.month === 11 ? baseMonth.year + 1 : baseMonth.year,
    month: baseMonth.month === 11 ? 0 : baseMonth.month + 1,
  };

  function goBack() {
    setBaseMonth((prev) => ({
      year: prev.month === 0 ? prev.year - 1 : prev.year,
      month: prev.month === 0 ? 11 : prev.month - 1,
    }));
  }

  function goForward() {
    setBaseMonth((prev) => ({
      year: prev.month === 11 ? prev.year + 1 : prev.year,
      month: prev.month === 11 ? 0 : prev.month + 1,
    }));
  }

  function handleDayClick(date: Date) {
    const dateStr = toDateStr(date);
    if (selecting === "arrival") {
      onArrivalChange(dateStr);
      if (departure && date >= departure) {
        onDepartureChange("");
      }
      setSelecting("departure");
    } else {
      if (arrival && date <= arrival) {
        onArrivalChange(dateStr);
        onDepartureChange("");
        setSelecting("departure");
      } else {
        onDepartureChange(dateStr);
        setSelecting("arrival");
      }
    }
  }

  const canGoBack =
    baseMonth.year > today.getFullYear() ||
    (baseMonth.year === today.getFullYear() &&
      baseMonth.month > today.getMonth());

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <button
          type="button"
          onClick={goBack}
          disabled={!canGoBack}
          className={cn(
            "rounded-md p-1.5 transition-colors",
            canGoBack
              ? "text-stone-600 hover:bg-stone-100"
              : "text-stone-300 cursor-not-allowed"
          )}
          aria-label="Mois précédent"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        <div className="flex gap-2 text-xs">
          <span
            className={cn(
              "rounded-full px-3 py-1 transition-colors",
              selecting === "arrival"
                ? "bg-stone-800 text-white"
                : "bg-stone-100 text-stone-600"
            )}
          >
            Arrivée{arrival ? ` : ${arrivalDate}` : ""}
          </span>
          <span
            className={cn(
              "rounded-full px-3 py-1 transition-colors",
              selecting === "departure"
                ? "bg-stone-800 text-white"
                : "bg-stone-100 text-stone-600"
            )}
          >
            Départ{departure ? ` : ${departureDate}` : ""}
          </span>
        </div>

        <button
          type="button"
          onClick={goForward}
          className="rounded-md p-1.5 text-stone-600 hover:bg-stone-100"
          aria-label="Mois suivant"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      <div className="flex flex-col gap-6 sm:flex-row sm:gap-8">
        <MonthGrid
          year={baseMonth.year}
          month={baseMonth.month}
          arrival={arrival}
          departure={departure}
          selecting={selecting}
          today={today}
          onDayClick={handleDayClick}
        />
        <MonthGrid
          year={nextMonth.year}
          month={nextMonth.month}
          arrival={arrival}
          departure={departure}
          selecting={selecting}
          today={today}
          onDayClick={handleDayClick}
        />
      </div>

      {(errorArrival || errorDeparture) && (
        <div className="mt-2 space-y-1">
          {errorArrival && (
            <p className="text-xs text-red-600">{errorArrival}</p>
          )}
          {errorDeparture && (
            <p className="text-xs text-red-600">{errorDeparture}</p>
          )}
        </div>
      )}
    </div>
  );
}
