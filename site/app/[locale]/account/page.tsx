'use client';

import { useState, type FormEvent } from 'react';
import { useAccount, useAccountMutations } from '@/hooks/useAccount';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

export default function AccountProfilePage() {
  const { data: user } = useAccount();
  const { updateProfile } = useAccountMutations();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Tracks which customer's fields are currently loaded into the form, so a
  // freshly-resolved (or changed) `user` re-seeds the inputs without an effect.
  const [loadedUserId, setLoadedUserId] = useState<string | null>(null);

  if (!user) return null;

  if (user.id !== loadedUserId) {
    setLoadedUserId(user.id);
    setFirstName(user.firstName ?? '');
    setLastName(user.lastName ?? '');
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setIsSubmitting(true);
    try {
      await updateProfile(firstName || undefined, lastName || undefined);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="max-w-md">
      <h2 className="text-lg font-medium text-charcoal">Profile</h2>
      <p className="mt-1 text-sm text-charcoal-light">Update your personal details.</p>

      {error && (
        <div className="mt-4 rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}
      {success && !error && (
        <div className="mt-4 rounded-md border border-sage/40 bg-sage/10 px-4 py-3 text-sm text-sage">
          Profile updated.
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
        <Input label="Email" type="email" value={user.email} disabled readOnly />
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="First name"
            name="firstName"
            value={firstName}
            onChange={(e) => {
              setFirstName(e.target.value);
              setSuccess(false);
            }}
          />
          <Input
            label="Last name"
            name="lastName"
            value={lastName}
            onChange={(e) => {
              setLastName(e.target.value);
              setSuccess(false);
            }}
          />
        </div>
        <Button type="submit" isLoading={isSubmitting} className="mt-2 self-start">
          Save changes
        </Button>
      </form>
    </div>
  );
}
