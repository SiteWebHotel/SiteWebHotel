import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { hash } from "bcryptjs";

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  // Admin user
  const passwordHash = await hash("admin123", 12);
  await prisma.adminUser.upsert({
    where: { email: "admin@leclosfamilial.fr" },
    update: {},
    create: {
      email: "admin@leclosfamilial.fr",
      passwordHash,
      name: "Administrateur",
    },
  });
  console.log("Admin user created: admin@leclosfamilial.fr / admin123");

  // Hotel settings
  await prisma.hotelSettings.upsert({
    where: { id: "singleton" },
    update: {},
    create: {
      id: "singleton",
      name: "Hôtel Le Clos Familial",
      description:
        "Un hôtel familial au cœur de la Vallée de la Loire, idéalement situé pour découvrir les châteaux et la douceur de vivre tourangelle.",
      address: "12 Rue des Tilleuls",
      city: "Amboise",
      postalCode: "37400",
      country: "France",
      phone: "+33 2 47 00 00 00",
      email: "contact@leclosfamilial.fr",
      website: "https://www.leclosfamilial.fr",
      checkInTime: "15:00",
      checkOutTime: "11:00",
      latitude: 47.4133,
      longitude: 0.9821,
    },
  });

  // Amenities
  const amenityNames = [
    { name: "Wi-Fi", category: "Connectivité" },
    { name: "Climatisation", category: "Confort" },
    { name: "Salle de bain privée", category: "Confort" },
    { name: "Télévision", category: "Divertissement" },
    { name: "Sèche-cheveux", category: "Salle de bain" },
    { name: "Serviettes", category: "Salle de bain" },
    { name: "Bureau", category: "Espace de travail" },
    { name: "Coffre-fort", category: "Sécurité" },
    { name: "Bouilloire", category: "Confort" },
    { name: "Vue sur jardin", category: "Vue" },
  ];

  const amenities = await Promise.all(
    amenityNames.map((a) =>
      prisma.amenity.upsert({
        where: { name: a.name },
        update: {},
        create: a,
      })
    )
  );

  // Room types
  const chambreDouble = await prisma.roomType.upsert({
    where: { slug: "chambre-double" },
    update: {},
    create: {
      name: "Chambre Double",
      slug: "chambre-double",
      description:
        "Chambre confortable avec un lit double, idéale pour un couple. Décoration simple et soignée, salle de bain privée avec douche. Vue sur la cour intérieure ou le jardin.",
      shortDescription:
        "Chambre avec lit double, salle de bain privée, pour 2 personnes.",
      basePrice: 75,
      maxOccupancy: 2,
      bedType: "Lit double 160×200",
      surfaceArea: 18,
      displayOrder: 1,
    },
  });

  const chambreTriple = await prisma.roomType.upsert({
    where: { slug: "chambre-triple" },
    update: {},
    create: {
      name: "Chambre Triple",
      slug: "chambre-triple",
      description:
        "Chambre spacieuse pouvant accueillir jusqu'à 3 personnes. Lit double et lit simple, salle de bain privée. Idéale pour les familles ou les petits groupes.",
      shortDescription:
        "Chambre avec lit double + lit simple, pour 3 personnes.",
      basePrice: 95,
      maxOccupancy: 3,
      bedType: "Lit double 160×200 + lit simple",
      surfaceArea: 24,
      displayOrder: 2,
    },
  });

  const chambreFamiliale = await prisma.roomType.upsert({
    where: { slug: "chambre-familiale" },
    update: {},
    create: {
      name: "Chambre Familiale",
      slug: "chambre-familiale",
      description:
        "Notre chambre la plus grande, pensée pour les familles. Un espace avec lit double et deux lits simples, salle de bain avec baignoire. Ambiance calme et fonctionnelle.",
      shortDescription:
        "Grande chambre familiale pour 4 personnes, avec baignoire.",
      basePrice: 120,
      maxOccupancy: 4,
      bedType: "Lit double 160×200 + 2 lits simples",
      surfaceArea: 30,
      displayOrder: 3,
    },
  });

  // Link amenities to room types
  const commonAmenityNames = [
    "Wi-Fi",
    "Salle de bain privée",
    "Télévision",
    "Sèche-cheveux",
    "Serviettes",
  ];
  const commonAmenities = amenities.filter((a) =>
    commonAmenityNames.includes(a.name)
  );

  for (const rt of [chambreDouble, chambreTriple, chambreFamiliale]) {
    for (const amenity of commonAmenities) {
      await prisma.roomTypeAmenity.upsert({
        where: {
          roomTypeId_amenityId: {
            roomTypeId: rt.id,
            amenityId: amenity.id,
          },
        },
        update: {},
        create: { roomTypeId: rt.id, amenityId: amenity.id },
      });
    }
  }

  // Extra amenities for familiale
  const extraAmenities = amenities.filter((a) =>
    ["Climatisation", "Bouilloire"].includes(a.name)
  );
  for (const amenity of extraAmenities) {
    await prisma.roomTypeAmenity.upsert({
      where: {
        roomTypeId_amenityId: {
          roomTypeId: chambreFamiliale.id,
          amenityId: amenity.id,
        },
      },
      update: {},
      create: { roomTypeId: chambreFamiliale.id, amenityId: amenity.id },
    });
  }

  // Physical rooms
  const roomsData = [
    { number: "101", floor: 1, roomTypeId: chambreDouble.id },
    { number: "102", floor: 1, roomTypeId: chambreDouble.id },
    { number: "103", floor: 1, roomTypeId: chambreDouble.id },
    { number: "201", floor: 2, roomTypeId: chambreTriple.id },
    { number: "202", floor: 2, roomTypeId: chambreTriple.id },
    { number: "301", floor: 3, roomTypeId: chambreFamiliale.id },
    { number: "302", floor: 3, roomTypeId: chambreFamiliale.id },
  ];

  for (const room of roomsData) {
    await prisma.room.upsert({
      where: { number: room.number },
      update: {},
      create: room,
    });
  }

  console.log("Seed complete!");
  console.log("  - 1 admin user");
  console.log("  - 1 hotel settings");
  console.log("  - 10 amenities");
  console.log("  - 3 room types");
  console.log("  - 7 rooms");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
