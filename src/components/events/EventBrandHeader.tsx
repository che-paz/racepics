import Image from "next/image";
import type { EventBrand } from "@/lib/events/brands";

type Props = {
  brand: EventBrand;
};

/** Header branded: logo = nombre del evento (sin H1 duplicado). */
export default function EventBrandHeader({ brand }: Props) {
  return (
    <header className="border-b border-border/40">
      <div className="mx-auto flex max-w-4xl flex-col items-center px-4 py-10 text-center sm:py-12">
        <div className="mc-logo-frame relative w-full max-w-[240px] sm:max-w-[280px]">
          <Image
            src={brand.logoSrc}
            alt={brand.logoAlt}
            width={520}
            height={650}
            className="h-auto w-full bg-transparent"
            priority
          />
        </div>
        <p className="mc-display mt-5 text-xs text-muted-foreground sm:text-sm">
          {brand.tagline}
        </p>
      </div>
    </header>
  );
}
