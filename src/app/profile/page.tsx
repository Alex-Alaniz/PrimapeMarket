
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/use-toast";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, CheckCircle, LinkIcon } from "lucide-react";

interface UserProfile {
  user_id: number;
  primary_wallet: string;
  display_name: string;
  created_at: string;
  linked_profiles?: any[];
}

interface LinkRequestStatus {
  id: string;
  status: string;
  identityType: string;
  createdAt: string;
}

export default function ProfilePage() {
  const { account, isLoggedIn, AuthButton } = useAuth();
  const address = account?.address;
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Link profile states
  const [linkProvider, setLinkProvider] = useState<string>("email");
  const [linkData, setLinkData] = useState<string>("");
  const [isLinking, setIsLinking] = useState(false);
  const [activeRequests, setActiveRequests] = useState<LinkRequestStatus[]>([]);
  const [linkedProfiles, setLinkedProfiles] = useState<any[]>([]);

  // Fetch profile when address is available
  useEffect(() => {
    if (address) {
      fetchProfile();
      fetchLinkHistory();
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
        if (data.linked_profiles) {
          setLinkedProfiles(data.linked_profiles);
        }
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

  async function fetchLinkHistory() {
    if (!address) return;
    
    try {
      const response = await fetch(`/api/users/link-profile?wallet=${address}`);
      
      if (response.ok) {
        const history = await response.json();
        const pendingRequests = history.filter((req: any) => req.status === "pending");
        setActiveRequests(pendingRequests);
      }
    } catch (err) {
      console.error("Error fetching link history:", err);
    }
  }

  async function createProfile() {
    if (!address || !displayName.trim()) return;
    
    try {
      setCreating(true);
      setError(null);
      
      const response = await fetch(`/api/users/profile`, {
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

  async function initiateProfileLink() {
    if (!address || !linkProvider || !linkData) return;
    
    try {
      setIsLinking(true);
      setError(null);
      
      const response = await fetch(`/api/users/link-profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          wallet: address,
          provider: linkProvider,
          data: linkData
        }),
      });
      
      if (response.ok) {
        const linkRequest = await response.json();
        setActiveRequests([...activeRequests, linkRequest]);
        toast({
          title: "Verification sent",
          description: `Please check your ${linkProvider} for a verification link.`,
        });
        setLinkData("");
      } else {
        const error = await response.json();
        setError(error.error || "Failed to initiate link");
      }
    } catch (err) {
      console.error("Error linking profile:", err);
      setError("Error connecting to server");
    } finally {
      setIsLinking(false);
    }
  }

  async function checkRequestStatus(requestId: string) {
    if (!address || !requestId) return;
    
    try {
      const response = await fetch(`/api/users/link-profile?wallet=${address}&linkRequestId=${requestId}`);
      
      if (response.ok) {
        const status = await response.json();
        
        // Update local state based on status
        if (status.status === "complete") {
          toast({
            title: "Link completed!",
            description: `Your ${status.identityType} has been linked successfully.`,
          });
          
          // Remove from active requests
          setActiveRequests(activeRequests.filter(req => req.id !== requestId));
          
          // Refresh profile to get updated linked profiles
          fetchProfile();
        } else if (status.status === "failed") {
          toast({
            title: "Link failed",
            description: `Failed to link your ${status.identityType}.`,
            variant: "destructive"
          });
          
          // Remove from active requests
          setActiveRequests(activeRequests.filter(req => req.id !== requestId));
        }
      }
    } catch (err) {
      console.error("Error checking request status:", err);
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
            <AuthButton />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>Create Your Profile</CardTitle>
            <CardDescription>Set up your profile to participate in markets</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="wallet">Wallet Address</Label>
                <Input id="wallet" value={address} disabled />
              </div>
              <div className="space-y-2">
                <Label htmlFor="displayName">Display Name</Label>
                <Input 
                  id="displayName" 
                  placeholder="Choose a username" 
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                />
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              onClick={createProfile} 
              disabled={creating || !displayName.trim()}
            >
              {creating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Create Profile
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <Tabs defaultValue="profile">
        <TabsList className="mb-4">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="link">Link Identities</TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Your Profile</CardTitle>
              <CardDescription>Manage your profile information</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="wallet">Wallet Address</Label>
                  <Input id="wallet" value={profile.primary_wallet} disabled />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="displayName">Display Name</Label>
                  <Input 
                    id="displayName" 
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                  />
                </div>
                {error && <p className="text-red-500 text-sm">{error}</p>}
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={updateProfile} 
                disabled={updating || !displayName.trim() || displayName === profile.display_name}
              >
                {updating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Update Profile
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="link">
          <Card>
            <CardHeader>
              <CardTitle>Link Identities</CardTitle>
              <CardDescription>Connect social accounts or email to your profile</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Linked profiles section */}
                {linkedProfiles.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium mb-2">Linked Identities</h3>
                    <div className="space-y-2">
                      {linkedProfiles.map((profile, index) => (
                        <div key={index} className="flex items-center gap-2 p-2 bg-secondary/50 rounded-md">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span>{profile.type}: {profile.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Pending requests section */}
                {activeRequests.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium mb-2">Pending Verifications</h3>
                    <div className="space-y-2">
                      {activeRequests.map((request) => (
                        <div key={request.id} className="flex items-center justify-between p-2 bg-secondary/50 rounded-md">
                          <div className="flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>{request.identityType} verification pending</span>
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => checkRequestStatus(request.id)}
                          >
                            Check Status
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Link new identity form */}
                <div>
                  <h3 className="text-lg font-medium mb-2">Link New Identity</h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="provider">Identity Type</Label>
                      <Select value={linkProvider} onValueChange={setLinkProvider}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select identity type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="email">Email</SelectItem>
                          <SelectItem value="phone">Phone</SelectItem>
                          <SelectItem value="google">Google</SelectItem>
                          <SelectItem value="discord">Discord</SelectItem>
                          <SelectItem value="github">GitHub</SelectItem>
                          <SelectItem value="twitter">Twitter</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="linkData">
                        {linkProvider === "email" ? "Email Address" : 
                         linkProvider === "phone" ? "Phone Number" : 
                         "Identity Information"}
                      </Label>
                      <Input 
                        id="linkData" 
                        value={linkData}
                        onChange={(e) => setLinkData(e.target.value)}
                        placeholder={
                          linkProvider === "email" ? "your@email.com" : 
                          linkProvider === "phone" ? "+1234567890" : 
                          "Enter your identity info"
                        }
                      />
                    </div>
                    
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={initiateProfileLink} 
                disabled={isLinking || !linkData.trim()}
              >
                {isLinking ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LinkIcon className="mr-2 h-4 w-4" />}
                Link Identity
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
