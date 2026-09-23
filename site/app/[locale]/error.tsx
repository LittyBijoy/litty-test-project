'use client';

export default function LocaleError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <h2 className="text-xl font-semibold">Something went wrong</h2>
      <p className="text-charcoal-light">Please try again, or head back to the homepage.</p>
      <button onClick={() => reset()} className="rounded-full bg-terra px-5 py-2 text-white hover:bg-terra-dark">
        Try again
      </button>
    </div>
  );
}
