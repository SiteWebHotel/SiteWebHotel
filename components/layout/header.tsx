"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, Phone } from "lucide-react";

const navLinks = [
  { href: "/", label: "Accueil" },
  { href: "/chambres", label: "Nos chambres" },
  { href: "/reservation", label: "Réserver" },
  { href: "/contact", label: "Contact" },
];

interface HeaderProps {
  hotel: {
    name: string;
    phone: string;
  };
}

export function Header({ hotel }: HeaderProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-stone-200 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-lg font-semibold text-stone-800">
          {hotel.name}
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-stone-600 transition-colors hover:text-stone-900"
            >
              {link.label}
            </Link>
          ))}
          <a
            href={`tel:${hotel.phone}`}
            className="flex items-center gap-1.5 text-sm text-stone-600 hover:text-stone-900"
          >
            <Phone className="h-4 w-4" />
            <span className="hidden lg:inline">{hotel.phone}</span>
          </a>
        </nav>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="rounded-md p-2.5 text-stone-600 hover:bg-stone-100 md:hidden"
          aria-label="Menu"
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {isOpen && (
        <nav className="border-t border-stone-100 bg-white px-4 pb-4 pt-2 md:hidden">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className="block py-2 text-sm text-stone-700 hover:text-stone-900"
            >
              {link.label}
            </Link>
          ))}
          <a
            href={`tel:${hotel.phone}`}
            className="flex items-center gap-1.5 py-2 text-sm text-stone-600"
          >
            <Phone className="h-4 w-4" />
            {hotel.phone}
          </a>
        </nav>
      )}
    </header>
  );
}
