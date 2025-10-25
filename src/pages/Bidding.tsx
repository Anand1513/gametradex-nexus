import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, TrendingUp, Clock, User, CheckCircle } from 'lucide-react';
import BidModal from '@/components/BidModal';
import LegalDisclaimer from '@/components/LegalDisclaimer';
import { useAuth } from '@/contexts/AuthContext';
import { bidsService, listingsService } from '@/services/firestore';
import toast from 'react-hot-toast';

const Bidding: React.FC = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [gameFilter, setGameFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedListing, setSelectedListing] = useState<any>(null);
  const [isBidModalOpen, setIsBidModalOpen] = useState(false);
  const [listings, setListings] = useState<any[]>([]);
  const [bids, setBids] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Load data from Firestore
  useEffect(() => {
    const loadData = async () => {
      try {
        const [listingsData, bidsData] = await Promise.all([
          listingsService.getAll(),
          user ? bidsService.getByUser(user.uid) : Promise.resolve([])
        ]);
        setListings(listingsData);
        setBids(bidsData);
      } catch (error) {
        toast.error('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  const filteredListings = listings.filter(listing => {
    const matchesSearch = listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         listing.tier.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGame = gameFilter === 'all' || listing.game === gameFilter;
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'verified' && listing.verified) ||
                         (statusFilter === 'bidding' && listing.status === 'bidding');
    return matchesSearch && matchesGame && matchesStatus;
  });

  const handlePlaceBid = (listing: any) => {
    if (!user) {
      toast.error('Please log in to place a bid');
      return;
    }
    setSelectedListing(listing);
    setIsBidModalOpen(true);
  };

  const handleBidSubmit = async (bidData: { amount: number; message: string }) => {
    if (!user || !selectedListing) return;

    try {
      await bidsService.create({
        listingId: selectedListing.id,
        bidderId: user.uid,
        bidAmount: bidData.amount,
        status: 'active'
      });
      
      toast.success('Bid placed successfully!');
      setIsBidModalOpen(false);
      
      // Reload bids
      const updatedBids = await bidsService.getByUser(user.uid);
      setBids(updatedBids);
    } catch (error) {
      toast.error('Failed to place bid');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'highest':
        return 'bg-primary text-primary-foreground';
      case 'outbid':
        return 'bg-destructive/20 text-destructive';
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-500';
      case 'accepted':
        return 'bg-green-500/20 text-green-500';
      case 'closed':
        return 'bg-muted text-muted-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary mb-4">
            Active Bids & Offers
          </h1>
          <p className="text-lg text-muted-foreground">
            Place or manage your bids on verified accounts
          </p>
        </div>

        {/* Search and Filters */}
        <Card className="card-glow mb-8">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search by game, tier, or account..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={gameFilter} onValueChange={setGameFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by Game" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Games</SelectItem>
                  <SelectItem value="BGMI">BGMI</SelectItem>
                  <SelectItem value="PUBG">PUBG</SelectItem>
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="verified">Verified Only</SelectItem>
                  <SelectItem value="bidding">Open Bids</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" className="flex items-center space-x-2">
                <Filter className="w-4 h-4" />
                <span>More Filters</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Active Bids Table */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="card-glow">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  <span>Active Bids</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredListings.map((listing) => (
                    <div key={listing.id} className="border border-border rounded-lg p-4 hover:shadow-glow-sm transition-all">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-lg">{listing.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {listing.game} • {listing.tier} • Collection Level: {listing.collectionLevel || listing.kd}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          {listing.verified && (
                            <Badge className="verified-badge">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Verified
                            </Badge>
                          )}
                          {listing.bidding && (
                            <Badge className="bidding-badge">
                              <TrendingUp className="w-3 h-3 mr-1" />
                              Bidding Open
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground">Current Bid</p>
                          <p className="text-lg font-bold text-primary">
                            ₹{listing.currentBid?.toLocaleString() || 'N/A'}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground">Base Range</p>
                          <p className="text-sm font-semibold">
                            ₹{listing.priceMin?.toLocaleString()} – ₹{listing.priceMax?.toLocaleString()}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground">Status</p>
                          <p className="text-sm font-semibold text-accent">
                            {listing.status === 'bidding' ? 'Open' : 'Closed'}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground">Expires</p>
                          <p className="text-sm font-semibold flex items-center justify-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {listing.expiresIn || 'N/A'}
                          </p>
                        </div>
                      </div>

                      {listing.status === 'bidding' && (
                        <Button 
                          onClick={() => handlePlaceBid(listing)}
                          className="w-full btn-primary"
                        >
                          Place New Bid
                        </Button>
                      )}
                    </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Bid History */}
            <Card className="card-glow">
              <CardHeader>
                <CardTitle>Recent Bid Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {bids.slice(0, 5).map((bid) => {
                    const listing = listings.find(l => l.id === bid.listingId);
                    return (
                      <div key={bid.id} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <User className="w-4 h-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{listing?.title || 'Unknown Listing'}</p>
                            <p className="text-sm text-muted-foreground">
                              {bid.timestamp?.toDate?.()?.toLocaleDateString() || 'N/A'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className="font-semibold">₹{bid.bidAmount?.toLocaleString()}</span>
                          <Badge className={`text-xs ${getStatusColor(bid.status || 'pending')}`}>
                            {bid.status || 'pending'}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                  {bids.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">No bids placed yet</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Summary */}
            <Card className="card-glow">
              <CardHeader>
                <CardTitle>Your Activity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center p-3 bg-muted/30 rounded-lg">
                  <p className="text-2xl font-bold text-primary">12</p>
                  <p className="text-sm text-muted-foreground">Total Active Bids</p>
                </div>
                <div className="text-center p-3 bg-muted/30 rounded-lg">
                  <p className="text-2xl font-bold text-accent">3</p>
                  <p className="text-sm text-muted-foreground">Your Pending Offers</p>
                </div>
                <div className="text-center p-3 bg-muted/30 rounded-lg">
                  <p className="text-2xl font-bold text-green-500">92%</p>
                  <p className="text-sm text-muted-foreground">Success Rate</p>
                </div>
              </CardContent>
            </Card>

            {/* Legal Notice */}
            <LegalDisclaimer />
          </div>
        </div>

        {/* Legal Notice at Bottom */}
        <div className="mt-8 p-6 bg-muted/20 rounded-lg border border-border">
          <h3 className="font-semibold text-lg mb-3 flex items-center">
            ⚖️ Important Notice
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Bidding is only for initiating negotiations between verified users. 
            Final payments occur only through escrow after mutual confirmation.
          </p>
        </div>
      </div>

      {/* Bid Modal */}
      <BidModal
        isOpen={isBidModalOpen}
        onClose={() => setIsBidModalOpen(false)}
        onSubmit={handleBidSubmit}
        accountTitle={selectedListing?.title || ''}
        currentBid={selectedListing?.currentBid}
      />
    </div>
  );
};

export default Bidding;


