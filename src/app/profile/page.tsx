
'use client'

import { useState } from 'react';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { UserProfileCard } from '@/components/user-profile-card';
import { UserActivityTable } from '@/components/user-activity-table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { useActiveAccount } from 'thirdweb/react';
import { Search } from 'lucide-react';

export default function ProfilePage() {
  const _account = useActiveAccount();
  const [activeTab, setActiveTab] = useState('current');

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
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 border-b gap-3">
                  <TabsList className="w-full sm:w-auto">
                    <TabsTrigger value="current" className="text-xs sm:text-sm">Current</TabsTrigger>
                    <TabsTrigger value="past" className="text-xs sm:text-sm">Past</TabsTrigger>
                    <TabsTrigger value="history" className="text-xs sm:text-sm">History</TabsTrigger>
                  </TabsList>
                  
                  {activeTab !== 'history' && (
                    <div className="relative w-full sm:w-auto">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="search"
                        placeholder="Search predictions..."
                        className="w-full sm:w-[250px] pl-8"
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
