import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-ink-950 px-6 text-center text-ivory-50">
      <p className="eyebrow text-chili-300">404</p>
      <h1 className="mt-4 font-display text-5xl">That page went cold.</h1>
      <p className="mt-4 max-w-md text-ivory-100/70">The page you&apos;re looking for isn&apos;t on the menu. Head back to the grill.</p>
      <Link href="/" className="mt-8 rounded-full bg-chili-600 px-6 py-3 font-semibold text-ivory-50 hover:bg-chili-500">
        Back home
      </Link>
    </main>
  );
}
