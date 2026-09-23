'use client';

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html>
      <body className="flex min-h-screen items-center justify-center bg-cream text-charcoal">
        <div className="text-center">
          <h2 className="text-xl font-semibold">Something went wrong</h2>
          <button
            onClick={() => reset()}
            className="mt-4 rounded-full bg-terra px-5 py-2 text-white hover:bg-terra-dark"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
