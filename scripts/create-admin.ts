/**
 * Crée un utilisateur admin (email + mot de passe hashé bcrypt).
 *
 * Usage (PowerShell) :
 *   npx tsx scripts/create-admin.ts "parent@example.com" "MotDePasseSûr" "Prénom Nom"
 *
 * Ou avec npm :
 *   npm run db:create-admin -- "parent@example.com" "MotDePasseSûr" "Prénom Nom"
 *
 * Nécessite DATABASE_URL dans .env (même base que le site).
 */
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { hash } from "bcryptjs";

const email = process.argv[2];
const password = process.argv[3];
const name = process.argv[4] ?? undefined;

if (!email || !password) {
  console.error(
    "Usage: npx tsx scripts/create-admin.ts <email> <mot_de_passe> [nom_affichage]"
  );
  process.exit(1);
}

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const passwordHash = await hash(password, 12);
  const user = await prisma.adminUser.create({
    data: {
      email: email.toLowerCase().trim(),
      passwordHash,
      name: name?.trim() || null,
    },
  });
  console.log("Compte admin créé :");
  console.log("  Email :", user.email);
  console.log("  Nom   :", user.name ?? "(non renseigné)");
  console.log("  Id    :", user.id);
}

main()
  .catch((e) => {
    if (e?.code === "P2002") {
      console.error("Erreur : cet email est déjà utilisé par un autre admin.");
    } else {
      console.error(e);
    }
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
