import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { getHotelSettings } from "@/server/hotel-service";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getHotelSettings();

  const headerData = {
    name: settings.name,
    phone: settings.phone,
  };

  const footerData = {
    name: settings.name,
    description: settings.description,
    address: settings.address,
    city: settings.city,
    postalCode: settings.postalCode,
    phone: settings.phone,
    email: settings.email,
  };

  return (
    <>
      <Header hotel={headerData} />
      <main className="flex-1">{children}</main>
      <Footer hotel={footerData} />
    </>
  );
}
