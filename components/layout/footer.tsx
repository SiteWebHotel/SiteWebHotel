import Link from "next/link";
import { MapPin, Phone, Mail } from "lucide-react";

interface FooterProps {
  hotel: {
    name: string;
    description: string;
    address: string;
    city: string;
    postalCode: string;
    phone: string;
    email: string;
  };
}

export function Footer({ hotel }: FooterProps) {
  return (
    <footer className="border-t border-stone-200 bg-stone-50">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <h3 className="mb-3 font-semibold text-stone-800">{hotel.name}</h3>
          <p className="text-sm leading-relaxed text-stone-600">
            {hotel.description}
          </p>
        </div>

        <div>
          <h3 className="mb-3 font-semibold text-stone-800">Contact</h3>
          <ul className="space-y-2 text-sm text-stone-600">
            <li className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
              <span>
                {hotel.address}
                <br />
                {hotel.postalCode} {hotel.city}
              </span>
            </li>
            <li className="flex items-center gap-2">
              <Phone className="h-4 w-4 shrink-0" />
              <a
                href={`tel:${hotel.phone}`}
                className="hover:text-stone-900"
              >
                {hotel.phone}
              </a>
            </li>
            <li className="flex items-center gap-2">
              <Mail className="h-4 w-4 shrink-0" />
              <a
                href={`mailto:${hotel.email}`}
                className="hover:text-stone-900"
              >
                {hotel.email}
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="mb-3 font-semibold text-stone-800">Liens utiles</h3>
          <ul className="space-y-2 text-sm text-stone-600">
            <li>
              <Link href="/chambres" className="hover:text-stone-900">
                Nos chambres
              </Link>
            </li>
            <li>
              <Link href="/reservation" className="hover:text-stone-900">
                Réserver
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-stone-900">
                Contact
              </Link>
            </li>
            <li>
              <Link href="/mentions-legales" className="hover:text-stone-900">
                Mentions légales
              </Link>
            </li>
            <li>
              <Link
                href="/politique-confidentialite"
                className="hover:text-stone-900"
              >
                Confidentialité
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-stone-200 px-4 py-4 text-center text-xs text-stone-500">
        © {new Date().getFullYear()} {hotel.name}. Tous droits réservés.
      </div>
    </footer>
  );
}
