
'use client'

import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { UserProfileCard } from '@/components/user-profile-card';
import { useActiveAccount } from 'thirdweb/react';
import { ProfileMarketTable } from '@/components/profile-market-table';
import { useParams } from 'next/navigation';

export default function ProfilePage() {
  const account = useActiveAccount();
  const params = useParams();
  const address = params.address as string;
  const isOwnProfile = account?.address?.toLowerCase() === address?.toLowerCase();

  return (
    <div className="flex min-h-screen flex-col">
      <div className="container py-4">
        <Navbar />

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mt-8">
          {/* User Profile Card */}
          <div className="md:col-span-3">
            <UserProfileCard viewAddress={address} viewOnly={!isOwnProfile} />
          </div>

          {/* User Activity */}
          <div className="md:col-span-9">
            <div className="rounded-lg bg-card text-card-foreground p-4">
              <ProfileMarketTable address={address} />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-auto">
        <Footer />
      </div>
    </div>
  );
}
