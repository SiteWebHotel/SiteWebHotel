import { cn } from "@/lib/utils";

const statusColors: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-800",
  CONFIRMED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
  CHECKED_IN: "bg-blue-100 text-blue-800",
  CHECKED_OUT: "bg-stone-100 text-stone-800",
  NO_SHOW: "bg-orange-100 text-orange-800",
  ACTIVE: "bg-green-100 text-green-800",
  MAINTENANCE: "bg-amber-100 text-amber-800",
  RETIRED: "bg-stone-100 text-stone-600",
};

const statusLabels: Record<string, string> = {
  PENDING: "En attente",
  CONFIRMED: "Confirmée",
  CANCELLED: "Annulée",
  CHECKED_IN: "Arrivée",
  CHECKED_OUT: "Départ",
  NO_SHOW: "No-show",
  ACTIVE: "Active",
  MAINTENANCE: "Maintenance",
  RETIRED: "Retirée",
};

interface BadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        statusColors[status] || "bg-stone-100 text-stone-800",
        className
      )}
    >
      {statusLabels[status] || status}
    </span>
  );
}
