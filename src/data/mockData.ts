export interface Listing {
  id: string;
  title: string;
  game: string;
  tier: string;
  kd: number;
  level: number;
  priceRange: [number, number];
  description: string;
  images: string[];
  verified: boolean;
  bidding: boolean;
  currentBid?: number;
  baseRange?: [number, number];
  expiresIn?: string;
  bids?: Bid[];
}

export interface Bid {
  id: string;
  user: string;
  amount: number;
  status: 'highest' | 'outbid' | 'pending' | 'accepted' | 'closed';
  timestamp: string;
  message?: string;
}

export const mockListings: Listing[] = [
  {
    id: '1',
    title: 'Conqueror Account - Season 12',
    game: 'BGMI',
    tier: 'Conqueror',
    kd: 4.2,
    level: 75,
    priceRange: [20000, 30000],
    description: 'High-tier Conqueror account with excellent stats. Multiple legendary skins and achievements.',
    images: ['/placeholder.svg', '/placeholder.svg'],
    verified: true,
    bidding: true,
    currentBid: 25000,
    baseRange: [20000, 30000],
    expiresIn: '48h',
    bids: [
      { id: '1', user: 'alex', amount: 24500, status: 'outbid', timestamp: '2h ago', message: 'Great account!' },
      { id: '2', user: 'sam', amount: 25000, status: 'highest', timestamp: '1h ago', message: 'Interested in this account' },
      { id: '3', user: 'john', amount: 23000, status: 'outbid', timestamp: '3h ago' }
    ]
  },
  {
    id: '2',
    title: 'Ace Dominator - Season 11',
    game: 'BGMI',
    tier: 'Ace',
    kd: 3.8,
    level: 68,
    priceRange: [15000, 22000],
    description: 'Ace tier account with good win rate and multiple rare skins.',
    images: ['/placeholder.svg'],
    verified: true,
    bidding: false
  },
  {
    id: '3',
    title: 'Crown Account - Season 13',
    game: 'BGMI',
    tier: 'Crown',
    kd: 2.9,
    level: 45,
    priceRange: [8000, 12000],
    description: 'Crown tier account with decent stats and some premium skins.',
    images: ['/placeholder.svg'],
    verified: false,
    bidding: true,
    currentBid: 9500,
    baseRange: [8000, 12000],
    expiresIn: '24h',
    bids: [
      { id: '4', user: 'mike', amount: 9500, status: 'highest', timestamp: '30m ago' },
      { id: '5', user: 'sarah', amount: 9000, status: 'outbid', timestamp: '1h ago' }
    ]
  },
  {
    id: '4',
    title: 'Diamond Account - Season 12',
    game: 'BGMI',
    tier: 'Diamond',
    kd: 2.1,
    level: 35,
    priceRange: [5000, 8000],
    description: 'Diamond tier account with basic skins and decent gameplay stats.',
    images: ['/placeholder.svg'],
    verified: true,
    bidding: false
  }
];

export const mockBids: Bid[] = [
  {
    id: '1',
    user: 'alex',
    amount: 24500,
    status: 'outbid',
    timestamp: '2h ago',
    message: 'Great account!'
  },
  {
    id: '2',
    user: 'sam',
    amount: 25000,
    status: 'highest',
    timestamp: '1h ago',
    message: 'Interested in this account'
  },
  {
    id: '3',
    user: 'john',
    amount: 23000,
    status: 'outbid',
    timestamp: '3h ago'
  },
  {
    id: '4',
    user: 'mike',
    amount: 9500,
    status: 'highest',
    timestamp: '30m ago'
  },
  {
    id: '5',
    user: 'sarah',
    amount: 9000,
    status: 'outbid',
    timestamp: '1h ago'
  }
];

export const serviceFees = {
  platformFee: 0.05, // 5%
  escrowFee: 0.02, // 2%
  verificationFee: 0.01 // 1%
};


