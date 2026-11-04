import Link from "next/link";
import { site } from "@/lib/site";

const sections = [
  { href: "/photos", label: "Photography", ready: true },
  { href: "/writing", label: "Writing", ready: false },
  { href: "/resume", label: "Resume", ready: false },
];

export default function Home() {
  return (
    <main className="flex flex-1 flex-col justify-center px-6 py-16">
      <div className="mx-auto w-full max-w-xl">
        <h1 className="text-4xl font-semibold tracking-tight">{site.name}</h1>
        <p className="mt-3 text-lg text-neutral-500 dark:text-neutral-400">{site.tagline}</p>
        <nav className="mt-12 flex flex-col gap-1">
          {sections.map((s) =>
            s.ready ? (
              <Link
                key={s.href}
                href={s.href}
                className="group flex items-baseline justify-between rounded-lg py-3 text-2xl transition-colors hover:text-neutral-500 dark:hover:text-neutral-300"
              >
                <span>{s.label}</span>
                <span className="text-base text-neutral-400 transition-transform group-hover:translate-x-1">
                  →
                </span>
              </Link>
            ) : (
              <span
                key={s.href}
                className="flex items-baseline justify-between py-3 text-2xl text-neutral-400 dark:text-neutral-600"
              >
                <span>{s.label}</span>
                <span className="text-sm">soon</span>
              </span>
            ),
          )}
        </nav>
      </div>
    </main>
  );
}
