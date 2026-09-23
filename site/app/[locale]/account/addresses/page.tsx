'use client';

import { useState, type FormEvent } from 'react';
import { useAccount, useAccountMutations } from '@/hooks/useAccount';
import type { Address } from '@/lib/types';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

const EMPTY_FORM = {
  firstName: '',
  lastName: '',
  streetName: '',
  streetNumber: '',
  city: '',
  postalCode: '',
  country: '',
  phone: '',
};

export default function AddressesPage() {
  const { data: user } = useAccount();
  const { addAddress, removeAddress } = useAccountMutations();

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [removeError, setRemoveError] = useState<string | null>(null);

  if (!user) return null;

  function updateField(field: keyof typeof EMPTY_FORM) {
    return (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleAdd(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    if (!form.country.trim()) {
      setFormError('Country is required.');
      return;
    }
    setIsSubmitting(true);
    try {
      const address: Address = {
        firstName: form.firstName || undefined,
        lastName: form.lastName || undefined,
        streetName: form.streetName || undefined,
        streetNumber: form.streetNumber || undefined,
        city: form.city || undefined,
        postalCode: form.postalCode || undefined,
        country: form.country.trim().toUpperCase(),
        phone: form.phone || undefined,
      };
      await addAddress(address);
      setForm(EMPTY_FORM);
      setShowForm(false);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to add address');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleRemove(addressId: string) {
    setRemoveError(null);
    setRemovingId(addressId);
    try {
      await removeAddress(addressId);
    } catch (err) {
      setRemoveError(err instanceof Error ? err.message : 'Failed to remove address');
    } finally {
      setRemovingId(null);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium text-charcoal">Addresses</h2>
        <Button variant="outline" size="sm" onClick={() => setShowForm((s) => !s)}>
          {showForm ? 'Cancel' : 'Add address'}
        </Button>
      </div>

      {removeError && (
        <div className="mt-4 rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
          {removeError}
        </div>
      )}

      {user.addresses.length === 0 ? (
        <p className="mt-6 text-sm text-charcoal-light">You don&apos;t have any saved addresses yet.</p>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {user.addresses.map((address, i) => (
            <div key={address.id ?? i} className="rounded-lg border border-border bg-white p-4 text-sm">
              <p className="font-medium text-charcoal">
                {address.firstName} {address.lastName}
              </p>
              <p className="mt-1 text-charcoal-light">
                {address.streetNumber} {address.streetName}
                <br />
                {address.city}
                {address.city && address.postalCode ? ', ' : ''}
                {address.postalCode}
                <br />
                {address.country}
              </p>
              {address.id && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-3 text-red-600 hover:bg-red-50"
                  isLoading={removingId === address.id}
                  onClick={() => handleRemove(address.id!)}
                >
                  Remove
                </Button>
              )}
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <form onSubmit={handleAdd} className="mt-8 max-w-md rounded-lg border border-border bg-white p-6">
          <h3 className="mb-4 font-medium text-charcoal">New address</h3>
          {formError && (
            <div className="mb-4 rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
              {formError}
            </div>
          )}
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              <Input label="First name" value={form.firstName} onChange={updateField('firstName')} />
              <Input label="Last name" value={form.lastName} onChange={updateField('lastName')} />
            </div>
            <div className="grid grid-cols-[1fr_auto] gap-3">
              <Input label="Street" value={form.streetName} onChange={updateField('streetName')} />
              <Input label="No." className="w-20" value={form.streetNumber} onChange={updateField('streetNumber')} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input label="City" value={form.city} onChange={updateField('city')} />
              <Input label="Postal code" value={form.postalCode} onChange={updateField('postalCode')} />
            </div>
            <Input
              label="Country (2-letter code)"
              placeholder="US"
              maxLength={2}
              required
              value={form.country}
              onChange={updateField('country')}
            />
            <Input label="Phone" value={form.phone} onChange={updateField('phone')} />
            <Button type="submit" isLoading={isSubmitting} className="mt-2 self-start">
              Save address
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
