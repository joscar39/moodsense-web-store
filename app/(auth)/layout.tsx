import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <Link href="/" className="mb-10 font-serif text-3xl font-medium tracking-tight">
        Mood <span className="italic">Sense</span>
      </Link>
      <div className="w-full max-w-sm">{children}</div>
      <p className="mt-10 text-xs tracking-[0.25em] text-muted-foreground uppercase">
        Wear your vibe. Make the match.
      </p>
    </div>
  );
}
