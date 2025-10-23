import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ListingCard from "@/components/ListingCard";
import VerifiedTag from "@/components/VerifiedTag";
import LegalDisclaimer from "@/components/LegalDisclaimer";
import BuyNowModal from "@/components/BuyNowModal";
import { Search, ShoppingCart } from "lucide-react";
import { mockListings } from "@/data/mockData";
import { useNavigate } from "react-router-dom";

const Browse = () => {
  const [priceRange, setPriceRange] = useState<string>("all");
  const [tier, setTier] = useState<string>("all");
  const [platform, setPlatform] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("recent");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedListing, setSelectedListing] = useState<any>(null);
  const [isBuyModalOpen, setIsBuyModalOpen] = useState(false);
  const navigate = useNavigate();

  const [filteredListings, setFilteredListings] = useState(mockListings);

  useEffect(() => {
    let filtered = mockListings.filter(listing => {
      const matchesTier = tier === "all" || listing.tier.toLowerCase() === tier.toLowerCase();
      const matchesPlatform = platform === "all" || listing.game.toLowerCase() === platform.toLowerCase();
      const matchesSearch = searchQuery === "" || 
        listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        listing.tier.toLowerCase().includes(searchQuery.toLowerCase());
      
      let matchesPrice = true;
      if (priceRange !== "all") {
        const [min, max] = priceRange.split('-').map(Number);
        matchesPrice = listing.priceRange[0] >= min && listing.priceRange[1] <= max;
      }

      return matchesTier && matchesPlatform && matchesSearch && matchesPrice;
    });

    // Sort results
    if (sortBy === "price-low") {
      filtered.sort((a, b) => a.priceRange[0] - b.priceRange[0]);
    } else if (sortBy === "price-high") {
      filtered.sort((a, b) => b.priceRange[1] - a.priceRange[1]);
    } else if (sortBy === "kd-high") {
      filtered.sort((a, b) => b.kd - a.kd);
    } else if (sortBy === "level-high") {
      filtered.sort((a, b) => b.level - a.level);
    }

    setFilteredListings(filtered);
  }, [tier, platform, priceRange, searchQuery, sortBy]);

  const handleBuyNow = (listing: any) => {
    setSelectedListing(listing);
    setIsBuyModalOpen(true);
  };

  const handleBuySubmit = (buyData: { amount: number; paymentMethod: string }) => {
    console.log('Buy now:', buyData);
    // Here you would typically create an escrow record
  };

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Browse Verified Accounts</h1>
          <p className="text-muted-foreground">Find your perfect Battle Royale account from verified sellers</p>
        </div>

        {/* Filters Section */}
        <div className="bg-card border border-border rounded-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <Label htmlFor="search" className="mb-2 block">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  id="search"
                  placeholder="Search by level, tier..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="tier" className="mb-2 block">Tier</Label>
              <Select value={tier} onValueChange={setTier}>
                <SelectTrigger id="tier">
                  <SelectValue placeholder="All Tiers" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tiers</SelectItem>
                  <SelectItem value="conqueror">Conqueror</SelectItem>
                  <SelectItem value="ace-dominator">Ace Dominator</SelectItem>
                  <SelectItem value="ace-master">Ace Master</SelectItem>
                  <SelectItem value="ace">Ace</SelectItem>
                  <SelectItem value="crown">Crown</SelectItem>
                  <SelectItem value="diamond">Diamond</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="platform" className="mb-2 block">Platform</Label>
              <Select value={platform} onValueChange={setPlatform}>
                <SelectTrigger id="platform">
                  <SelectValue placeholder="All Platforms" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Platforms</SelectItem>
                  <SelectItem value="bgmi">BGMI</SelectItem>
                  <SelectItem value="pubg">PUBG</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="price" className="mb-2 block">Price Range</Label>
              <Select value={priceRange} onValueChange={setPriceRange}>
                <SelectTrigger id="price">
                  <SelectValue placeholder="All Prices" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Prices</SelectItem>
                  <SelectItem value="0-10000">₹0 - ₹10,000</SelectItem>
                  <SelectItem value="10000-20000">₹10,000 - ₹20,000</SelectItem>
                  <SelectItem value="20000-30000">₹20,000 - ₹30,000</SelectItem>
                  <SelectItem value="30000+">₹30,000+</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="sort" className="mb-2 block">Sort By</Label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger id="sort">
                  <SelectValue placeholder="Most Recent" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Most Recent</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="kd-high">K/D: High to Low</SelectItem>
                  <SelectItem value="level-high">Level: High to Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mt-4 flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                setTier("all");
                setPlatform("all");
                setPriceRange("all");
                setSearchQuery("");
                setSortBy("recent");
              }}
            >
              Clear Filters
            </Button>
          </div>
        </div>

        {/* Listings Grid */}
        <div className="mb-4">
          <p className="text-muted-foreground">
            Showing <span className="text-foreground font-semibold">{filteredListings.length}</span> verified accounts
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredListings.map((listing) => (
            <div key={listing.id} className="card-glow p-6 rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">{listing.title}</h3>
                <div className="flex space-x-2">
                  {listing.verified && <VerifiedTag type="verified" />}
                  {listing.bidding && <VerifiedTag type="bidding" />}
                </div>
              </div>
              <div className="space-y-2 text-sm text-muted-foreground mb-4">
                <p>{listing.game} • {listing.tier} • KD: {listing.kd}</p>
                <p>Level: {listing.level}</p>
                <p className="font-semibold text-primary">
                  ₹{listing.priceRange[0].toLocaleString()} – ₹{listing.priceRange[1].toLocaleString()}
                </p>
              </div>
              <div className="space-y-2">
                <Button 
                  className="w-full btn-primary"
                  onClick={() => navigate(`/listing/${listing.id}`)}
                >
                  View Details
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => handleBuyNow(listing)}
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Buy Now
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Legal Disclaimer */}
        <div className="mt-12">
          <LegalDisclaimer />
        </div>

        {/* Load More */}
        <div className="text-center mt-12">
          <Button variant="outline" size="lg">Load More Listings</Button>
        </div>

        {/* Buy Now Modal */}
        {selectedListing && (
          <BuyNowModal
            isOpen={isBuyModalOpen}
            onClose={() => setIsBuyModalOpen(false)}
            onSubmit={handleBuySubmit}
            listing={selectedListing}
          />
        )}
      </div>
    </div>
  );
};

export default Browse;
