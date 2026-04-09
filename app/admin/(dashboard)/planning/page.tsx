import Link from "next/link";
import { getOccupancyCalendarData } from "@/server/booking-service";
import { formatDateFr } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { addDays, format, isSameDay } from "date-fns";

interface Props {
  searchParams: Promise<{ start?: string; days?: string }>;
}

function generateDays(start: Date, count: number): Date[] {
  return Array.from({ length: count }, (_, i) => addDays(start, i));
}

export default async function PlanningPage({ searchParams }: Props) {
  const params = await searchParams;
  const daysCount = Math.min(Number(params.days) || 14, 31);
  const startDate = params.start ? new Date(params.start) : new Date();
  startDate.setHours(0, 0, 0, 0);
  const endDate = addDays(startDate, daysCount);

  const { bookings, blocks, rooms } = await getOccupancyCalendarData(
    startDate,
    endDate
  );

  const days = generateDays(startDate, daysCount);

  const prevStart = format(addDays(startDate, -daysCount), "yyyy-MM-dd");
  const nextStart = format(addDays(startDate, daysCount), "yyyy-MM-dd");
  const todayStr = format(new Date(), "yyyy-MM-dd");

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-800">Planning</h1>
          <p className="text-sm text-stone-500">
            {formatDateFr(startDate)} — {formatDateFr(addDays(endDate, -1))}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/admin/planning?start=${todayStr}&days=${daysCount}`}
            className="rounded-md border border-stone-200 px-3 py-1.5 text-sm hover:bg-stone-50"
          >
            Aujourd&apos;hui
          </Link>
          <Link
            href={`/admin/planning?start=${prevStart}&days=${daysCount}`}
            className="rounded-md border border-stone-200 px-3 py-1.5 text-sm hover:bg-stone-50"
          >
            ← Précédent
          </Link>
          <Link
            href={`/admin/planning?start=${nextStart}&days=${daysCount}`}
            className="rounded-md border border-stone-200 px-3 py-1.5 text-sm hover:bg-stone-50"
          >
            Suivant →
          </Link>
          <span className="ml-2 text-xs text-stone-400">
            Affichage :
          </span>
          {[7, 14, 21, 31].map((d) => (
            <Link
              key={d}
              href={`/admin/planning?start=${format(startDate, "yyyy-MM-dd")}&days=${d}`}
              className={`rounded-md border px-2 py-1 text-xs ${daysCount === d ? "border-stone-600 bg-stone-600 text-white" : "border-stone-200 text-stone-600 hover:bg-stone-50"}`}
            >
              {d}j
            </Link>
          ))}
        </div>
      </div>

      <Card className="mt-6 overflow-x-auto">
        <table className="w-full min-w-max border-collapse text-xs">
          <thead>
            <tr>
              <th className="sticky left-0 z-10 border-b border-r border-stone-200 bg-white px-3 py-2 text-left font-medium text-stone-700 min-w-[140px]">
                Chambre
              </th>
              {days.map((d) => {
                const isToday = isSameDay(d, new Date());
                const dayOfWeek = d.getDay();
                const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
                return (
                  <th
                    key={d.toISOString()}
                    className={`border-b border-r border-stone-100 px-1.5 py-2 text-center font-normal min-w-[36px] ${isToday ? "bg-stone-800 text-white" : isWeekend ? "bg-stone-100 text-stone-600" : "text-stone-500"}`}
                  >
                    <div>{format(d, "dd")}</div>
                    <div className="text-[10px]">
                      {format(d, "EEE").slice(0, 2)}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {rooms.map((room) => {
              const roomBookings = bookings.filter(
                (b) => b.roomId === room.id
              );
              const roomBlocks = blocks.filter((b) => b.roomId === room.id);

              return (
                <tr key={room.id} className="border-b border-stone-50">
                  <td className="sticky left-0 z-10 border-r border-stone-200 bg-white px-3 py-1.5">
                    <div className="font-medium text-stone-800">
                      {room.number}
                    </div>
                    <div className="text-[10px] text-stone-400">
                      {room.roomType.name}
                    </div>
                  </td>
                  {days.map((day) => {
                    const booking = roomBookings.find(
                      (b) =>
                        day >= new Date(b.arrivalDate) &&
                        day < new Date(b.departureDate)
                    );
                    const block = roomBlocks.find(
                      (b) =>
                        day >= new Date(b.startDate) &&
                        day < new Date(b.endDate)
                    );

                    if (booking) {
                      const isArrival = isSameDay(
                        day,
                        new Date(booking.arrivalDate)
                      );
                      const statusColors: Record<string, string> = {
                        PENDING: "bg-amber-200 text-amber-900",
                        CONFIRMED: "bg-blue-200 text-blue-900",
                        CHECKED_IN: "bg-green-200 text-green-900",
                      };
                      const color =
                        statusColors[booking.status] ||
                        "bg-stone-200 text-stone-700";
                      return (
                        <td
                          key={day.toISOString()}
                          className={`border-r border-stone-50 px-0.5 py-1`}
                        >
                          <div
                            className={`rounded px-1 py-0.5 text-[10px] leading-tight ${color}`}
                            title={`${booking.guest?.lastName ?? "?"} — ${booking.status}`}
                          >
                            {isArrival
                              ? booking.guest?.lastName?.slice(0, 6) ?? "—"
                              : ""}
                          </div>
                        </td>
                      );
                    }

                    if (block) {
                      return (
                        <td
                          key={day.toISOString()}
                          className="border-r border-stone-50 px-0.5 py-1"
                        >
                          <div
                            className="rounded bg-red-100 px-1 py-0.5 text-[10px] text-red-700"
                            title={`Bloqué : ${block.reason}`}
                          >
                            ✕
                          </div>
                        </td>
                      );
                    }

                    return (
                      <td
                        key={day.toISOString()}
                        className="border-r border-stone-50 px-0.5 py-1"
                      >
                        <div className="h-4" />
                      </td>
                    );
                  })}
                </tr>
              );
            })}
            {rooms.length === 0 && (
              <tr>
                <td
                  colSpan={days.length + 1}
                  className="px-4 py-8 text-center text-stone-400"
                >
                  Aucune chambre active
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>

      <div className="mt-4 flex flex-wrap gap-4 text-xs text-stone-500">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded bg-amber-200" />
          En attente
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded bg-blue-200" />
          Confirmée
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded bg-green-200" />
          Arrivée
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded bg-red-100" />
          Bloquée
        </span>
      </div>
    </div>
  );
}
