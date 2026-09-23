import { Link } from '@/i18n/routing';

export default function GenericConfirmationPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-20 text-center">
      <h1 className="text-2xl font-semibold">Thank you for your order!</h1>
      <p className="mt-3 text-charcoal-light">
        Your order has been placed. You&apos;ll receive a confirmation email shortly.
      </p>
      <Link href="/" className="mt-6 inline-block rounded-full bg-terra px-6 py-2.5 text-white hover:bg-terra-dark">
        Continue shopping
      </Link>
    </div>
  );
}
