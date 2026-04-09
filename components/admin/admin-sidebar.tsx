"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  BedDouble,
  DoorOpen,
  Sparkles,
  CalendarDays,
  CalendarOff,
  Settings,
  LogOut,
  ImageIcon,
  DollarSign,
  BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/admin", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/admin/room-types", label: "Types de chambres", icon: BedDouble },
  { href: "/admin/rooms", label: "Chambres", icon: DoorOpen },
  { href: "/admin/amenities", label: "Équipements", icon: Sparkles },
  { href: "/admin/photos", label: "Photos", icon: ImageIcon },
  { href: "/admin/pricing", label: "Tarification", icon: DollarSign },
  { href: "/admin/bookings", label: "Réservations", icon: CalendarDays },
  { href: "/admin/blocks", label: "Blocages", icon: CalendarOff },
  { href: "/admin/planning", label: "Planning", icon: BarChart3 },
  { href: "/admin/settings", label: "Paramètres", icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-56 shrink-0 flex-col border-r border-stone-200 bg-white">
      <div className="border-b border-stone-100 px-4 py-4">
        <Link href="/admin" className="text-sm font-bold text-stone-800">
          Admin Hôtel
        </Link>
      </div>
      <nav className="flex-1 overflow-y-auto px-2 py-3">
        {links.map((link) => {
          const isActive =
            pathname === link.href ||
            (link.href !== "/admin" && pathname.startsWith(link.href));
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "mb-0.5 flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors",
                isActive
                  ? "bg-stone-100 font-medium text-stone-900"
                  : "text-stone-600 hover:bg-stone-50 hover:text-stone-900"
              )}
            >
              <link.icon className="h-4 w-4 shrink-0" />
              {link.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-stone-100 px-2 py-3">
        <button
          onClick={() => signOut({ callbackUrl: "/admin/login" })}
          className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm text-stone-600 hover:bg-stone-50 hover:text-stone-900"
        >
          <LogOut className="h-4 w-4" />
          Déconnexion
        </button>
        <Link
          href="/"
          className="mt-1 flex items-center gap-2.5 rounded-md px-3 py-2 text-xs text-stone-400 hover:text-stone-600"
        >
          ← Voir le site
        </Link>
      </div>
    </aside>
  );
}
