'use client'

import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { UserProfileCard } from '@/components/user-profile-card';
import { useActiveAccount } from 'thirdweb/react';
import { ProfileMarketTable } from '@/components/profile-market-table';

export default function ProfilePage() {
  const _account = useActiveAccount();

  return (
    <div className="flex min-h-screen flex-col">
      <div className="container py-4">
        <Navbar />

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mt-8">
          {/* User Profile Card */}
          <div className="md:col-span-3">
            <UserProfileCard viewOnly={false} />
          </div>

          {/* User Activity */}
          <div className="md:col-span-9">
            <div className="rounded-lg bg-card text-card-foreground p-4">
              <ProfileMarketTable />
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