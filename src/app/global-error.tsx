"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="es">
      <body className="flex min-h-screen flex-col items-center justify-center gap-4 p-4 font-sans">
        <h1 className="text-xl font-bold">Error crítico</h1>
        <p className="max-w-md text-center text-sm text-gray-600">
          {error.message || "No se pudo cargar la aplicación."}
        </p>
        <button
          type="button"
          onClick={() => reset()}
          className="rounded-md bg-black px-4 py-2 text-sm text-white"
        >
          Reintentar
        </button>
      </body>
    </html>
  );
}
