import { Link } from '@/i18n/routing';

export interface BreadcrumbItem {
  name: string;
  href: string;
}

export default function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Breadcrumb" className="text-sm text-charcoal-light">
      <ol className="flex flex-wrap items-center gap-1.5">
        <li>
          <Link href="/" className="hover:text-charcoal">
            Home
          </Link>
        </li>
        {items.map((item, i) => (
          <li key={item.href} className="flex items-center gap-1.5">
            <span aria-hidden="true">/</span>
            {i === items.length - 1 ? (
              <span aria-current="page" className="text-charcoal">
                {item.name}
              </span>
            ) : (
              <Link href={item.href} className="hover:text-charcoal">
                {item.name}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
