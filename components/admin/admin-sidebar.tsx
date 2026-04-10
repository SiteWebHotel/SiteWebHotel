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
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

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

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <>
      <div className="border-b border-stone-100 px-4 py-4">
        <Link
          href="/admin"
          onClick={onNavigate}
          className="text-sm font-bold text-stone-800"
        >
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
              onClick={onNavigate}
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
          onClick={onNavigate}
          className="mt-1 flex items-center gap-2.5 rounded-md px-3 py-2 text-xs text-stone-400 hover:text-stone-600"
        >
          ← Voir le site
        </Link>
      </div>
    </>
  );
}

export function AdminSidebar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Mobile top bar */}
      <div className="fixed top-0 left-0 right-0 z-40 flex h-14 items-center border-b border-stone-200 bg-white px-4 md:hidden">
        <button
          onClick={() => setOpen(true)}
          className="rounded-md p-2.5 text-stone-600 hover:bg-stone-100"
          aria-label="Ouvrir le menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <span className="ml-3 text-sm font-bold text-stone-800">
          Admin Hôtel
        </span>
      </div>

      {/* Mobile drawer overlay */}
      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/40 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-white shadow-lg transition-transform duration-200 md:hidden",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-end px-3 pt-3">
          <button
            onClick={() => setOpen(false)}
            className="rounded-md p-2 text-stone-500 hover:bg-stone-100"
            aria-label="Fermer le menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <SidebarContent onNavigate={() => setOpen(false)} />
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden h-screen w-56 shrink-0 flex-col border-r border-stone-200 bg-white md:flex">
        <SidebarContent />
      </aside>
    </>
  );
}
