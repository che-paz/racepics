import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Oswald } from "next/font/google";
import { Lock } from "lucide-react";
import BibSearch from "@/components/events/BibSearch";
import EventBrandHeader from "@/components/events/EventBrandHeader";
import PhotoGrid from "@/components/photos/PhotoGrid";
import EmptyState from "@/components/shared/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { getEventBrand } from "@/lib/events/brands";
import {
  getEventBySlug,
  searchPhotosByBib,
} from "@/lib/photos/bib-search";
import { enforceBibSearchRateLimit } from "@/lib/photos/bib-search-rate-limit";
import { getSharePhotoContext } from "@/lib/photos/share-metadata";
import { buildPhotoShareText } from "@/lib/photos/share";
import { appUrl, createPublicMetadata } from "@/lib/seo";
import "@/styles/brands/montecristo.css";

const montecristoDisplay = Oswald({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-montecristo-display",
  display: "swap",
});

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ bib?: string; photo?: string }>;
};

export async function generateMetadata({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { bib: bibParam, photo: photoParam } = await searchParams;
  const event = await getEventBySlug(slug);
  const brand = getEventBrand(slug);

  if (!event) {
    return createPublicMetadata({
      title: "Evento no encontrado — RacePics",
      description: "Este evento no existe o ya no está disponible.",
      path: `/e/${slug}`,
    });
  }

  const parsedBib = bibParam ? parseInt(bibParam, 10) : NaN;
  const hasPhotoShare =
    photoParam &&
    !Number.isNaN(parsedBib) &&
    parsedBib >= event.bib_min &&
    parsedBib <= event.bib_max;

  if (hasPhotoShare && event.status === "active") {
    const shareContext = await getSharePhotoContext({
      eventId: event.id,
      eventSlug: slug,
      eventName: event.name,
      photoId: photoParam,
      bib: parsedBib,
    });

    if (shareContext) {
      const path = `/e/${slug}?bib=${parsedBib}&photo=${photoParam}`;
      const title = event.name;
      const description = buildPhotoShareText(event.name);
      const imageUrl = appUrl(`/api/photos/${photoParam}/og?bib=${parsedBib}`);

      return createPublicMetadata({
        title,
        description,
        path,
        imageUrl,
      });
    }
  }

  return createPublicMetadata({
    title: brand ? event.name : `${event.name} — RacePics`,
    description: `Busca tu dorsal y descarga tus fotos de ${event.name}.`,
    path: `/e/${slug}`,
  });
}

export default async function EventPublicPage({
  params,
  searchParams,
}: PageProps) {
  const { slug } = await params;
  const { bib: bibParam, photo: photoParam } = await searchParams;

  const event = await getEventBySlug(slug);
  if (!event) {
    notFound();
  }

  const brand = getEventBrand(slug);
  const isPublic = event.status === "active";

  let bibNumber: number | null = null;
  let photos: Awaited<ReturnType<typeof searchPhotosByBib>> = [];
  let rateLimitMessage: string | null = null;
  let formBib: number | null = null;

  if (isPublic && bibParam) {
    const parsed = parseInt(bibParam, 10);
    if (
      !Number.isNaN(parsed) &&
      parsed >= event.bib_min &&
      parsed <= event.bib_max
    ) {
      formBib = parsed;
      const rate = await enforceBibSearchRateLimit(event.id, parsed);
      if (!rate.allowed) {
        rateLimitMessage = rate.message;
      } else {
        bibNumber = parsed;
        photos = await searchPhotosByBib(event.id, parsed);
      }
    }
  }

  const shellClass = brand
    ? `${brand.themeClass} ${montecristoDisplay.variable} min-h-screen`
    : "min-h-screen bg-background";

  return (
    <div className={shellClass}>
      {brand ? (
        <EventBrandHeader brand={brand} />
      ) : (
        <header className="border-b">
          <div className="mx-auto max-w-4xl px-4 py-8">
            <p className="text-sm text-muted-foreground">RacePics</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight">
              {event.name}
            </h1>
            {event.date ? (
              <p className="mt-1 text-sm text-muted-foreground">
                {new Date(event.date).toLocaleDateString("es-ES", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            ) : null}
          </div>
        </header>
      )}

      <main className="mx-auto max-w-4xl space-y-8 px-4 py-8">
        {!isPublic ? (
          <EmptyState
            icon={Lock}
            title="Este evento aún no está publicado"
            description={
              event.status === "draft"
                ? "El organizador debe activarlo en el panel antes de que los corredores puedan buscar fotos."
                : "Este evento ya no está disponible."
            }
          />
        ) : (
          <>
            <Suspense
              fallback={
                <div className="rounded-xl border p-6 space-y-4">
                  <Skeleton className="h-6 w-40" />
                  <Skeleton className="h-4 w-72" />
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Skeleton className="h-10 w-full sm:max-w-xs" />
                    <Skeleton className="h-10 w-24" />
                  </div>
                </div>
              }
            >
              <BibSearch
                bibMin={event.bib_min}
                bibMax={event.bib_max}
                initialBib={formBib}
                rateLimitMessage={rateLimitMessage}
                variant={brand ? "branded" : "default"}
              />
            </Suspense>

            {bibNumber !== null ? (
              <PhotoGrid
                photos={photos}
                bib={bibNumber}
                eventSlug={slug}
                eventName={event.name}
                initialPhotoId={photoParam ?? null}
              />
            ) : null}
          </>
        )}
      </main>
    </div>
  );
}
