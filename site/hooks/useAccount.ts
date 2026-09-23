'use client';

import useSWR, { useSWRConfig } from 'swr';
import { KEY_ACCOUNT, KEY_CART } from '@/lib/cache-keys';
import type { Account, Address } from '@/lib/types';

export function useAccount() {
  return useSWR<Account | null>(
    KEY_ACCOUNT,
    async () => {
      const res = await fetch('/api/account/profile');
      if (!res.ok) return null;
      const data = await res.json();
      return data.customer ?? null;
    },
    { revalidateOnFocus: false }
  );
}

export function useAccountMutations() {
  const { mutate } = useSWRConfig();

  async function login(email: string, password: string) {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed');
    mutate(KEY_ACCOUNT, data.customer, { revalidate: false });
    mutate(KEY_CART); // cart may have been merged server-side — refetch
    return data.customer as Account;
  }

  async function register(email: string, password: string, firstName?: string, lastName?: string) {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, firstName, lastName }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Registration failed');
    mutate(KEY_ACCOUNT, data.customer, { revalidate: false });
    mutate(KEY_CART);
    return data.customer as Account;
  }

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    // Clear every user-scoped cache entry without a refetch — stale cart/account
    // data must never remain visible after logout.
    mutate(KEY_ACCOUNT, null, { revalidate: false });
    mutate(KEY_CART, null, { revalidate: false });
  }

  async function updateProfile(firstName?: string, lastName?: string) {
    const res = await fetch('/api/account/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ firstName, lastName }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update profile');
    mutate(KEY_ACCOUNT, data.customer, { revalidate: false });
    return data.customer as Account;
  }

  async function addAddress(address: Address) {
    const res = await fetch('/api/account/addresses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(address),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to add address');
    mutate(KEY_ACCOUNT, data.customer, { revalidate: false });
    return data.customer as Account;
  }

  async function removeAddress(addressId: string) {
    const res = await fetch(`/api/account/addresses/${addressId}`, { method: 'DELETE' });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to remove address');
    mutate(KEY_ACCOUNT, data.customer, { revalidate: false });
    return data.customer as Account;
  }

  return { login, register, logout, updateProfile, addAddress, removeAddress };
}
