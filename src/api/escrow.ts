// Mock API functions for escrow management
export const escrowAPI = {
  create: async (buyerId: string, sellerId: string, listingId: string, amount: number) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const escrow = {
      id: `escrow-${Date.now()}`,
      buyerId,
      sellerId,
      listingId,
      amount,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    
    // Store in localStorage for demo
    const escrows = JSON.parse(localStorage.getItem('escrows') || '[]');
    escrows.push(escrow);
    localStorage.setItem('escrows', JSON.stringify(escrows));
    
    return {
      success: true,
      escrow
    };
  },

  getByUser: async (userId: string) => {
    const escrows = JSON.parse(localStorage.getItem('escrows') || '[]');
    return escrows.filter((escrow: any) => 
      escrow.buyerId === userId || escrow.sellerId === userId
    );
  },

  updateStatus: async (escrowId: string, status: 'held' | 'released' | 'refunded') => {
    const escrows = JSON.parse(localStorage.getItem('escrows') || '[]');
    const escrowIndex = escrows.findIndex((e: any) => e.id === escrowId);
    
    if (escrowIndex !== -1) {
      escrows[escrowIndex].status = status;
      escrows[escrowIndex].updatedAt = new Date().toISOString();
      localStorage.setItem('escrows', JSON.stringify(escrows));
      
      return {
        success: true,
        escrow: escrows[escrowIndex]
      };
    }
    
    return {
      success: false,
      error: 'Escrow not found'
    };
  }
};


