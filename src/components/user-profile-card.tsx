'use client';

import { useState } from 'react';
import { useActiveAccount } from 'thirdweb/react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { useUserProfile } from '@/hooks/useUserProfile';
import {
  UserIcon,
  PencilIcon,
  CheckCircleIcon,
  AlertCircleIcon,
} from "lucide-react";

export function UserProfileCard() {
  const { profile, isLoading, _error, updateProfile } = useUserProfile();//Fixed unused error variable
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isRegisterDialogOpen, setIsRegisterDialogOpen] = useState(false);
  const [newDisplayName, setNewDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const { toast } = useToast();
  const account = useActiveAccount();

  const handleUpdateProfile = async () => {
    if (!newDisplayName.trim()) {
      toast({
        title: 'Error',
        description: 'Display name cannot be empty',
        variant: 'destructive',
      });
      return;
    }

    const success = await updateProfile(newDisplayName);

    if (success) {
      toast({
        title: 'Success',
        description: 'Profile updated successfully',
      });
      setIsEditDialogOpen(false);
    } else {
      toast({
        title: 'Error',
        description: 'Failed to update profile',
        variant: 'destructive',
      });
    }
  };

  const handleRegisterProfile = async () => {
    if (!newDisplayName.trim()) {
      toast({
        title: 'Error',
        description: 'Display name cannot be empty',
        variant: 'destructive',
      });
      return;
    }

    const success = await registerProfile(newDisplayName, email || undefined);

    if (success) {
      toast({
        title: 'Success',
        description: 'Profile registered successfully',
      });
      setIsRegisterDialogOpen(false);
    } else {
      toast({
        title: 'Error',
        description: 'Failed to register profile',
        variant: 'destructive',
      });
    }
  };

  // If loading, show skeleton
  if (isLoading) {
    return (
      <div className="rounded-lg bg-card text-card-foreground shadow-sm">
        <div className="p-6 space-y-4">
          <div className="flex flex-col items-center space-y-3">
            <div className="w-20 h-20 rounded-full bg-muted animate-pulse" />
            <div className="h-6 w-32 bg-muted animate-pulse rounded" />
            <div className="h-4 w-48 bg-muted animate-pulse rounded" />
          </div>
          <div className="space-y-2">
            <div className="h-4 w-full bg-muted animate-pulse rounded" />
            <div className="h-4 w-full bg-muted animate-pulse rounded" />
            <div className="h-4 w-3/4 bg-muted animate-pulse rounded" />
          </div>
        </div>
      </div>
    );
  }

  // If no profile and logged in, show registration prompt
  if (!profile && account) {
    return (
      <div className="rounded-lg bg-card text-card-foreground shadow-sm">
        <div className="p-6 space-y-4">
          <div className="flex flex-col items-center space-y-3">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
              <UserIcon className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold">Welcome!</h3>
            <p className="text-sm text-muted-foreground text-center">
              You need to create a profile to track your predictions and appear on the leaderboard.
            </p>
            <Button onClick={() => setIsRegisterDialogOpen(true)}>
              Create Profile
            </Button>
          </div>
        </div>

        <Dialog open={isRegisterDialogOpen} onOpenChange={setIsRegisterDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Your Profile</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label htmlFor="displayName" className="text-sm font-medium">
                  Display Name
                </label>
                <Input
                  id="displayName"
                  value={newDisplayName}
                  onChange={(e) => setNewDisplayName(e.target.value)}
                  placeholder="Enter your display name"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Email (Optional)
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsRegisterDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleRegisterProfile}>
                Create Profile
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // If not logged in, show login prompt
  if (!account) {
    return (
      <div className="rounded-lg bg-card text-card-foreground shadow-sm">
        <div className="p-6 space-y-4">
          <div className="flex flex-col items-center space-y-3">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
              <UserIcon className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold">Not Connected</h3>
            <p className="text-sm text-muted-foreground text-center">
              Connect your wallet to view your profile and track your predictions.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // At this point, profile is guaranteed to be non-null
  if (!profile) return null;

  // Show profile data
  return (
    <div className="rounded-lg bg-card text-card-foreground shadow-sm">
      <div className="p-6 space-y-6">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
            <UserIcon className="w-10 h-10 text-primary" />
          </div>
          <div className="text-center">
            <h3 className="text-lg font-semibold">{profile.displayName}</h3>
            <p className="text-sm text-muted-foreground">
              {profile.primaryWallet.substring(0, 6)}...{profile.primaryWallet.substring(profile.primaryWallet.length - 4)}
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => {
            setNewDisplayName(profile.displayName);
            setIsEditDialogOpen(true);
          }}>
            <PencilIcon className="w-4 h-4 mr-2" />
            Edit Profile
          </Button>
        </div>

        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium mb-2">Stats</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Invested:</span>
                <span>{(Number(profile.stats.total_invested) / 1e18).toFixed(2)} APE</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Claimed:</span>
                <span>{(Number(profile.stats.total_claimed) / 1e18).toFixed(2)} APE</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Markets Participated:</span>
                <span>{profile.stats.total_participated}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Markets Won:</span>
                <span>{profile.stats.total_won}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Markets Lost:</span>
                <span>{profile.stats.total_lost}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">PnL:</span>
                <span className={Number(profile.stats.pnl) > 0 ? 'text-green-600' : Number(profile.stats.pnl) < 0 ? 'text-red-600' : ''}>
                  {(Number(profile.stats.pnl) / 1e18).toFixed(2)} APE
                </span>
              </div>
            </div>
          </div>

          {profile.linkedWallets.length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-2">Linked Wallets</h4>
              <div className="space-y-1">
                {profile.linkedWallets.map((wallet, index) => (
                  <div key={index} className="text-sm">
                    {wallet.substring(0, 6)}...{wallet.substring(wallet.length - 4)}
                  </div>
                ))}
              </div>
            </div>
          )}

          {profile.emails.length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-2">Emails</h4>
              <div className="space-y-1">
                {profile.emails.map((email, index) => (
                  <div key={index} className="text-sm flex items-center">
                    <span>{email.email}</span>
                    {email.verified ? (
                      <CheckCircleIcon className="w-4 h-4 ml-2 text-green-600" />
                    ) : (
                      <AlertCircleIcon className="w-4 h-4 ml-2 text-amber-600" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="displayName" className="text-sm font-medium">
                Display Name
              </label>
              <Input
                id="displayName"
                value={newDisplayName}
                onChange={(e) => setNewDisplayName(e.target.value)}
                placeholder="Enter your display name"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateProfile}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}