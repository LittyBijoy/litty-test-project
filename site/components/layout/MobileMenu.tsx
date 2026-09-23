'use client';

import { useState } from 'react';
import { Link, usePathname } from '@/i18n/routing';
import Drawer from '@/components/ui/Drawer';
import { HamburgerIcon } from './icons';
import type { Category } from '@/lib/types';

export default function MobileMenu({ categoryTree }: { categoryTree: Category[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const pathname = usePathname();

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label="Open menu"
        className="rounded-full p-2 text-charcoal hover:bg-cream-dark lg:hidden"
      >
        <HamburgerIcon className="h-5 w-5" />
      </button>
      <Drawer isOpen={isOpen} onClose={() => setIsOpen(false)} title="Menu" position="left">
        <nav aria-label="Categories">
          <ul className="flex flex-col divide-y divide-border">
            {categoryTree.map((category) => {
              const hasChildren = Boolean(category.children && category.children.length > 0);
              const isExpanded = expandedId === category.id;
              const isActive = pathname === `/category/${category.slug}`;

              return (
                <li key={category.id} className="py-1">
                  <div className="flex items-center justify-between">
                    <Link
                      href={`/category/${category.slug}`}
                      onClick={() => setIsOpen(false)}
                      className={`flex-1 py-2.5 text-sm font-medium ${isActive ? 'text-terra-dark' : 'text-charcoal'}`}
                    >
                      {category.name}
                    </Link>
                    {hasChildren && (
                      <button
                        type="button"
                        aria-label={`${isExpanded ? 'Collapse' : 'Expand'} ${category.name}`}
                        aria-expanded={isExpanded}
                        onClick={() => setExpandedId(isExpanded ? null : category.id)}
                        className="px-2 py-2 text-lg leading-none text-charcoal-light"
                      >
                        {isExpanded ? '−' : '+'}
                      </button>
                    )}
                  </div>
                  {hasChildren && isExpanded && (
                    <ul className="flex flex-col gap-0.5 pb-2 pl-4">
                      {category.children!.map((child) => (
                        <li key={child.id}>
                          <Link
                            href={`/category/${child.slug}`}
                            onClick={() => setIsOpen(false)}
                            className="block py-2 text-sm text-charcoal-light hover:text-charcoal"
                          >
                            {child.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>
      </Drawer>
    </>
  );
}
