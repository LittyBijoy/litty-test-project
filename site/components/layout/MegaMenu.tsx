'use client';

import { useEffect, useRef, useState } from 'react';
import { Link, usePathname } from '@/i18n/routing';
import { ChevronDownIcon } from './icons';
import type { Category } from '@/lib/types';

export default function MegaMenu({ categoryTree }: { categoryTree: Category[] }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const pathname = usePathname();
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!openId) return;
    function onPointerDown(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpenId(null);
      }
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpenId(null);
    }
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [openId]);

  return (
    <div ref={rootRef} className="flex items-center gap-1">
      {categoryTree.map((category) => {
        const hasChildren = Boolean(category.children && category.children.length > 0);
        const isOpen = openId === category.id;
        const isActive = pathname === `/category/${category.slug}`;

        return (
          <div
            key={category.id}
            className="relative"
            onMouseEnter={() => hasChildren && setOpenId(category.id)}
            onMouseLeave={() => hasChildren && setOpenId(null)}
          >
            <div
              className={`flex items-center rounded-full transition-colors hover:bg-cream-dark ${
                isActive ? 'text-terra-dark' : 'text-charcoal'
              }`}
            >
              <Link
                href={`/category/${category.slug}`}
                onClick={() => setOpenId(null)}
                onFocus={() => hasChildren && setOpenId(category.id)}
                className="px-3 py-2 text-sm font-medium"
              >
                {category.name}
              </Link>
              {hasChildren && (
                <button
                  type="button"
                  aria-label={`Toggle ${category.name} menu`}
                  aria-expanded={isOpen}
                  onClick={() => setOpenId(isOpen ? null : category.id)}
                  className="pr-3 py-2"
                >
                  <ChevronDownIcon className={`h-3.5 w-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>
              )}
            </div>

            {hasChildren && isOpen && (
              <div className="absolute left-0 top-full z-50 min-w-[220px] rounded-lg border border-border bg-white p-3 shadow-lg">
                <ul className="flex flex-col gap-0.5">
                  {category.children!.map((child) => (
                    <li key={child.id}>
                      <Link
                        href={`/category/${child.slug}`}
                        onClick={() => setOpenId(null)}
                        className="block rounded-md px-3 py-2 text-sm text-charcoal-light hover:bg-cream-dark hover:text-charcoal"
                      >
                        {child.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
