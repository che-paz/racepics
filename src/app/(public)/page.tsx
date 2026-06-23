import type { Metadata } from "next";
import Link from "next/link";
import {
  Camera,
  Search,
  Trophy,
  Upload,
  Zap,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { APP_NAME, createPublicMetadata } from "@/lib/seo";

export const metadata: Metadata = createPublicMetadata({
  title: `${APP_NAME} — Tus fotos de carrera en segundos`,
  description:
    "Plataforma para organizadores, fotógrafos y corredores. Sube miles de fotos, busca tu dorsal y descarga solo tus imágenes.",
  path: "/",
});

const features = [
  {
    icon: Trophy,
    title: "Organizadores",
    description:
      "Crea el evento, configura dorsales e invita fotógrafos. Publica el enlace para corredores.",
  },
  {
    icon: Camera,
    title: "Fotógrafos",
    description:
      "Sube lotes de fotos con drag & drop. El OCR indexa dorsales automáticamente.",
  },
  {
    icon: Search,
    title: "Corredores",
    description:
      "Introduce tu bib y ve solo tus fotos. Descarga con watermark en un clic.",
  },
];

const steps = [
  { icon: Upload, label: "Sube fotos" },
  { icon: Zap, label: "OCR automático" },
  { icon: Search, label: "Busca tu dorsal" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <span className="text-lg font-bold">{APP_NAME}</span>
          <nav className="flex items-center gap-3 text-sm">
            <Link
              href="/login"
              className="text-muted-foreground hover:text-foreground"
            >
              Iniciar sesión
            </Link>
            <Link href="/register" className={cn(buttonVariants({ size: "sm" }))}>
              Registrarse
            </Link>
          </nav>
        </div>
      </header>

      <main>
        <section className="mx-auto max-w-5xl px-4 py-16 text-center sm:py-24">
          <h1 className="text-balance text-4xl font-bold tracking-tight sm:text-5xl">
            Tus fotos de carrera,
            <br />
            <span className="text-muted-foreground">en segundos</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-balance text-lg text-muted-foreground">
            Los fotógrafos suben miles de fotos. Los corredores buscan su número
            de dorsal y ven solo las suyas. Sin scroll infinito, sin perder tiempo.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/register" className={cn(buttonVariants({ size: "lg" }))}>
              Crear evento
            </Link>
            <Link
              href="/login"
              className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
            >
              Ya tengo cuenta
            </Link>
          </div>
        </section>

        <section className="border-y bg-muted/30">
          <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-8 px-4 py-10">
            {steps.map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-2 text-sm font-medium text-muted-foreground"
              >
                <Icon className="size-4" aria-hidden />
                {label}
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-4 py-16 sm:py-20">
          <h2 className="text-center text-2xl font-semibold tracking-tight">
            Para cada actor del evento
          </h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {features.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="rounded-xl border bg-card p-6 text-card-foreground"
              >
                <Icon
                  className="mb-4 size-8 text-muted-foreground"
                  aria-hidden
                />
                <h3 className="font-semibold">{title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section id="corredores" className="border-t bg-muted/20">
          <div className="mx-auto max-w-5xl px-4 py-16 text-center">
            <h2 className="text-2xl font-semibold tracking-tight">
              ¿Eres corredor?
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-muted-foreground">
              El organizador de tu carrera te compartirá un enlace como{" "}
              <code className="rounded bg-muted px-1.5 py-0.5 text-sm">
                racepics.app/e/mi-carrera
              </code>
              . Ahí introduces tu dorsal y listo.
            </p>
          </div>
        </section>
      </main>

      <footer className="border-t">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-6 text-sm text-muted-foreground">
          <span>{APP_NAME}</span>
          <Link href="/login" className="hover:text-foreground">
            Acceso organizadores y fotógrafos
          </Link>
        </div>
      </footer>
    </div>
  );
}
