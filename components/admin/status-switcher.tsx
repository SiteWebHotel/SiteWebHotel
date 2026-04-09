"use client";

import { useOptimistic, useTransition } from "react";
import { cn } from "@/lib/utils";
import { changeBookingStatusAction } from "@/app/actions/booking-actions";

type BookingStatus =
  | "PENDING"
  | "CONFIRMED"
  | "CHECKED_IN"
  | "CHECKED_OUT"
  | "CANCELLED"
  | "NO_SHOW";

const allStatuses: BookingStatus[] = [
  "PENDING",
  "CONFIRMED",
  "CHECKED_IN",
  "CHECKED_OUT",
  "CANCELLED",
  "NO_SHOW",
];

const statusLabels: Record<BookingStatus, string> = {
  PENDING: "En attente",
  CONFIRMED: "Confirmée",
  CANCELLED: "Annulée",
  CHECKED_IN: "Arrivée",
  CHECKED_OUT: "Départ",
  NO_SHOW: "Absent",
};

const statusActiveStyles: Record<BookingStatus, string> = {
  PENDING: "bg-amber-100 text-amber-800 border-amber-300 ring-1 ring-amber-300",
  CONFIRMED: "bg-green-100 text-green-800 border-green-300 ring-1 ring-green-300",
  CHECKED_IN: "bg-blue-100 text-blue-800 border-blue-300 ring-1 ring-blue-300",
  CHECKED_OUT: "bg-stone-200 text-stone-800 border-stone-400 ring-1 ring-stone-400",
  CANCELLED: "bg-red-100 text-red-800 border-red-300 ring-1 ring-red-300",
  NO_SHOW: "bg-orange-100 text-orange-800 border-orange-300 ring-1 ring-orange-300",
};

interface StatusSwitcherProps {
  bookingId: string;
  currentStatus: BookingStatus;
}

export function StatusSwitcher({ bookingId, currentStatus }: StatusSwitcherProps) {
  const [optimisticStatus, setOptimisticStatus] = useOptimistic(currentStatus);
  const [, startTransition] = useTransition();

  function handleClick(newStatus: BookingStatus) {
    if (newStatus === optimisticStatus) return;

    startTransition(async () => {
      setOptimisticStatus(newStatus);
      await changeBookingStatusAction(bookingId, newStatus);
    });
  }

  return (
    <div className="flex flex-wrap gap-2">
      {allStatuses.map((s) => {
        const isCurrent = s === optimisticStatus;
        return (
          <button
            key={s}
            type="button"
            onClick={() => handleClick(s)}
            disabled={isCurrent}
            className={cn(
              "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
              isCurrent
                ? statusActiveStyles[s]
                : "border-stone-200 bg-white text-stone-600 hover:bg-stone-100"
            )}
          >
            {statusLabels[s]}
          </button>
        );
      })}
    </div>
  );
}
