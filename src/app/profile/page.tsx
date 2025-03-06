'use client'

import { useState, useEffect } from 'react';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { UserProfileCard } from '@/components/user-profile-card';
import { UserActivityTable } from '@/components/user-activity-table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { useActiveAccount } from 'thirdweb/react';
import { Search } from 'lucide-react';
import { Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';


export default function ProfilePage() {
  const account = useActiveAccount();
  const [activeTab, setActiveTab] = useState('current');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Simulate checking if all required components are loaded
    const timer = setTimeout(() => {
      setLoading(false);
      if (!account) {
        setError("Please connect your wallet to view your profile");
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [account]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Navbar />
        <div className="flex items-center justify-center h-[60vh] flex-col gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Navbar />
        <div className="flex items-center justify-center h-[60vh] flex-col gap-4">
          <Alert variant="destructive" className="max-w-md">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button onClick={() => window.location.reload()}>Refresh Page</Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <div className="container py-4">
        <Navbar />

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mt-8">
          {/* User Profile Card */}
          <div className="md:col-span-3">
            <UserProfileCard />
          </div>

          {/* User Activity */}
          <div className="md:col-span-9">
            <div className="rounded-lg bg-card text-card-foreground shadow-sm">
              <Tabs defaultValue="current" className="w-full" onValueChange={setActiveTab}>
                <div className="flex items-center justify-between p-4 border-b">
                  <TabsList>
                    <TabsTrigger value="current">Current Predictions</TabsTrigger>
                    <TabsTrigger value="past">Past Predictions</TabsTrigger>
                    <TabsTrigger value="history">History</TabsTrigger>
                  </TabsList>

                  {activeTab !== 'history' && (
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="search"
                        placeholder="Search predictions..."
                        className="w-[250px] pl-8"
                      />
                    </div>
                  )}
                </div>

                <TabsContent value="current">
                  <UserActivityTable type="current" />
                </TabsContent>

                <TabsContent value="past">
                  <UserActivityTable type="past" />
                </TabsContent>

                <TabsContent value="history">
                  <UserActivityTable type="history" />
                </TabsContent>
              </Tabs>
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