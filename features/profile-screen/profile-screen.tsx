'use client';

import { useUser, useClerk } from '@clerk/nextjs';
import React, { useState, useEffect, FormEvent } from 'react';
import { View, Text, ActivityIndicator, Input, Button, Card } from '@/lib/ui/components';
import { ProfileRow } from './components/profile-row';

export default function ProfileScreen() {
  const { isLoaded, isSignedIn, user } = useUser();
  const { signOut } = useClerk();
  const [isUpdating, setIsUpdating] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || '');
      setLastName(user.lastName || '');
    }
  }, [user]);

  if (!isLoaded || !isSignedIn) {
    return (
      <View className="min-h-screen flex items-center justify-center bg-background">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const handleNameUpdate = async (e: FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName) {
      setError('First and last name cannot be empty.');
      return;
    }
    setIsUpdating(true);
    setError(null);
    setSuccess(null);
    try {
      await user?.update({ firstName, lastName });
      setSuccess('Your name has been updated.');
    } catch (err) {
      console.error(err);
      setError('Failed to update your name.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await user?.delete();
    } catch (err) {
      console.error(err);
      alert('Failed to delete your account.');
    }
  };

  const appVersion = '1.0.0'; // Can be set via environment variable or package.json
  const accountCreated = user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A';

  return (
    <div className="screen-container w-full">
      <View className="w-full flex flex-col">
        <Text variant="h1" className="text-3xl font-bold text-center mb-6">
          Manage Account
        </Text>

        <Card className="p-4 mb-4">
          <Text variant="h3" className="mb-4">Update Your Name</Text>
          <form onSubmit={handleNameUpdate} className="space-y-3">
            <Input
              type="text"
              placeholder="First Name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              className="w-full"
            />
            <Input
              type="text"
              placeholder="Last Name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
              className="w-full"
            />
            
            {error && (
              <div className="p-3 rounded-md bg-error/10 border border-error/20">
                <Text className="text-error text-sm">{error}</Text>
              </div>
            )}
            
            {success && (
              <div className="p-3 rounded-md bg-success/10 border border-success/20">
                <Text className="text-success text-sm">{success}</Text>
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              disabled={isUpdating}
              className="w-full"
            >
              {isUpdating ? 'Updating...' : 'Save Changes'}
            </Button>
          </form>
        </Card>

        <Card className="p-4 mb-4">
          <Text variant="h3" className="mb-4">Account Information</Text>
          <ProfileRow
            icon="envelope"
            label="Email"
            value={user.primaryEmailAddress?.toString() || ''}
          />
          <ProfileRow icon="calendar-alt" label="Account Created" value={accountCreated} />
          <ProfileRow icon="info-circle" label="App Version" value={appVersion} />
        </Card>

        <Card className="p-4 mb-4">
          <Text variant="h3" className="mb-4">Danger Zone</Text>
          {showDeleteConfirm ? (
            <div className="space-y-3">
              <Text className="text-text mb-2">
                Are you sure you want to delete your account? This action is irreversible.
              </Text>
              <div className="flex gap-2">
                <Button
                  variant="destructive"
                  onClick={handleDeleteAccount}
                  className="flex-1"
                >
                  Confirm Delete
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <Button
              variant="destructive"
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full border border-error"
            >
              Delete Account
            </Button>
          )}
        </Card>

        <Button
          variant="destructive"
          onClick={() => signOut()}
          className="w-full mt-6"
        >
          Sign Out
        </Button>
      </View>
    </div>
  );
}
