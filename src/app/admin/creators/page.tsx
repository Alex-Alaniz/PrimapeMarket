
'use client';

import { useState, useEffect } from 'react';
import { useActiveAccount } from 'thirdweb/react';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast, useToast } from '@/components/ui/use-toast';

interface WhitelistedCreator {
  username: string;
  category: string;
  points: number;
  added_at: string;
  is_onboarded: boolean;
  added_by: string | null;
}

export default function AdminCreatorsPage() {
  const activeAccount = useActiveAccount();
  const { toast } = useToast();
  const [creators, setCreators] = useState<WhitelistedCreator[]>([]);
  const [loading, setLoading] = useState(true);
  const [newCreator, setNewCreator] = useState({ username: '', category: 'Spaces', points: 250 });
  const [isAdmin, setIsAdmin] = useState(false);
  
  // Check if the connected wallet is an admin wallet
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!activeAccount?.address) {
        setIsAdmin(false);
        return;
      }
      
      try {
        // Make a test request to the admin API endpoint
        const response = await fetch('/api/admin/creators/whitelist', {
          headers: {
            'x-admin-wallet': activeAccount.address
          }
        });
        
        // If we get a 200 OK, the wallet is an admin
        setIsAdmin(response.status === 200);
      } catch (error) {
        console.error("Error checking admin status:", error);
        setIsAdmin(false);
      }
    };
    
    checkAdminStatus();
  }, [activeAccount?.address]);

  useEffect(() => {
    if (!isAdmin) return;
    
    const fetchWhitelist = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/admin/creators/whitelist', {
          headers: {
            'x-admin-wallet': activeAccount?.address || ''
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setCreators(data);
        } else {
          toast({
            title: 'Error',
            description: 'Failed to fetch creator whitelist. You may not have admin privileges.',
            variant: 'destructive'
          });
        }
      } catch (error) {
        console.error('Error fetching whitelist:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWhitelist();
  }, [isAdmin, activeAccount?.address]);

  const handleAddCreator = async () => {
    if (!newCreator.username) {
      toast({ title: 'Error', description: 'Username is required', variant: 'destructive' });
      return;
    }

    try {
      const response = await fetch('/api/admin/creators/whitelist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-wallet': activeAccount?.address || ''
        },
        body: JSON.stringify({
          ...newCreator,
          adminWallet: activeAccount?.address
        })
      });

      if (response.ok) {
        const data = await response.json();
        setCreators(prev => [data, ...prev]);
        setNewCreator({ username: '', category: 'Spaces', points: 250 });
        toast({ title: 'Success', description: 'Creator added to whitelist' });
      } else {
        const error = await response.json();
        toast({ 
          title: 'Error', 
          description: error.error || 'Failed to add creator', 
          variant: 'destructive' 
        });
      }
    } catch (error) {
      console.error('Error adding creator:', error);
      toast({ 
        title: 'Error', 
        description: 'An unexpected error occurred', 
        variant: 'destructive' 
      });
    }
  };

  const handleRemoveCreator = async (username: string) => {
    try {
      const response = await fetch(`/api/admin/creators/whitelist?username=${username}`, {
        method: 'DELETE',
        headers: {
          'x-admin-wallet': activeAccount?.address || ''
        }
      });

      if (response.ok) {
        setCreators(prev => prev.filter(c => c.username !== username));
        toast({ title: 'Success', description: 'Creator removed from whitelist' });
      } else {
        toast({ 
          title: 'Error', 
          description: 'Failed to remove creator', 
          variant: 'destructive' 
        });
      }
    } catch (error) {
      console.error('Error removing creator:', error);
      toast({ 
        title: 'Error', 
        description: 'An unexpected error occurred', 
        variant: 'destructive' 
      });
    }
  };

  // Page is accessible but functionality is restricted
  const isAdminView = isAdmin; // Store the admin status to control functionality

  return (
    <>
      <Navbar />
      <main className="container mx-auto py-10">
        <h1 className="text-3xl font-bold mb-6">Creator Management</h1>
        
        {!isAdminView && (
          <Card className="mb-6 border-yellow-500 bg-yellow-50 dark:bg-yellow-950/30">
            <CardHeader>
              <CardTitle className="text-yellow-700 dark:text-yellow-400">Admin Access Required</CardTitle>
              <CardDescription className="text-yellow-600 dark:text-yellow-500">
                You are viewing this page as a non-admin user. Admin wallet connection is required to manage creators.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>Your wallet address: {activeAccount?.address || "Not connected"}</p>
              <p className="mt-2">Please connect with an authorized wallet to perform admin actions.</p>
            </CardContent>
          </Card>
        )}
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Add Creator to Whitelist</CardTitle>
            <CardDescription>
              Add Twitter handles that will be allowed in the platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4 md:flex-row">
              <div className="flex-1">
                <label className="text-sm font-medium mb-1 block">
                  Twitter Username
                </label>
                <Input 
                  placeholder="username (without @)" 
                  value={newCreator.username}
                  onChange={(e) => setNewCreator(prev => ({ ...prev, username: e.target.value.replace('@', '') }))}
                  disabled={!isAdminView}
                />
              </div>
              <div className="w-32">
                <label className="text-sm font-medium mb-1 block">
                  Category
                </label>
                <select 
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={newCreator.category}
                  onChange={(e) => setNewCreator(prev => ({ ...prev, category: e.target.value }))}
                  disabled={!isAdminView}
                >
                  <option>Spaces</option>
                  <option>Podcasts</option>
                  <option>News</option>
                </select>
              </div>
              <div className="w-24">
                <label className="text-sm font-medium mb-1 block">
                  Points
                </label>
                <Input 
                  type="number" 
                  value={newCreator.points}
                  onChange={(e) => setNewCreator(prev => ({ ...prev, points: parseInt(e.target.value) || 0 }))}
                  disabled={!isAdminView}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
                onClick={handleAddCreator}
                disabled={!isAdminView}
                title={!isAdminView ? "Admin access required" : "Add to whitelist"}
              >
                Add to Whitelist
              </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Whitelisted Creators</CardTitle>
            <CardDescription>
              These Twitter accounts are approved to appear on the Earn page
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p>Loading creators...</p>
            ) : creators.length === 0 ? (
              <p>No creators in whitelist yet.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Username</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Points</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Added</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {creators.map((creator) => (
                    <TableRow key={creator.username}>
                      <TableCell className="font-medium">@{creator.username}</TableCell>
                      <TableCell>{creator.category}</TableCell>
                      <TableCell>{creator.points}</TableCell>
                      <TableCell>
                        {creator.is_onboarded ? (
                          <span className="bg-green-100 text-green-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded-full">Active</span>
                        ) : (
                          <span className="bg-yellow-100 text-yellow-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded-full">Pending</span>
                        )}
                      </TableCell>
                      <TableCell>{new Date(creator.added_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => handleRemoveCreator(creator.username)}
                          disabled={!isAdminView}
                          title={!isAdminView ? "Admin access required" : "Remove creator"}
                        >
                          Remove
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>
      <Footer />
    </>
  );
}
