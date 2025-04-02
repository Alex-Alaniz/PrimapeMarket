
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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

interface TwitterProfile {
  id: string;
  username: string;
  name: string | null;
}

interface TwitterSpace {
  id: string;
  title: string;
  description: string | null;
  start_time: string;
  end_time: string | null;
  day_of_week: string;
  recurring: boolean;
  points: number;
  hosts: TwitterProfile[];
}

export default function AdminSpacesPage() {
  const activeAccount = useActiveAccount();
  const { toast } = useToast();
  const [spaces, setSpaces] = useState<TwitterSpace[]>([]);
  const [loading, setLoading] = useState(true);
  const [newSpace, setNewSpace] = useState({
    title: '',
    description: '',
    day_of_week: 'Monday',
    start_hour: '6',
    start_minute: '00',
    end_hour: '7',
    end_minute: '00',
    points: 100,
    recurring: true,
    hosts: '',
  });
  const [isAdmin, setIsAdmin] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
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
    
    const fetchSpaces = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/admin/spaces', {
          headers: {
            'x-admin-wallet': activeAccount?.address || ''
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setSpaces(data);
        } else {
          toast({
            title: 'Error',
            description: 'Failed to fetch Twitter spaces. You may not have admin privileges.',
            variant: 'destructive'
          });
        }
      } catch (error) {
        console.error('Error fetching spaces:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSpaces();
  }, [isAdmin, activeAccount?.address]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewSpace(prev => ({ ...prev, [name]: value }));
  };

  const handleAddSpace = async () => {
    if (!newSpace.title || !newSpace.hosts) {
      toast({ 
        title: 'Error', 
        description: 'Title and hosts are required', 
        variant: 'destructive' 
      });
      return;
    }

    try {
      // Format the date/time values for the API
      const startTime = new Date();
      startTime.setHours(parseInt(newSpace.start_hour), parseInt(newSpace.start_minute), 0, 0);
      
      const endTime = new Date();
      endTime.setHours(parseInt(newSpace.end_hour), parseInt(newSpace.end_minute), 0, 0);
      
      const hosts = newSpace.hosts.split(',').map(host => host.trim());
      
      const response = await fetch('/api/admin/spaces', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-wallet': activeAccount?.address || ''
        },
        body: JSON.stringify({
          title: newSpace.title,
          description: newSpace.description,
          start_time: startTime,
          end_time: endTime,
          day_of_week: newSpace.day_of_week,
          recurring: newSpace.recurring,
          points: parseInt(newSpace.points.toString()),
          hosts,
          adminWallet: activeAccount?.address
        })
      });

      if (response.ok) {
        const data = await response.json();
        setSpaces(prev => [data, ...prev]);
        setNewSpace({
          title: '',
          description: '',
          day_of_week: 'Monday',
          start_hour: '6',
          start_minute: '00',
          end_hour: '7',
          end_minute: '00',
          points: 100,
          recurring: true,
          hosts: '',
        });
        setIsDialogOpen(false);
        toast({ title: 'Success', description: 'Twitter space added to schedule' });
      } else {
        const error = await response.json();
        toast({ 
          title: 'Error', 
          description: error.error || 'Failed to add Twitter space', 
          variant: 'destructive' 
        });
      }
    } catch (error) {
      console.error('Error adding space:', error);
      toast({ 
        title: 'Error', 
        description: 'An unexpected error occurred', 
        variant: 'destructive' 
      });
    }
  };

  const handleRemoveSpace = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/spaces?id=${id}`, {
        method: 'DELETE',
        headers: {
          'x-admin-wallet': activeAccount?.address || ''
        }
      });

      if (response.ok) {
        setSpaces(prev => prev.filter(s => s.id !== id));
        toast({ title: 'Success', description: 'Twitter space removed from schedule' });
      } else {
        toast({ 
          title: 'Error', 
          description: 'Failed to remove Twitter space', 
          variant: 'destructive' 
        });
      }
    } catch (error) {
      console.error('Error removing space:', error);
      toast({ 
        title: 'Error', 
        description: 'An unexpected error occurred', 
        variant: 'destructive' 
      });
    }
  };

  // Group spaces by day of week
  const spacesByDay = DAYS_OF_WEEK.reduce((acc, day) => {
    acc[day] = spaces.filter(space => space.day_of_week === day);
    return acc;
  }, {} as Record<string, TwitterSpace[]>);

  // Page is accessible but functionality is restricted
  const isAdminView = isAdmin; // Store the admin status to control functionality

  return (
    <>
      <Navbar />
      <main className="container mx-auto py-10">
        <h1 className="text-3xl font-bold mb-6">Twitter Spaces Management</h1>
        
        {!isAdminView && (
          <Card className="mb-6 border-yellow-500 bg-yellow-50 dark:bg-yellow-950/30">
            <CardHeader>
              <CardTitle className="text-yellow-700 dark:text-yellow-400">Admin Access Required</CardTitle>
              <CardDescription className="text-yellow-600 dark:text-yellow-500">
                You are viewing this page as a non-admin user. Admin wallet connection is required to manage Twitter spaces.
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
            <CardTitle>Twitter Spaces Schedule</CardTitle>
            <CardDescription>
              Manage scheduled Twitter spaces for the ApeChain community
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  className="mb-4"
                  disabled={!isAdminView}
                  title={!isAdminView ? "Admin access required" : "Add new Twitter space"}
                >
                  Add New Space
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Add Twitter Space</DialogTitle>
                  <DialogDescription>
                    Enter the details for the new Twitter space to add to the schedule.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Title</label>
                    <Input 
                      name="title"
                      value={newSpace.title}
                      onChange={handleInputChange}
                      placeholder="ApeChain Trenches"
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Description (optional)</label>
                    <Input 
                      name="description"
                      value={newSpace.description}
                      onChange={handleInputChange}
                      placeholder="Weekly community discussion"
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Day of Week</label>
                    <select 
                      name="day_of_week"
                      value={newSpace.day_of_week}
                      onChange={handleInputChange}
                      className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      {DAYS_OF_WEEK.map(day => (
                        <option key={day} value={day}>{day}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Start Time</label>
                      <div className="flex gap-2 mt-1">
                        <Input 
                          type="number" 
                          name="start_hour"
                          min="0"
                          max="23"
                          value={newSpace.start_hour}
                          onChange={handleInputChange}
                        />
                        <span className="flex items-center">:</span>
                        <Input 
                          type="number" 
                          name="start_minute"
                          min="0"
                          max="59"
                          value={newSpace.start_minute}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium">End Time</label>
                      <div className="flex gap-2 mt-1">
                        <Input 
                          type="number" 
                          name="end_hour"
                          min="0"
                          max="23"
                          value={newSpace.end_hour}
                          onChange={handleInputChange}
                        />
                        <span className="flex items-center">:</span>
                        <Input 
                          type="number" 
                          name="end_minute"
                          min="0"
                          max="59"
                          value={newSpace.end_minute}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Host(s)</label>
                    <Input 
                      name="hosts"
                      value={newSpace.hosts}
                      onChange={handleInputChange}
                      placeholder="username1, username2, username3"
                    />
                    <p className="text-xs text-muted-foreground">
                      Comma-separated list of Twitter usernames (without @)
                    </p>
                  </div>
                  
                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Points</label>
                    <Input 
                      type="number" 
                      name="points"
                      value={newSpace.points}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleAddSpace}>Add Space</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Tabs defaultValue="monday">
              <TabsList className="grid grid-cols-7 w-full">
                {DAYS_OF_WEEK.map(day => (
                  <TabsTrigger key={day} value={day.toLowerCase()}>
                    {day.substring(0, 3)}
                  </TabsTrigger>
                ))}
              </TabsList>
              
              {DAYS_OF_WEEK.map(day => (
                <TabsContent key={day} value={day.toLowerCase()}>
                  {loading ? (
                    <p>Loading spaces...</p>
                  ) : spacesByDay[day].length === 0 ? (
                    <p className="py-4 text-center text-muted-foreground">No spaces scheduled for {day}.</p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Time</TableHead>
                          <TableHead>Title</TableHead>
                          <TableHead>Hosts</TableHead>
                          <TableHead>Points</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {spacesByDay[day].map((space) => {
                          // Format time for display
                          const startTime = new Date(space.start_time);
                          const startHour = startTime.getHours();
                          const startMinute = startTime.getMinutes().toString().padStart(2, '0');
                          
                          let endTimeStr = '';
                          if (space.end_time) {
                            const endTime = new Date(space.end_time);
                            const endHour = endTime.getHours();
                            const endMinute = endTime.getMinutes().toString().padStart(2, '0');
                            endTimeStr = ` - ${endHour}:${endMinute}`;
                          }
                          
                          return (
                            <TableRow key={space.id}>
                              <TableCell>{startHour}:{startMinute}{endTimeStr}</TableCell>
                              <TableCell className="font-medium">{space.title}</TableCell>
                              <TableCell>
                                {space.hosts.map(host => `@${host.username}`).join(', ')}
                              </TableCell>
                              <TableCell>{space.points}</TableCell>
                              <TableCell>
                                <Button 
                                  variant="destructive" 
                                  size="sm"
                                  onClick={() => handleRemoveSpace(space.id)}
                                  disabled={!isAdminView}
                                  title={!isAdminView ? "Admin access required" : "Remove space"}
                                >
                                  Remove
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  )}
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </>
  );
}
