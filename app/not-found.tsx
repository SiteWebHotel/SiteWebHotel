import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <h1 className="text-6xl font-bold text-stone-300">404</h1>
      <h2 className="mt-4 text-xl font-semibold text-stone-800">
        Page introuvable
      </h2>
      <p className="mt-2 text-stone-600">
        La page que vous cherchez n&apos;existe pas ou a été déplacée.
      </p>
      <Link href="/" className="mt-6">
        <Button>Retour à l&apos;accueil</Button>
      </Link>
    </div>
  );
}
