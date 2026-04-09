"use client";

import { Button } from "@/components/ui/button";

export default function ErrorPage({
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center px-4 text-center">
      <h2 className="text-xl font-semibold text-stone-800">
        Une erreur est survenue
      </h2>
      <p className="mt-2 text-stone-600">
        Nous sommes désolés, quelque chose s&apos;est mal passé.
      </p>
      <Button onClick={reset} className="mt-4">
        Réessayer
      </Button>
    </div>
  );
}
