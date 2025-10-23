import { 
  usersService, 
  listingsService, 
  escrowsService, 
  bidsService, 
  supportService 
} from '@/services/firestore';
import { USE_DUMMY_AUTH } from '@/lib/firebase';

export const seedDatabase = async () => {
  try {
    // Create dummy users
    const adminUser = await usersService.create({
      uid: 'admin-123',
      name: 'Admin User',
      email: 'admin@gametradex.com',
      role: 'admin',
      createdAt: new Date()
    });

    const sellerUser = await usersService.create({
      uid: 'seller-123',
      name: 'John Seller',
      email: 'seller@gametradex.com',
      role: 'seller',
      createdAt: new Date()
    });

    const buyerUser = await usersService.create({
      uid: 'buyer-123',
      name: 'Jane Buyer',
      email: 'buyer@gametradex.com',
      role: 'buyer',
      createdAt: new Date()
    });

    // Create dummy listings
    const listing1 = await listingsService.create({
      title: 'Conqueror Account - 4.2 KD',
      tier: 'conqueror',
      kd: 4.2,
      level: 75,
      priceMin: 25000,
      priceMax: 35000,
      sellerId: 'seller-123',
      verified: true,
      status: 'open',
      description: 'High-tier Conqueror account with excellent stats and rare skins',
      game: 'BGMI'
    });

    const listing2 = await listingsService.create({
      title: 'Ace Master Account - 3.8 KD',
      tier: 'ace-master',
      kd: 3.8,
      level: 68,
      priceMin: 15000,
      priceMax: 22000,
      sellerId: 'seller-123',
      verified: false,
      status: 'bidding',
      description: 'Solid Ace Master account with good win rate',
      game: 'BGMI'
    });

    // Create dummy escrow
    const escrow = await escrowsService.create({
      buyerId: 'buyer-123',
      sellerId: 'seller-123',
      listingId: listing1.id,
      amount: 30000,
      paymentMethod: 'upi',
      status: 'pending'
    });

    // Create dummy bids
    await bidsService.create({
      listingId: listing2.id,
      bidderId: 'buyer-123',
      bidAmount: 18000,
      status: 'active'
    });

    await bidsService.create({
      listingId: listing2.id,
      bidderId: 'admin-123',
      bidAmount: 20000,
      status: 'active'
    });

    // Create dummy support message
    await supportService.create({
      name: 'Test User',
      email: 'test@example.com',
      message: 'I have a question about account verification process',
      status: 'pending'
    });

    console.log('Database seeded successfully!');
    return true;
  } catch (error) {
    console.error('Error seeding database:', error);
    return false;
  }
};

// Auto-seed on first load if no data exists
export const autoSeed = async () => {
  // Skip seeding in dummy auth mode
  if (USE_DUMMY_AUTH) {
    console.log('Dummy auth mode enabled, skipping database seed');
    return;
  }
  
  try {
    const users = await usersService.getAll();
    if (users.length > 0) {
      console.log('Database already has data, skipping seed');
      return;
    }
    
    console.log('Auto-seeding database with initial data...');
    await seedDatabase();
  } catch (error) {
    console.error('Error in auto-seed:', error);
  }
};
