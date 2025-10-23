import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  onSnapshot,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Types
export interface UserData {
  uid: string;
  name: string;
  email: string;
  role: 'admin' | 'seller' | 'buyer';
  createdAt: Date;
}

export interface Listing {
  id?: string;
  title: string;
  tier: string;
  kd: number;
  level: number;
  priceMin: number;
  priceMax: number;
  sellerId: string;
  verified: boolean;
  status: 'open' | 'bidding' | 'sold';
  createdAt: Date;
  description?: string;
  images?: string[];
  game?: string;
}

export interface Escrow {
  id?: string;
  buyerId: string;
  sellerId: string;
  listingId: string;
  amount: number;
  paymentMethod: string;
  status: 'pending' | 'released' | 'refunded';
  createdAt: Date;
  releasedAt?: Date;
}

export interface Bid {
  id?: string;
  listingId: string;
  bidderId: string;
  bidAmount: number;
  timestamp: Date;
  status?: 'active' | 'won' | 'lost';
}

export interface SupportMessage {
  id?: string;
  name: string;
  email: string;
  message: string;
  createdAt: Date;
  status: 'pending' | 'resolved';
}

export interface CustomRequest {
  id?: string;
  requesterId: string;
  game: string;
  tier: string;
  priceMin: number;
  priceMax: number;
  notes: string;
  createdAt: Date;
  status: 'pending' | 'fulfilled' | 'rejected';
}

// Users Collection
export const usersService = {
  create: async (userData: UserData) => {
    return await addDoc(collection(db, 'users'), userData);
  },

  getById: async (uid: string) => {
    const docRef = doc(db, 'users', uid);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
  },

  getAll: async () => {
    const querySnapshot = await getDocs(collection(db, 'users'));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  updateRole: async (uid: string, role: 'admin' | 'seller' | 'buyer') => {
    const docRef = doc(db, 'users', uid);
    return await updateDoc(docRef, { role });
  }
};

// Listings Collection
export const listingsService = {
  create: async (listing: Omit<Listing, 'id' | 'createdAt'>) => {
    return await addDoc(collection(db, 'listings'), {
      ...listing,
      createdAt: serverTimestamp()
    });
  },

  getAll: async () => {
    const querySnapshot = await getDocs(collection(db, 'listings'));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  getById: async (id: string) => {
    const docRef = doc(db, 'listings', id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
  },

  getBySeller: async (sellerId: string) => {
    const q = query(collection(db, 'listings'), where('sellerId', '==', sellerId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  update: async (id: string, updates: Partial<Listing>) => {
    const docRef = doc(db, 'listings', id);
    return await updateDoc(docRef, updates);
  },

  delete: async (id: string) => {
    const docRef = doc(db, 'listings', id);
    return await deleteDoc(docRef);
  },

  // Real-time listener
  subscribe: (callback: (listings: any[]) => void) => {
    return onSnapshot(collection(db, 'listings'), (querySnapshot) => {
      const listings = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      callback(listings);
    });
  }
};

// Escrows Collection
export const escrowsService = {
  create: async (escrow: Omit<Escrow, 'id' | 'createdAt'>) => {
    return await addDoc(collection(db, 'escrows'), {
      ...escrow,
      createdAt: serverTimestamp()
    });
  },

  getAll: async () => {
    const querySnapshot = await getDocs(collection(db, 'escrows'));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  getByUser: async (userId: string) => {
    const q = query(
      collection(db, 'escrows'),
      where('buyerId', '==', userId)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  updateStatus: async (id: string, status: 'pending' | 'released' | 'refunded') => {
    const docRef = doc(db, 'escrows', id);
    const updates: any = { status };
    if (status === 'released' || status === 'refunded') {
      updates.releasedAt = serverTimestamp();
    }
    return await updateDoc(docRef, updates);
  },

  // Real-time listener
  subscribe: (callback: (escrows: any[]) => void) => {
    return onSnapshot(collection(db, 'escrows'), (querySnapshot) => {
      const escrows = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      callback(escrows);
    });
  }
};

// Bids Collection
export const bidsService = {
  create: async (bid: Omit<Bid, 'id' | 'timestamp'>) => {
    return await addDoc(collection(db, 'bids'), {
      ...bid,
      timestamp: serverTimestamp()
    });
  },

  getByListing: async (listingId: string) => {
    const q = query(
      collection(db, 'bids'),
      where('listingId', '==', listingId),
      orderBy('bidAmount', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  getByUser: async (userId: string) => {
    const q = query(
      collection(db, 'bids'),
      where('bidderId', '==', userId),
      orderBy('timestamp', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  updateStatus: async (id: string, status: 'active' | 'won' | 'lost') => {
    const docRef = doc(db, 'bids', id);
    return await updateDoc(docRef, { status });
  },

  // Real-time listener
  subscribe: (listingId: string, callback: (bids: any[]) => void) => {
    const q = query(
      collection(db, 'bids'),
      where('listingId', '==', listingId),
      orderBy('bidAmount', 'desc')
    );
    return onSnapshot(q, (querySnapshot) => {
      const bids = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      callback(bids);
    });
  }
};

// Support Messages Collection
export const supportService = {
  create: async (message: Omit<SupportMessage, 'id' | 'createdAt'>) => {
    return await addDoc(collection(db, 'supportMessages'), {
      ...message,
      createdAt: serverTimestamp()
    });
  },

  getAll: async () => {
    const q = query(collection(db, 'supportMessages'), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }
};

// Custom Requests Collection
export const requestsService = {
  create: async (request: Omit<CustomRequest, 'id' | 'createdAt'>) => {
    return await addDoc(collection(db, 'customRequests'), {
      ...request,
      createdAt: serverTimestamp()
    });
  },

  getAll: async () => {
    const q = query(collection(db, 'customRequests'), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }
};
