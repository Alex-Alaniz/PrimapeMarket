
"use client";

import { useState, useEffect } from "react";
import { useActiveAccount, useConnect } from "thirdweb/react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";

interface UserProfile {
  user_id: number;
  primary_wallet: string;
  display_name: string;
  created_at: string;
}

export default function ProfilePage() {
  const account = useActiveAccount();
  const address = account?.address;
  const { connect } = useConnect();
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Fetch profile when address is available
  useEffect(() => {
    if (address) {
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, [address]);

  async function fetchProfile() {
    try {
      setLoading(true);
      const response = await fetch(`/api/users/profile?wallet=${address}`);
      
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
        setDisplayName(data.display_name);
      } else if (response.status === 404) {
        // User not found is expected for new users
        setProfile(null);
      } else {
        const error = await response.json();
        setError(error.message || "Failed to fetch profile");
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
      setError("Error connecting to server");
    } finally {
      setLoading(false);
    }
  }

  async function createProfile() {
    if (!address || !displayName.trim()) return;
    
    try {
      setCreating(true);
      setError(null);
      
      const response = await fetch('/api/users/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          wallet: address,
          displayName: displayName.trim()
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
        toast({
          title: "Profile created!",
          description: "Your profile has been created successfully.",
        });
      } else {
        const error = await response.json();
        setError(error.error || "Failed to create profile");
      }
    } catch (err) {
      console.error("Error creating profile:", err);
      setError("Error connecting to server");
    } finally {
      setCreating(false);
    }
  }

  async function updateProfile() {
    if (!address || !displayName.trim() || !profile) return;
    
    try {
      setUpdating(true);
      setError(null);
      
      const response = await fetch(`/api/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          wallet: address,
          displayName: displayName.trim()
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
        toast({
          title: "Profile updated!",
          description: "Your display name has been updated successfully.",
        });
      } else {
        const error = await response.json();
        setError(error.error || "Failed to update profile");
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      setError("Error connecting to server");
    } finally {
      setUpdating(false);
    }
  }

  if (!address) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>User Profile</CardTitle>
            <CardDescription>Connect your wallet to view or create your profile</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => connect.show()}>Connect Wallet</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">Loading profile...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>{profile ? "Your Profile" : "Create Profile"}</CardTitle>
          <CardDescription>
            {profile 
              ? `Connected with ${address?.substring(0, 6)}...${address?.substring(address.length - 4)}`
              : "Set up your profile to participate in prediction markets"
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Enter a display name"
              />
            </div>
            
            <div>
              <Label>Wallet Address</Label>
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-1 break-all">
                {address}
              </div>
            </div>
            
            {profile ? (
              <Button 
                onClick={updateProfile} 
                disabled={updating || displayName.trim() === profile.display_name}
              >
                {updating ? "Updating..." : "Update Profile"}
              </Button>
            ) : (
              <Button 
                onClick={createProfile} 
                disabled={creating || !displayName.trim()}
              >
                {creating ? "Creating..." : "Create Profile"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
