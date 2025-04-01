"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  useActiveAccount,
  AccountProvider,
  useWalletBalance,
  useActiveWallet,
  useConnectedWallets,
  WalletIcon,
  WalletProvider,
  AccountName
} from "thirdweb/react";
// import { defineChain } from "thirdweb/chains";
import { client } from "@/app/client";
import {
  Copy,
  // ExternalLink,
  Check,
  // Twitter as TwitterIcon,
} from "lucide-react";
import { defineChain } from "thirdweb/chains";
import { cn } from "@/lib/utils";
import { useUserData } from "@/hooks/useUserData";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import Image from "next/image";

import { motion } from "framer-motion";

interface Profile {
  profile_img_url: string;
  username: string;
  email: string;
  display_name: string;
}

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedProfile: Profile) => void;
  initialData: Profile;
}
interface BalanceDisplayProps {
  address: string;
}


// Edit Profile Modal
function EditProfileModal({ isOpen, onClose, onSave, initialData }: EditProfileModalProps) {
  const { setUserData } = useUserData();
  const account = useActiveAccount(); // Get active wallet account
  const [formData, setFormData] = useState({ ...initialData, wallet_address: account?.address || "" });

  useEffect(() => {
    setFormData((prev) => ({ ...prev, ...initialData, wallet_address: account?.address || "" }));
  }, [initialData, account?.address]);

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
    }
  };

  const handleSubmit = async () => {
    try {
      // Determine if this is a create or update operation
      const isNewProfile = !userData || !userData.wallet_address;
      const method = isNewProfile ? "POST" : "PUT";
      
      console.log(`${isNewProfile ? 'Creating' : 'Updating'} user profile with data:`, formData);
      
      const response = await fetch("/api/userProfile", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          wallet_address: account?.address // Ensure wallet address is included
        }),
      });

      if (response.ok) {
        const updatedUser = await response.json();
        console.log("Profile saved", updatedUser);
        setUserData(updatedUser);
        onSave(updatedUser);
      } else {
        const errorData = await response.json();
        console.error("Error saving profile:", errorData);
        alert(`Error saving profile: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error("Error saving profile", error);
      alert(`Error saving profile: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
            <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-gray-300">
              <Image
                src={formData.profile_img_url || "/images/pm.PNG"}
                alt="Profile"
                width={96}
                height={96}
                className="w-full h-full object-cover"
              />
              <Image
                src="/images/pm.PNG"
                alt="Primape Logo"
                width={50}
                height={50}
                className="h-8 md:h-9 w-auto"
              />
            </div>
            <input
              type="file"
              accept="image/png, image/jpeg"
              onChange={handleImageChange}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
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
// function ImageModal({ isOpen, onClose, imageUrl }: { isOpen: boolean, onClose: () => void, imageUrl: string }) {
//   if (!isOpen) return null;
//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
//       <div className="relative bg-white p-4 rounded-lg">
//         <div className="w-64 h-64 relative">
//           <Image src={imageUrl} alt="Profile" fill className="object-cover rounded-lg" />
//         </div>
//         <button onClick={onClose} className="absolute top-2 right-2 text-black">✕</button>
//       </div>
//     </div>
//   );
// }


function BalanceDisplay({ address }: BalanceDisplayProps) {
  const chain = defineChain(33139);
  const { data, isLoading } = useWalletBalance({ chain, address, client });

  if (isLoading) return <span className="inline-block w-12 h-4 bg-muted animate-pulse rounded"></span>;
  if (!data || !data.displayValue || !data.symbol) return <span className="font-semibold text-sm">Error loading</span>;

  const formattedValue = `${(Math.ceil(parseFloat(data.displayValue) * 100) / 100).toFixed(2)} ${data.symbol}`;
  return <span className="font-semibold text-sm">{formattedValue}</span>;
}

// User Profile Card
interface UserProfileCardProps {
  viewAddress?: string;
  viewOnly?: boolean;
}

export function UserProfileCard({ viewAddress, viewOnly = false }: UserProfileCardProps) {
  const account = useActiveAccount();
  const { userData, loading, setUserData } = useUserData(viewAddress);
  const linkedAccount: Profile | null = useMemo(() => userData ? {
    profile_img_url: userData.profile_img_url || "",
    username: userData.username || "",
    email: userData.email || "",
    display_name: userData.display_name || ""
  } : null, [userData]);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  // const [isImageModalOpen, setImageModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const portfolio = "0";
  const pnl = "0";
  const [profile, setProfile] = useState<Profile>({
    profile_img_url: "",
    username: "",
    email: "",
    display_name: "",
  });
  
  // Update profile when userData changes
  useEffect(() => {
    if (userData) {
      setProfile({
        profile_img_url: userData.profile_img_url || "",
        username: userData.username || "",
        email: userData.email || "",
        display_name: userData.display_name || "",
      });
    } else {
      setProfile({ profile_img_url: "", username: "", email: "", display_name: "" });
    }
  }, [userData]);

  // Clear the userData state when the user logs out (only for own profile)
  useEffect(() => {
    if (!account && !viewAddress) {
      setUserData(null);
    }
  }, [account, setUserData, viewAddress]);

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

  const activeWallet = useActiveWallet();
  const connectedWallets = useConnectedWallets();
  console.log("Connected Wallets ==>>", { connectedWallets });
  console.log("activeWallet ==>>", { activeWallet });

  return (
    <Card className="overflow-hidden min-w-[250px] flex flex-col items-center">
      <div className="relative">
        <div className="h-24 bg-gradient-to-r from-primary/20 to-primary/40"></div>
        <div className="absolute -bottom-12 left-1/2 -translate-x-1/2">
          <div className="h-24 w-24 rounded-full border-4 border-background bg-background overflow-hidden cursor-pointer">
            {account && profile.profile_img_url ? (
              <Image src={profile.profile_img_url} alt="Profile" width={96} height={96} className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full flex items-center justify-center bg-muted">
                <Image
                  src="/images/pm.PNG"
                  alt="Primape Logo"
                  width={96}
                  height={96}
                  className="h-8 md:h-9 w-auto"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      <CardContent className="pt-16 pb-6 text-center">
        {loading ? <span className="inline-block w-12 h-4 bg-muted animate-pulse rounded"></span> : null}
        {/* If viewing own profile and account exists, or if userData exists, show profile */}
        {(!viewAddress && account) || userData ? (
          <AccountProvider address={viewAddress || (account?.address || "")} client={client}>
            <div>
              <h2 className="text-xl font-bold text-center">
                {formatUsername(profile.display_name)}
              </h2>
              <div className="text-md font-medium text-center mb-1">
                <AccountProvider address={viewAddress || (account?.address || "")} client={client}>
                  <AccountName
                    socialType="ens"
                    loadingComponent={<span>Loading ENS...</span>}
                    fallbackComponent={<span>{shortenAddress(viewAddress || account?.address)}</span>}
                  />
                </AccountProvider>
              </div>
              <p className="text-sm text-muted-foreground text-center">{profile.email === "No User Email" ? "" : profile.email}</p>
              <div className="mt-2 flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <span>{shortenAddress(viewAddress || account?.address)}</span>
                <button onClick={() => copyToClipboard(viewAddress || account?.address)} className="rounded-full p-1 hover:bg-muted">
                  {copied ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                </button>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <div className="grid grid-cols-3 divide-x">
                <div className="flex flex-col p-2">
                  <span className="text-muted-foreground text-xs">Balance</span>
                  <BalanceDisplay address={viewAddress || account?.address || ""} />
                </div>
                <div className="flex flex-col p-2">
                  <span className="text-muted-foreground text-xs">Portfolio</span>
                  <span className="font-semibold text-sm">{portfolio} APE</span>
                </div>
                <div className="flex flex-col p-2">
                  <span className="text-muted-foreground text-xs">Profit/Loss</span>
                  <span className={cn("font-semibold text-sm", formattedPnl.startsWith("+") ? "text-green-600" : formattedPnl.startsWith("-") ? "text-red-600" : "")}>
                    {formattedPnl} APE
                  </span>
                </div>
              </div>

              {/* Show edit button for own profile, even if userData doesn't exist yet */}
              {!viewOnly && (
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="w-full" 
                  onClick={() => setEditModalOpen(true)}
                >
                  {userData ? "Edit Profile" : "Create Profile"}
                </Button>
              )}
            </div>
            {!viewOnly && (
              <div className="mt-6 border-t pt-4 rounded-lg shadow-lg p-6">
                <h3 className="font-semibold text-lg text-white-800">Connected Wallets</h3>
                {connectedWallets.length > 0 ? (
                  <div className="space-y-4 mt-4">
                    {connectedWallets.map((wallet) => (
                      <motion.div
                        key={wallet.id}
                        className={`flex items-center justify-between p-3 rounded-lg transition-all duration-300 ${wallet.id === activeWallet?.id ? 'bg-blue-100 border-l-8 border-blue-500' : 'bg-gray-100'}`}
                        whileHover={{ scale: 1.05 }}
                      >
                        <span className="text-gray-700 font-medium pr-2">{wallet.id}</span>
                        <WalletProvider id={wallet.id}>
                          <WalletIcon className="h-8 w-8 rounded-full shadow-md" />
                        </WalletProvider>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <motion.p
                    className="text-gray-500 text-sm mt-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    No wallets connected
                  </motion.p>
                )}
              </div>
            )}

            {/* <div className="mt-6 border-t pt-4">
              <h3 className="font-medium text-sm">Connections</h3>
              <div className="flex items-center justify-between text-sm">
                <TwitterIcon className="h-4 w-4 text-[#1D9BF0]" />
                <span>Not connected</span>
                <Button size="sm" variant="ghost" className="h-7 px-2"><ExternalLink className="h-3 w-3" /></Button>
              </div>
            </div> */}
          </AccountProvider>
        ) : (
          // Only show "Not Connected" if there's truly no connected account
          account ? (
            <h2 className="text-xl font-bold">Setup Your Profile</h2>
          ) : (
            <h2 className="text-xl font-bold">Not Connected</h2>
          )
        )}
      </CardContent>

      <EditProfileModal isOpen={isEditModalOpen} onClose={() => setEditModalOpen(false)} onSave={handleSaveProfile} initialData={profile} />
      {/* <ImageModal isOpen={isImageModalOpen} onClose={() => setImageModalOpen(false)} imageUrl={profile.profile_img_url} /> */}
    </Card>
  );
}