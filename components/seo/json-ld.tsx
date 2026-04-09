import { SITE_URL } from "@/lib/hotel-config";

interface JsonLdProps {
  hotel: {
    name: string;
    description: string;
    phone: string;
    email: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
    checkInTime: string;
    checkOutTime: string;
  };
}

export function JsonLd({ hotel }: JsonLdProps) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Hotel",
    name: hotel.name,
    description: hotel.description,
    url: SITE_URL,
    telephone: hotel.phone,
    email: hotel.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: hotel.address,
      addressLocality: hotel.city,
      postalCode: hotel.postalCode,
      addressCountry: hotel.country,
    },
    checkinTime: hotel.checkInTime,
    checkoutTime: hotel.checkOutTime,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
