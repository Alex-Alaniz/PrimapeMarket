'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/navbar';
import CreatorCard from '@/components/earn/creator-card';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Footer } from '@/components/footer';

export default function EarnPage() {
  const [creators, setCreators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchCreators = async () => {
      try {
        setLoading(true);
        setError(null);

        // Try to use cached data if available and not expired
        const CACHE_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes
        const now = Date.now();
        const cachedCreatorsJson = localStorage.getItem('cachedCreators');
        const cacheTimeStr = localStorage.getItem('cacheTime');
        const cacheTime = cacheTimeStr ? parseInt(cacheTimeStr) : 0;

        // Check if we have valid cached data
        if (cachedCreatorsJson && cacheTime && (now - cacheTime < CACHE_EXPIRY_MS)) {
          console.log('Using cached creators data from localStorage');
          const cachedData = JSON.parse(cachedCreatorsJson);
          setCreators(cachedData);
          setLoading(false);
          return;
        }

        console.log('Cache expired or not available, fetching fresh data');

        // Fetch from the main creators API that uses the Twitter database connection
        // This uses the proper DB wrapper from twitter-prisma.ts
        const response = await fetch(`/api/creators?_t=${Date.now()}`);

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        console.log('Updating UI with fresh data from Twitter DB API');
        console.log('Fetched creators data:', data);

        if (Array.isArray(data) && data.length > 0) {
          setCreators(data);

          // Cache the data
          localStorage.setItem('cachedCreators', JSON.stringify(data));
          localStorage.setItem('cacheTime', now.toString());
        } else {
          console.warn('Twitter DB API returned empty creators array or invalid data');
          // Use fallback data if API returns empty array
          const fallbackCreators = [
            {
              id: 'PrimapeMarkets',
              handle: '@PrimapeMarkets',
              name: 'PRIMAPE',
              points: 690,
              category: 'News',
              engagementTypes: ['listen', 'share', 'comment'],
              avatar: '/images/pm.PNG',
              description: 'The premier prediction markets platform for the Ape ecosystem'
            },
            {
              id: 'AlexDotEth',
              handle: '@AlexDotEth',
              name: 'Alex | ApeChain Creator',
              points: 500,
              category: 'Spaces',
              engagementTypes: ['listen', 'share', 'comment'],
              avatar: '/images/pm.PNG',
              description: 'Web3 Builder and Community Expert'
            },
            {
              id: 'apecoin',
              handle: '@apecoin',
              name: 'ApeCoin',
              points: 250,
              category: 'News',
              engagementTypes: ['listen', 'share', 'comment'],
              avatar: '/images/pm.PNG',
              description: 'Official account for ApeCoin'
            }
          ];
          setCreators(fallbackCreators);

          // Cache the fallback data
          localStorage.setItem('cachedCreators', JSON.stringify(fallbackCreators));
          localStorage.setItem('cacheTime', now.toString());
        }
      } catch (err) {
        console.error('Error fetching creators:', err);
        setError(err.message || 'Failed to load creators');

        // Use fallback data if there's an error
        const fallbackCreators = [
          {
            id: 'PrimapeMarkets',
            handle: '@PrimapeMarkets',
            name: 'PRIMAPE',
            points: 690,
            category: 'News',
            engagementTypes: ['listen', 'share', 'comment'],
            avatar: '/images/pm.PNG',
            description: 'The premier prediction markets platform for the Ape ecosystem'
          },
          {
            id: 'AlexDotEth',
            handle: '@AlexDotEth',
            name: 'Alex | ApeChain Creator',
            points: 500,
            category: 'Spaces',
            engagementTypes: ['listen', 'share', 'comment'],
            avatar: '/images/pm.PNG',
            description: 'Web3 Builder and Community Expert'
          }
        ];
        setCreators(fallbackCreators);
      } finally {
        setLoading(false);
      }
    };

    fetchCreators();
  }, []);

  // Filter creators based on category
  const filteredCreators = filter === 'all' 
    ? creators 
    : creators.filter(creator => creator.category?.toLowerCase() === filter.toLowerCase());

  return (
    <>
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Earn with Creators</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Engage with your favorite creators to earn rewards and boost your status
          </p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Engage-to-Earn Platform</CardTitle>
            <CardDescription>
              Listen to Spaces, share content, and comment on posts to earn points and rewards
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2 mb-4">
              <Button 
                variant={filter === 'all' ? 'default' : 'outline'} 
                onClick={() => setFilter('all')}
                className="rounded-full"
              >
                All Creators
              </Button>
              <Button 
                variant={filter === 'spaces' ? 'default' : 'outline'} 
                onClick={() => setFilter('spaces')}
                className="rounded-full"
              >
                Spaces Hosts
              </Button>
              <Button 
                variant={filter === 'news' ? 'default' : 'outline'} 
                onClick={() => setFilter('news')}
                className="rounded-full"
              >
                News & Updates
              </Button>
            </div>

            <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
              {filteredCreators.length} creators available
            </div>
          </CardContent>
        </Card>

        {error && (
          <Card className="mb-8 border-red-500 bg-red-50 dark:bg-red-950/30">
            <CardHeader>
              <CardTitle className="text-red-700 dark:text-red-400">Error Loading Creators</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{error}</p>
              <p className="mt-2">Using fallback creator data instead.</p>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            // Show skeletons while loading
            Array(6).fill(0).map((_, i) => (
              <Card key={`skeleton-${i}`} className="overflow-hidden">
                <div className="p-4">
                  <div className="flex items-center gap-4 mb-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-[150px]" />
                      <Skeleton className="h-4 w-[100px]" />
                    </div>
                  </div>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-2/3" />

                  <div className="mt-6 space-y-3">
                    <Skeleton className="h-8 w-full rounded-md" />
                  </div>
                </div>
              </Card>
            ))
          ) : (
            filteredCreators.map(creator => (
              <CreatorCard key={creator.id} creator={creator} />
            ))
          )}
        </div>

        {!loading && filteredCreators.length === 0 && (
          <Card className="p-8 text-center">
            <h3 className="text-xl font-medium mb-2">No creators found</h3>
            <p className="text-gray-500 dark:text-gray-400">
              No creators matched your current filter. Try selecting a different category.
            </p>
          </Card>
        )}
      </main>
      <div className="mt-auto">
        <Footer />
      </div>
    </>
  );
}