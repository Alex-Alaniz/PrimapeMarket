"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  useActiveAccount,
  useWalletBalance,
  AccountProvider,
} from "thirdweb/react";
import { defineChain } from "thirdweb/chains";
// import { shortenAddress } from "thirdweb/utils";
import { client } from "@/app/client";
import {
  Copy,
  ExternalLink,
  Check,
  Twitter as TwitterIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUserBalance } from "@/hooks/useUserBalance";
import { useUserData } from "@/hooks/useUserData";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";


// Modal Component
function EditProfileModal({ isOpen, onClose, onSave, initialData }: any) {
  const [formData, setFormData] = useState(initialData);

  useEffect(() => {
    setFormData(initialData);
  }, [initialData]);

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    onSave(formData);
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
          <input
            type="text"
            name="picture"
            placeholder="Profile Image URL"
            value={formData.picture}
            onChange={handleChange}
            className="w-full mb-2 p-2 border rounded"
          />
          <input
            type="text"
            name="name"
            placeholder="Name"
            value={formData.name}
            onChange={handleChange}
            className="w-full mb-2 p-2 border rounded"
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className="w-full mb-4 p-2 border rounded"
          />
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog >
  );
}

// Image Modal Component
function ImageModal({ isOpen, onClose, imageUrl }: any) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="relative bg-white p-4 rounded-lg">
        <img src={imageUrl} alt="Profile" className="w-64 h-64 object-cover rounded-lg" />
        <button onClick={onClose} className="absolute top-2 right-2 text-white">
          ✕
        </button>
      </div>
    </div>
  );
}

// Balance Display Component
function BalanceDisplay({ address }: { address: string }) {
  const chain = defineChain(33139); // ApeChain
  const { data, isLoading } = useWalletBalance({ chain, address, client });

  if (isLoading) return <span className="inline-block w-12 h-4 bg-muted animate-pulse rounded"></span>;
  if (!data || !data.displayValue || !data.symbol) return <span className="font-semibold text-sm">Error loading</span>;

  const formattedValue = `${(Math.ceil(parseFloat(data.displayValue) * 100) / 100).toFixed(2)} ${data.symbol}`;
  return <span className="font-semibold text-sm">{formattedValue}</span>;
}

// User Profile Card Component
export function UserProfileCard() {
  const account = useActiveAccount();
  const [copied, setCopied] = useState(false);
  const { portfolio = "0", pnl = "0" } = useUserBalance() || {};
  const { userData } = useUserData(account?.address);
  const linkedAccount = Array.isArray(userData?.linkedAccounts) ? userData.linkedAccounts[0] : null;

  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [isImageModalOpen, setImageModalOpen] = useState(false);
  const [profile, setProfile] = useState({
    picture: linkedAccount?.details?.picture || "",
    name: linkedAccount?.details?.name || "",
    email: linkedAccount?.details?.email || "",
  });

  useEffect(() => {
    if (linkedAccount?.details) {
      setProfile({
        picture: linkedAccount.details.picture || "",
        name: linkedAccount.details.name || "",
        email: linkedAccount.details.email || "",
      });
    }
  }, [linkedAccount]);

  const shortenAddress = (address?: string) => {
    if (!address) return "";
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  const copyToClipboard = (text?: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveProfile = (updatedProfile: any) => {
    setProfile(updatedProfile);
  };
  function formatUsername(name: string | undefined) {
    if (!name) return "";
    return name
      .toLowerCase()        // Convert to lowercase
      .replace(/\s+/g, '')  // Remove all spaces
      .replace(/[^a-z0-9]/g, ''); // Remove any character that's not a letter or digit
  }


  const formattedPnl = pnl ?? "0";

  return (
    <Card className="overflow-hidden min-w-[250px] flex flex-col items-center">
      <div className="relative">
        <div className="h-24 bg-gradient-to-r from-primary/20 to-primary/40"></div>
        <div className="absolute -bottom-12 left-1/2 -translate-x-1/2">
          <div
            className="h-24 w-24 rounded-full border-4 border-background bg-background overflow-hidden cursor-pointer"
            onClick={() => setImageModalOpen(true)}
          >
            {account && profile.picture ? (
              <img src={profile.picture} alt="Profile" className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full flex items-center justify-center bg-muted">
                <span className="text-2xl">?</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <CardContent className="pt-16 pb-6 text-center">
        {account ? (
          <AccountProvider address={account.address} client={client}>
            <div>
              <h2 className="text-xl font-bold text-center">{formatUsername(profile.name) || shortenAddress(account.address)}</h2>
              <p className="text-sm text-muted-foreground text-center">{profile.email || ""}</p>
              <div className="mt-2 flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <span>
                  <span>{shortenAddress(account.address)}</span>
                </span>
                <button onClick={() => copyToClipboard(account.address)} className="rounded-full p-1 hover:bg-muted">
                  {copied ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                </button>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <div className="grid grid-cols-3 divide-x">
                <div className="flex flex-col p-2">
                  <span className="text-muted-foreground text-xs">Balance</span>
                  {account.address && <BalanceDisplay address={account.address} />}
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

              <Button size="sm" variant="outline" className="w-full" onClick={() => setEditModalOpen(true)}>
                Edit Profile
              </Button>
            </div>

            <div className="mt-6 border-t pt-4">
              <h3 className="font-medium text-sm">Connections</h3>
              <div className="mt-2 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <TwitterIcon className="h-4 w-4 text-[#1D9BF0]" />
                    <span>Not connected</span>
                  </div>
                  <Button size="sm" variant="ghost" className="h-7 px-2">
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          </AccountProvider>
        ) : (
          <h2 className="text-xl font-bold">Not Connected</h2>
        )}
      </CardContent>

      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setEditModalOpen(false)}
        onSave={handleSaveProfile}
        initialData={profile}
      />

      <ImageModal
        isOpen={isImageModalOpen}
        onClose={() => setImageModalOpen(false)}
        imageUrl={profile.picture}
      />
    </Card>
  );
}
