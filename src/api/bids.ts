// Mock API functions for bidding system
export const bidsAPI = {
  create: async (userId: string, listingId: string, amount: number, message?: string) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const bid = {
      id: `bid-${Date.now()}`,
      userId,
      listingId,
      amount,
      message,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    
    // Store in localStorage for demo
    const bids = JSON.parse(localStorage.getItem('bids') || '[]');
    bids.push(bid);
    localStorage.setItem('bids', JSON.stringify(bids));
    
    return {
      success: true,
      bid
    };
  },

  getByUser: async (userId: string) => {
    const bids = JSON.parse(localStorage.getItem('bids') || '[]');
    return bids.filter((bid: any) => bid.userId === userId);
  },

  getByListing: async (listingId: string) => {
    const bids = JSON.parse(localStorage.getItem('bids') || '[]');
    return bids.filter((bid: any) => bid.listingId === listingId);
  },

  updateStatus: async (bidId: string, status: 'accepted' | 'rejected' | 'outbid') => {
    const bids = JSON.parse(localStorage.getItem('bids') || '[]');
    const bidIndex = bids.findIndex((b: any) => b.id === bidId);
    
    if (bidIndex !== -1) {
      bids[bidIndex].status = status;
      bids[bidIndex].updatedAt = new Date().toISOString();
      localStorage.setItem('bids', JSON.stringify(bids));
      
      return {
        success: true,
        bid: bids[bidIndex]
      };
    }
    
    return {
      success: false,
      error: 'Bid not found'
    };
  }
};


