
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useActiveAccount } from "thirdweb/react";
import { useToast } from "./ui/use-toast";
import Image from "next/image";

export function UserProfile() {
  const account = useActiveAccount();
  const { toast } = useToast();
  const [profile, setProfile] = useState<any>(null);
  const [activity, setActivity] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    bio: '',
    profileImage: ''
  });
  
  // Fetch user profile
  useEffect(() => {
    if (account) {
      fetchProfile();
      fetchActivity();
    }
  }, [account]);
  
  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/profile');
      if (!response.ok) throw new Error('Failed to fetch profile');
      
      const data = await response.json();
      setProfile(data.user);
      setFormData({
        username: data.user.username || '',
        bio: data.user.bio || '',
        profileImage: data.user.profileImage || ''
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast({
        title: "Error",
        description: "Failed to load profile data",
        variant: "destructive"
      });
    }
  };
  
  const fetchActivity = async () => {
    try {
      const response = await fetch('/api/activity');
      if (!response.ok) throw new Error('Failed to fetch activity');
      
      const data = await response.json();
      setActivity(data.activity);
    } catch (error) {
      console.error('Error fetching activity:', error);
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) throw new Error('Failed to update profile');
      
      const data = await response.json();
      setProfile(data.user);
      setIsEditing(false);
      
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated",
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive"
      });
    }
  };
  
  if (!account) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>User Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Please connect your wallet to view your profile.</p>
        </CardContent>
      </Card>
    );
  }
  
  if (!profile) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>User Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Loading profile...</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Your Profile</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="profile">
          <TabsList>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile">
            {isEditing ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="profileImage" className="block text-sm font-medium mb-1">
                    Profile Image URL
                  </label>
                  <Input
                    id="profileImage"
                    name="profileImage"
                    value={formData.profileImage}
                    onChange={handleInputChange}
                    placeholder="https://example.com/image.png"
                  />
                </div>
                
                <div>
                  <label htmlFor="username" className="block text-sm font-medium mb-1">
                    Username
                  </label>
                  <Input
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    placeholder="Your preferred display name"
                  />
                </div>
                
                <div>
                  <label htmlFor="bio" className="block text-sm font-medium mb-1">
                    Bio
                  </label>
                  <Textarea
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    placeholder="Tell us about yourself"
                    rows={4}
                  />
                </div>
                
                <div className="flex space-x-2">
                  <Button type="submit">Save Changes</Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsEditing(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-24 h-24 rounded-full overflow-hidden relative bg-gray-100">
                    {profile.profileImage ? (
                      <Image 
                        src={profile.profileImage} 
                        alt="Profile" 
                        fill 
                        className="object-cover" 
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-400">
                        No Image
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-semibold">
                      {profile.username || 'Anonymous User'}
                    </h3>
                    <p className="text-sm text-gray-500 break-all">{account.address}</p>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium mb-1">Bio</h4>
                  <p className="text-gray-700">{profile.bio || 'No bio provided.'}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div>
                    <h4 className="text-sm font-medium mb-1">Total Winnings</h4>
                    <p className="text-xl font-semibold">{Number(profile.totalWinnings).toFixed(4)} APE</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium mb-1">Win Rate</h4>
                    <p className="text-xl font-semibold">{profile.winRate}%</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium mb-1">Markets Participated</h4>
                    <p className="text-xl font-semibold">{profile.totalParticipation}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium mb-1">Leaderboard Rank</h4>
                    <p className="text-xl font-semibold">#{profile.rank || 'N/A'}</p>
                  </div>
                </div>
                
                <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="activity">
            {!activity ? (
              <p>Loading activity...</p>
            ) : (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Recent Activity</h3>
                
                {activity.results.length === 0 && activity.participations.length === 0 ? (
                  <p>No activity yet. Start participating in prediction markets!</p>
                ) : (
                  <div className="space-y-4">
                    {activity.participations.slice(0, 5).map((p: any) => (
                      <div key={p.id} className="p-3 border rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium">Bought shares in Market #{p.marketId}</h4>
                            <p className="text-sm text-gray-600">
                              Option #{p.optionIndex} • {new Date(p.timestamp).toLocaleString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">{Number(p.amount).toFixed(4)} APE</p>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {activity.results.slice(0, 5).map((r: any) => (
                      <div key={r.id} className="p-3 border rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium">
                              {r.wonMarket ? 'Won' : 'Lost'} in Market #{r.marketId}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {r.claimed ? 'Claimed' : 'Not claimed'} • 
                              {new Date(r.timestamp).toLocaleString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className={`font-medium ${r.wonMarket ? 'text-green-600' : 'text-red-600'}`}>
                              {r.wonMarket ? `+${Number(r.amountWon).toFixed(4)} APE` : 
                                `-${Number(r.amountInvested).toFixed(4)} APE`}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
