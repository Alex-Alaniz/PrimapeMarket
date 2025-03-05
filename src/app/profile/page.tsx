
"use client";

import { useState, useEffect } from "react";
import { useActiveAccount, useConnect, useConnectionStatus } from "thirdweb/react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface UserProfile {
  user_id: number;
  primary_wallet: string;
  display_name: string;
  created_at: string;
}

export default function ProfilePage() {
  const account = useActiveAccount();
  const address = account?.address;
  const connect = useConnect();
  const connectionStatus = useConnectionStatus();
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (connectionStatus === "connected" && address) {
      fetchProfile();
    } else if (connectionStatus === "disconnected" || connectionStatus === "connecting") {
      setLoading(false);
    }
  }, [address, connectionStatus]);

  async function fetchProfile() {
    try {
      setLoading(true);
      const response = await fetch(`/api/users/profile?wallet=${address}`);
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
        setDisplayName(data.display_name || "");
      } else if (response.status === 404) {
        setProfile(null);
      } else {
        throw new Error("Failed to fetch profile");
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      setError("Failed to load profile");
    } finally {
      setLoading(false);
    }
  }

  async function createProfile() {
    if (!address || !displayName.trim()) return;
    
    try {
      setLoading(true);
      const response = await fetch("/api/users/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wallet: address, displayName })
      });
      
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
        setError(null);
      } else {
        throw new Error("Failed to create profile");
      }
    } catch (error) {
      console.error("Error creating profile:", error);
      setError("Failed to create profile");
    } finally {
      setLoading(false);
    }
  }

  async function updateProfile() {
    if (!profile || !displayName.trim()) return;
    
    try {
      setLoading(true);
      const response = await fetch(`/api/users/profile?userId=${profile.user_id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName })
      });
      
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
        setError(null);
      } else {
        throw new Error("Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      setError("Failed to update profile");
    } finally {
      setLoading(false);
    }
  }

  if (connectionStatus === "disconnected") {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>User Profile</CardTitle>
            <CardDescription>Connect your wallet to view or create your profile</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => connect()}>Connect Wallet</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (connectionStatus === "connecting") {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">Connecting wallet...</div>
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
            {profile ? "Update your profile information" : "Set up your PrimapeMarket profile"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && <div className="mb-4 p-3 bg-red-500/10 text-red-500 rounded-md">{error}</div>}
          
          <div className="mb-4">
            <Label htmlFor="wallet">Wallet Address</Label>
            <Input id="wallet" value={address} disabled className="mt-1" />
          </div>
          
          <div className="mb-4">
            <Label htmlFor="displayName">Display Name</Label>
            <Input 
              id="displayName" 
              value={displayName} 
              onChange={(e) => setDisplayName(e.target.value)} 
              className="mt-1" 
              placeholder="Enter your display name"
            />
          </div>
          
          {profile ? (
            <Button onClick={updateProfile} disabled={loading}>
              {loading ? "Updating..." : "Update Profile"}
            </Button>
          ) : (
            <Button onClick={createProfile} disabled={loading}>
              {loading ? "Creating..." : "Create Profile"}
            </Button>
          )}
          
          {profile && (
            <div className="mt-4 text-sm text-muted-foreground">
              Account created on: {new Date(profile.created_at).toLocaleDateString()}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
