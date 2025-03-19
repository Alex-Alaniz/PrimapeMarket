
import { NextResponse } from 'next/server';

// In a production environment, you'd fetch this from a database
const creators = [
  {
    id: '1',
    name: 'Coffee with Captain',
    handle: '@CoffeeWCaptain',
    avatar: '/images/creators/captain.jpg',
    description: 'Daily crypto discussions and ApeChain updates',
    category: 'Spaces',
    points: 500,
    engagementTypes: ['listen', 'question', 'promote']
  },
  {
    id: '2',
    name: 'Bodoggos Podcast',
    handle: '@BodoggosPod',
    avatar: '/images/creators/bodoggos.jpg',
    description: 'Web3 gaming and NFT discussions',
    category: 'Podcast',
    points: 450,
    engagementTypes: ['listen', 'comment', 'promote']
  },
  {
    id: '3',
    name: 'ApeChain Daily',
    handle: '@ApeChainDaily',
    avatar: '/images/creators/apechain.jpg',
    description: 'News and updates from the ApeChain ecosystem',
    category: 'News',
    points: 400,
    engagementTypes: ['read', 'share', 'comment']
  }
];

export async function GET() {
  return NextResponse.json(creators);
}
