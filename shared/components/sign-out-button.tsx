'use client';

import { useClerk } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { Button, Text } from '@/lib/ui/components';

export const SignOutButton = () => {
  const { signOut } = useClerk();
  const router = useRouter();
  
  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/sign-in');
    } catch (err) {
      console.error('Sign out error:', err);
      alert('There was a problem signing out. Please try again.');
    }
  };

  return (
    <Button
      variant="ghost"
      onClick={handleSignOut}
      className="border border-error text-error px-7 py-3 rounded-xl text-xs font-semibold hover:bg-error/10"
    >
      Sign Out
    </Button>
  );
};

