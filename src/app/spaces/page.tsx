
'use client';

import { useState, useEffect } from 'react';
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { useToast } from "@/components/ui/use-toast";
import { SpacesContainer } from "@/components/spaces/spaces-container";
import { Button } from "@/components/ui/button";
import { Twitter } from "lucide-react";
import Link from "next/link";

export default function SpacesPage() {
  const { toast } = useToast();
  const [mounted, setMounted] = useState(false);
  
  // Ensure proper hydration in PWA environment
  useEffect(() => {
    setMounted(true);
  }, []);
  
  interface XSpace {
    id: string;
    title: string;
    description: string | null;
    start_time: string;
    end_time: string | null;
    day_of_week: string;
    recurring: boolean;
    formatted_start_time: string;
    formatted_end_time: string;
    display_time: string;
    points: number;
    hosts: {
      id: string;
      username: string;
      name: string | null;
      profile_image_url: string | null;
    }[];
  }

  const [spacesData, setSpacesData] = useState<Record<string, XSpace[]>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSpaces = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/spaces');
        const data = await response.json();
        
        if (response.ok) {
          setSpacesData(data);
        } else {
          toast({
            title: 'Error',
            description: 'Failed to fetch spaces schedule',
            variant: 'destructive'
          });
        }
      } catch (error) {
        console.error('Error fetching spaces:', error);
        toast({
          title: 'Error',
          description: 'An unexpected error occurred',
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchSpaces();
  }, [toast]);

  // Featured hosts are displayed in the UI directly

  if (!mounted) {
    return (
      <div className="flex min-h-screen flex-col">
        <div className="container py-4">
          <Navbar />
          <div className="mt-8">
            <h1 className="text-3xl font-bold">ApeChain 𝕏 Spaces Schedule</h1>
            <p className="text-muted-foreground mt-2">Loading spaces...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <div className="container py-4">
        <Navbar />

        <div className="mt-8">
          <div className="flex flex-col lg:flex-row justify-between items-start gap-6">
            <div>
              <h1 className="text-3xl font-bold">ApeChain 𝕏 Spaces Schedule</h1>
              <p className="text-muted-foreground mt-2 max-w-2xl">
                Join our community 𝕏 spaces throughout the week and engage with top ApeChain creators.
                Earn points by participating and engaging with creators through posts and spaces.
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <Button asChild variant="outline">
                <Link href="https://twitter.com/i/spaces" target="_blank" rel="noopener noreferrer">
                  <Twitter className="w-4 h-4 mr-2" />
                  View Live 𝕏 Spaces
                </Link>
              </Button>
            </div>
          </div>

          <div className="mt-8">
            <SpacesContainer 
              spacesData={spacesData} 
              isLoading={isLoading} 
            />
          </div>

          <div className="mt-12 p-6 bg-blue-950 rounded-lg text-white">
            <h2 className="text-2xl font-bold mb-4">Featured 𝕏 Creators Streaming Schedule</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-xl font-semibold mb-3">Blue Eye Queen</h3>
                <ul className="space-y-2">
                  <li className="flex justify-between">
                    <span>Monday</span>
                    <span>7 pm</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Tuesday</span>
                    <span>9 am</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Wednesday</span>
                    <span>8 pm</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Thursday</span>
                    <span>6 pm</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Friday</span>
                    <span>10 am</span>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-3">Red GoatQueen</h3>
                <ul className="space-y-2">
                  <li className="flex justify-between">
                    <span>Wednesday</span>
                    <span>7 pm</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Sunday</span>
                    <span>7 pm</span>
                  </li>
                </ul>
                <h3 className="text-xl font-semibold mt-4 mb-3">OVI LIVE</h3>
                <ul className="space-y-2">
                  <li className="flex justify-between">
                    <span>Friday</span>
                    <span>11 am</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Sunday</span>
                    <span>11 am</span>
                  </li>
                </ul>
                <h3 className="text-xl font-semibold mt-4 mb-3">Tater_Poutine.eth</h3>
                <ul className="space-y-2">
                  <li className="flex justify-between">
                    <span>Thursday</span>
                    <span>9 pm</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-auto">
        <Footer />
      </div>
    </div>
  );
}
