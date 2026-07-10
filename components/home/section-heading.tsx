import Link from "next/link";

export function SectionHeading({
  eyebrow,
  title,
  href,
  linkLabel,
}: {
  eyebrow: string;
  title: string;
  href?: string;
  linkLabel?: string;
}) {
  return (
    <div className="mb-8 flex items-end justify-between gap-4">
      <div>
        <p className="text-xs tracking-[0.3em] text-muted-foreground uppercase">{eyebrow}</p>
        <h2 className="mt-2 font-serif text-3xl tracking-tight sm:text-4xl">{title}</h2>
      </div>
      {href && linkLabel && (
        <Link
          href={href}
          className="hidden shrink-0 text-xs tracking-[0.2em] text-muted-foreground uppercase underline-offset-4 hover:text-foreground hover:underline sm:block"
        >
          {linkLabel} →
        </Link>
      )}
    </div>
  );
}
