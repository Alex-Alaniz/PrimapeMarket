
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

  // Check if user is admin - in production, use a more robust check
  const isAdmin = Boolean(activeAccount?.address);

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

  if (!isAdmin) {
    return (
      <>
        <Navbar />
        <main className="container mx-auto py-10">
          <Card>
            <CardHeader>
              <CardTitle>Admin Access Required</CardTitle>
              <CardDescription>
                You need to connect with an admin wallet to access this page.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>Please connect with an authorized wallet to manage creators.</p>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="container mx-auto py-10">
        <h1 className="text-3xl font-bold mb-6">Creator Management</h1>
        
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
                />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleAddCreator}>Add to Whitelist</Button>
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
