'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from '@/i18n/routing';
import { SearchIcon } from './icons';

export default function SearchBar({ className = '' }: { className?: string }) {
  const router = useRouter();
  const [query, setQuery] = useState('');

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    router.push(`/search?q=${encodeURIComponent(trimmed)}`);
  }

  return (
    <form
      onSubmit={handleSubmit}
      role="search"
      className={`flex items-center gap-2 rounded-full border border-border bg-white px-3.5 py-2 focus-within:border-charcoal ${className}`}
    >
      <SearchIcon className="h-4 w-4 shrink-0 text-charcoal-light" />
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search products…"
        aria-label="Search products"
        className="w-full border-none bg-transparent text-sm text-charcoal outline-none placeholder:text-charcoal-light"
      />
    </form>
  );
}
