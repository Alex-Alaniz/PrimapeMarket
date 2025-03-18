"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  useActiveAccount,
  // useWalletBalance,
  AccountProvider,
} from "thirdweb/react";
// import { defineChain } from "thirdweb/chains";
import { client } from "@/app/client";
import {
  Copy,
  ExternalLink,
  Check,
  Twitter as TwitterIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUserData } from "@/hooks/useUserData";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import Image from "next/image";


interface Profile {
  profile_img_url: string;
  username: string;
  email: string;
  display_name: string;
}

// interface UserData {
//   profile_img_url?: string;
//   username?: string;
//   email?: string;
//   display_name?: string;
// }

// interface BalanceDisplayProps {
//   address: string;
//   userData: Profile | null;
// }

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedProfile: Profile) => void;
  initialData: Profile;
}


// Edit Profile Modal
function EditProfileModal({ isOpen, onClose, onSave, initialData }: EditProfileModalProps) {
  const { setUserData } = useUserData();
  const [formData, setFormData] = useState(initialData);
  // const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    setFormData(initialData);
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && (file.type === "image/png" || file.type === "image/jpeg")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, profile_img_url: reader.result as string }));
      };
      reader.readAsDataURL(file);
      // setSelectedFile(file);
    }
  };

  const handleSubmit = async () => {
    try {
      const response = await fetch("/api/userProfile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        const updatedUser = await response.json();
        console.log("Profile updated", updatedUser);
        setUserData(updatedUser);
        onSave(updatedUser);
      } else {
        console.error("Error updating profile");
      }
    } catch (error) {
      console.error("Error updating profile", error);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="relative w-24 h-24 mx-auto">
            <Image src={formData.profile_img_url} alt="Profile" width={96} height={96} className="rounded-full object-cover" />
            <input type="file" accept="image/png, image/jpeg" onChange={handleImageChange} className="absolute inset-0 opacity-0 cursor-pointer" />
          </div>
          <input type="text" name="display_name" placeholder="Name" value={formData.display_name} onChange={handleChange} className="w-full mb-2 p-2 border rounded" />
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Image Modal
function ImageModal({ isOpen, onClose, imageUrl }: { isOpen: boolean, onClose: () => void, imageUrl: string }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="relative bg-white p-4 rounded-lg">
        <div className="w-64 h-64 relative">
          <Image src={imageUrl} alt="Profile" fill className="object-cover rounded-lg" />
        </div>
        <button onClick={onClose} className="absolute top-2 right-2 text-black">✕</button>
      </div>
    </div>
  );
}

// function BalanceDisplay({ userData }: BalanceDisplayProps) {
//   const linkAccount: Profile | null = userData ? {
//     profile_img_url: userData.profile_img_url ?? "",
//     username: userData.username ?? "",
//     email: userData.email ?? "",
//     display_name: userData.display_name ?? ""
//   } : null;
// }

// User Profile Card
export function UserProfileCard() {
  const account = useActiveAccount();
  const { userData, loading, setUserData } = useUserData();
  const linkedAccount: Profile | null = useMemo(() => userData ? {
    profile_img_url: userData.profile_img_url || "",
    username: userData.username || "",
    email: userData.email || "",
    display_name: userData.display_name || ""
  } : null, [userData]);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [isImageModalOpen, setImageModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const portfolio = "0";
  const pnl = "0";
  const [profile, setProfile] = useState({
    profile_img_url: linkedAccount?.profile_img_url || "",
    username: linkedAccount?.username || "",
    email: linkedAccount?.email || "",
    display_name: linkedAccount?.display_name || "",
  });

  // clear the userData state when the user logs out 
  useEffect(() => {
    if (!account) {
      setUserData(null);
    }
  }, [account, setUserData]);

  useEffect(() => {
    if (linkedAccount) setProfile(linkedAccount);
  }, [linkedAccount]);

  const shortenAddress = (address?: string) => address ? `${address.substring(0, 6)}...${address.substring(address.length - 4)}` : "";
  const copyToClipboard = (text?: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveProfile = (updatedProfile: Profile) => setProfile(updatedProfile);
  const formatUsername = (name: string) => name?.toLowerCase().replace(/\s+/g, "").replace(/[^a-z0-9]/g, "") || "";
  const formattedPnl = pnl ?? "0";

  return (
    <Card className="overflow-hidden min-w-[250px] flex flex-col items-center">
      <div className="relative">
        <div className="h-24 bg-gradient-to-r from-primary/20 to-primary/40"></div>
        <div className="absolute -bottom-12 left-1/2 -translate-x-1/2">
          <div className="h-24 w-24 rounded-full border-4 border-background bg-background overflow-hidden cursor-pointer" onClick={() => setImageModalOpen(true)}>
            {account && profile.profile_img_url ? (
              <Image src={profile.profile_img_url} alt="Profile" width={96} height={96} className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full flex items-center justify-center bg-muted">
                <span className="text-2xl">?</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <CardContent className="pt-16 pb-6 text-center">
        {account && loading ? <span className="inline-block w-12 h-4 bg-muted animate-pulse rounded"></span> : null}
        {account ? (
          <AccountProvider address={account.address} client={client}>
            <div>
              <h2 className="text-xl font-bold text-center">{formatUsername(profile.display_name) || shortenAddress(account.address)}</h2>
              <p className="text-sm text-muted-foreground text-center">{profile.email || ""}</p>
              <div className="mt-2 flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <span>{shortenAddress(account.address)}</span>
                <button onClick={() => copyToClipboard(account.address)} className="rounded-full p-1 hover:bg-muted">
                  {copied ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                </button>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <div className="grid grid-cols-3 divide-x">
                <div className="flex flex-col p-2">
                  {account.address}
                  {account.address}
                </div>
                <div className="flex flex-col p-2">
                  <span className="text-muted-foreground text-xs">Portfolio</span>
                  <span className="font-semibold text-sm">{portfolio} APE</span>
                </div>
                <div className="flex flex-col p-2">
                  <span className="text-muted-foreground text-xs">Profit/Loss</span>
                  <span className={cn("font-semibold text-sm", formattedPnl.startsWith("+") ? "text-green-600" : formattedPnl.startsWith("-") ? "text-red-600" : "")}>
                    {formattedPnl} APE
                  </span>                </div>
              </div>

              <Button size="sm" variant="outline" className="w-full" onClick={() => setEditModalOpen(true)}>
                Edit Profile
              </Button>
            </div>

            <div className="mt-6 border-t pt-4">
              <h3 className="font-medium text-sm">Connections</h3>
              <div className="flex items-center justify-between text-sm">
                <TwitterIcon className="h-4 w-4 text-[#1D9BF0]" />
                <span>Not connected</span>
                <Button size="sm" variant="ghost" className="h-7 px-2"><ExternalLink className="h-3 w-3" /></Button>
              </div>
            </div>
          </AccountProvider>
        ) : <h2 className="text-xl font-bold">Not Connected</h2>}
      </CardContent>

      <EditProfileModal isOpen={isEditModalOpen} onClose={() => setEditModalOpen(false)} onSave={handleSaveProfile} initialData={profile} />
      <ImageModal isOpen={isImageModalOpen} onClose={() => setImageModalOpen(false)} imageUrl={profile.profile_img_url} />
    </Card>
  );
}
