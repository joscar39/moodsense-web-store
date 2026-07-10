"use client";

import Image from "next/image";
import { useState } from "react";

type GalleryImage = { url: string; alt: string };

export function ProductGallery({ images, name }: { images: GalleryImage[]; name: string }) {
  const [selected, setSelected] = useState(0);
  const active = images[selected];

  if (!active) {
    return (
      <div className="flex aspect-[3/4] items-center justify-center bg-secondary text-xs tracking-[0.2em] text-muted-foreground uppercase">
        Sin imagen
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="relative aspect-[3/4] overflow-hidden bg-secondary">
        <Image
          src={active.url}
          alt={active.alt}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover"
        />
      </div>
      {images.length > 1 && (
        <div className="flex gap-2" role="tablist" aria-label={`Imágenes de ${name}`}>
          {images.map((image, index) => (
            <button
              key={image.url}
              type="button"
              role="tab"
              aria-selected={index === selected}
              aria-label={`Imagen ${index + 1}`}
              onClick={() => setSelected(index)}
              className={`relative aspect-[3/4] w-20 overflow-hidden border bg-secondary transition-opacity ${
                index === selected
                  ? "border-foreground"
                  : "border-transparent opacity-60 hover:opacity-100"
              }`}
            >
              <Image src={image.url} alt="" fill sizes="80px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
