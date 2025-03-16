import { useState, useEffect } from 'react';
import { useActiveAccount } from 'thirdweb/react';
import { UserProfile as DBUserProfile, Prediction } from '@/lib/db-models';

interface UserProfile extends DBUserProfile {
  recent_predictions?: Prediction[];
}

interface ProfileResponse {
  profile: UserProfile;
  recent_predictions?: Prediction[];
}

export function useUserProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const account = useActiveAccount();

  useEffect(() => {
    const fetchProfile = async () => {
      if (!account) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      
      try {
        // Fetch profile data from the API
        const response = await fetch(`/api/user/profile?wallet=${account.address}`);
        
        if (!response.ok) {
          // If user not found, they might need to register
          if (response.status === 404) {
            setProfile(null);
            return;
          }
          throw new Error(`API error: ${response.status}`);
        }
        
        const result: ProfileResponse = await response.json();
        
        setProfile({
          ...result.profile,
          recent_predictions: result.recent_predictions
        });
      } catch (err) {
        setError(err instanceof Error ? err : new Error('An unknown error occurred'));
        console.error('Error fetching profile:', err);
        setProfile(null);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProfile();
  }, [account]);
  
  const updateProfile = async (data: { username?: string; bio?: string; avatar_url?: string }) => {
    if (!account) return false;
    
    try {
      const response = await fetch('/api/user/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          wallet_address: account.address,
          ...data
        }),
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const result = await response.json();
      
      // Update local state
      setProfile(prev => prev ? { ...prev, ...result.profile } : result.profile);
      
      return true;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('An unknown error occurred'));
      console.error('Error updating profile:', err);
      return false;
    }
  };
  
  const registerProfile = async (username: string, bio?: string, avatar_url?: string) => {
    return updateProfile({ username, bio, avatar_url });
  };
  
  return { profile, isLoading, error, updateProfile, registerProfile };
} 