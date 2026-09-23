import { Link } from '@/i18n/routing';

export default function NotFound() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <h2 className="text-xl font-semibold">Page not found</h2>
      <p className="text-charcoal-light">The page you&apos;re looking for doesn&apos;t exist or has moved.</p>
      <Link href="/" className="rounded-full bg-terra px-5 py-2 text-white hover:bg-terra-dark">
        Back to home
      </Link>
    </div>
  );
}
