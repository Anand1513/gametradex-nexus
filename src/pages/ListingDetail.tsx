import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Shield, ArrowLeft, TrendingUp, AlertCircle, ShoppingCart, Clock, Play, Image, Video } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import BidCard from "@/components/BidCard";
import BidModal from "@/components/BidModal";
import BuyNowModal from "@/components/BuyNowModal";
import ContactSellerModal from "@/components/ContactSellerModal";
import LegalDisclaimer from "@/components/LegalDisclaimer";
import { mockListings } from "@/data/mockData";
import toast from "react-hot-toast";

const ListingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isBidModalOpen, setIsBidModalOpen] = useState(false);
  const [isBuyModalOpen, setIsBuyModalOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [loadedVideos, setLoadedVideos] = useState<Set<number>>(new Set());

  const listing = mockListings.find((l) => l.id === id);

  const handlePlaceBid = () => {
    toast.error('Please log in to place bids');
    return;
  };

  const handleBuyNow = () => {
    setIsContactModalOpen(true);
  };

  const handleBidSubmit = (bidData: { amount: number; message: string }) => {
    console.log('Bid submitted:', bidData);
    // Here you would typically send the bid to your backend
  };

  const handleBuySubmit = (buyData: { amount: number; paymentMethod: string }) => {
    console.log('Buy now:', buyData);
    // Here you would typically create an escrow record
  };

  const handleVideoLoad = (index: number) => {
    setLoadedVideos(prev => new Set([...prev, index]));
  };

  const generateVideoThumbnail = (videoUrl: string) => {
    // In a real app, you'd generate thumbnails from the video
    // For now, we'll use a placeholder
    return '/placeholder.svg';
  };

  if (!listing) {
    return (
      <div className="min-h-screen py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center py-20">
            <h1 className="text-4xl font-bold mb-4">Listing Not Found</h1>
            <p className="text-muted-foreground mb-8">
              The listing you're looking for doesn't exist or has been removed.
            </p>
            <Button onClick={() => navigate("/browse")} variant="default">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Browse
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        {/* Breadcrumb */}
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/">Home</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/browse">Browse</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{listing.tier} Account</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate("/browse")}
          className="mb-6 hover:bg-primary/10"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Browse
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title & Price */}
            <div>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-4xl font-bold mb-2">{listing.tier} Account</h1>
                  <div className="flex items-center gap-3">
                    {listing.verified && (
                      <Badge className="bg-primary/90 text-primary-foreground">
                        <Shield className="w-3 h-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                    {listing.status === 'bidding' && (
                      <Badge className="bg-accent/90 text-accent-foreground">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        Bidding Active
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  {listing.pendingPrice ? (
                    <div className="flex flex-col items-end">
                      <Badge variant="outline" className="mb-1 border-amber-500 text-amber-500">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        Pending Admin Review
                      </Badge>
                      <p className="text-sm text-muted-foreground">Price will be set by admin</p>
                    </div>
                  ) : listing.isFixed ? (
                    <>
                      <p className="text-sm text-muted-foreground">Fixed Price</p>
                      <p className="text-3xl font-bold text-accent">
                        ₹{listing.priceFixed?.toLocaleString() || listing.priceRange[0].toLocaleString()}
                      </p>
                      {listing.negotiable && <p className="text-xs text-muted-foreground">negotiable</p>}
                    </>
                  ) : (
                    <>
                      <p className="text-sm text-muted-foreground">Price Range</p>
                      <p className="text-3xl font-bold text-accent">
                        ₹{listing.priceRange[0].toLocaleString()} – ₹{listing.priceRange[1].toLocaleString()}
                      </p>
                      {listing.negotiable && <p className="text-xs text-muted-foreground">negotiable</p>}
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Media Gallery */}
            <Card className="bg-card border-border">
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">Media Gallery</h2>
                
                {/* Images Section */}
                {listing.images && listing.images.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-medium mb-3 flex items-center">
                      <Image className="w-5 h-5 mr-2" />
                      Screenshots ({listing.images.length})
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {listing.images.map((image, index) => (
                        <div
                          key={`image-${index}`}
                          className="relative aspect-video overflow-hidden rounded-lg border border-border hover:border-primary/50 transition-all group"
                        >
                          <img
                            src={image}
                            alt={`Screenshot ${index + 1}`}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            loading="lazy"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Videos Section */}
                {listing.videos && listing.videos.length > 0 ? (
                  <div>
                    <h3 className="text-lg font-medium mb-3 flex items-center">
                      <Video className="w-5 h-5 mr-2" />
                      Gameplay Videos ({listing.videos.length})
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {listing.videos.map((video, index) => (
                        <div
                          key={`video-${index}`}
                          className="relative aspect-video overflow-hidden rounded-lg border border-border hover:border-primary/50 transition-all group"
                        >
                          {loadedVideos.has(index) ? (
                            <video
                              src={video}
                              controls
                              className="w-full h-full object-cover"
                              preload="metadata"
                            />
                          ) : (
                            <div
                              className="w-full h-full bg-muted flex items-center justify-center cursor-pointer hover:bg-muted/80 transition-colors"
                              onClick={() => handleVideoLoad(index)}
                            >
                              <div className="text-center">
                                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-3">
                                  <Play className="w-8 h-8 text-primary" />
                                </div>
                                <p className="text-sm text-muted-foreground">Click to load video</p>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Video className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No gameplay videos available</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Stats */}
            <Card className="bg-card border-border">
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">Account Stats</h2>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-background rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Level</p>
                    <p className="text-2xl font-bold text-primary">{listing.level}</p>
                  </div>
                  <div className="text-center p-4 bg-background rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Collection Level</p>
                    <p className="text-2xl font-bold text-primary">{listing.collectionLevel || listing.kd}</p>
                  </div>
                  <div className="text-center p-4 bg-background rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Tier</p>
                    <p className="text-2xl font-bold text-primary">{listing.tier}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Description */}
            <Card className="bg-card border-border">
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">Description</h2>
                <p className="text-muted-foreground leading-relaxed">{listing.description}</p>
              </CardContent>
            </Card>

            {/* Bidding Section */}
            {listing.status === 'bidding' && (
              <Card className="bg-card border-border">
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold mb-4">Bidding Information</h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="text-center p-3 bg-background rounded-lg">
                      <p className="text-sm text-muted-foreground">Current Bid</p>
                      <p className="text-lg font-bold text-primary">₹{listing.priceRange[0].toLocaleString()}</p>
                    </div>
                    <div className="text-center p-3 bg-background rounded-lg">
                      <p className="text-sm text-muted-foreground">Base Range</p>
                      <p className="text-sm font-semibold">₹{listing.priceRange[0].toLocaleString()} – ₹{listing.priceRange[1].toLocaleString()}</p>
                    </div>
                    <div className="text-center p-3 bg-background rounded-lg">
                      <p className="text-sm text-muted-foreground">Status</p>
                      <p className="text-sm font-semibold text-accent">Open</p>
                    </div>
                    <div className="text-center p-3 bg-background rounded-lg">
                      <p className="text-sm text-muted-foreground">Expires</p>
                      <p className="text-sm font-semibold flex items-center justify-center">
                        <Clock className="w-3 h-3 mr-1" />
                        N/A
                      </p>
                    </div>
                  </div>
                  <Button 
                    onClick={handlePlaceBid}
                    className="w-full btn-primary"
                  >
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Place Bid
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Escrow Info */}
            <Alert className="bg-primary/10 border-primary/20">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                All transactions are handled securely through our escrow service. Your payment is protected 
                until account verification is complete. GameTradeX provides mediation services only.
              </AlertDescription>
            </Alert>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Seller Info */}
            <Card className="bg-card border-border">
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">Account Information</h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Game:</span>
                    <span className="font-semibold">{listing.game}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tier:</span>
                    <span className="font-semibold">{listing.tier}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Collection Level:</span>
                    <span className="font-semibold">{listing.collectionLevel || listing.kd}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Level:</span>
                    <span className="font-semibold">{listing.level}</span>
                  </div>
                  {listing.characterId && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Character ID:</span>
                      <span className="font-semibold font-mono text-sm">{listing.characterId}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <Card className="bg-card border-border">
              <CardContent className="p-6 space-y-3">
                <Button 
                  onClick={handleBuyNow}
                  className="w-full btn-primary"
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Buy Now
                </Button>
                {listing.status === 'bidding' && (
                  <Button 
                    onClick={handlePlaceBid}
                    className="w-full btn-secondary"
                  >
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Place a Bid
                  </Button>
                )}
                <Link to="/inquiry" className="block">
                  <Button variant="outline" className="w-full hover:bg-primary/10">
                    Custom Request
                  </Button>
                </Link>
                <Link to="/contact" className="block">
                  <Button variant="outline" className="w-full hover:bg-primary/10">
                    Contact Support
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Legal Disclaimer */}
            <LegalDisclaimer />
          </div>
        </div>

        {/* Bid Modal */}
        <BidModal
          isOpen={isBidModalOpen}
          onClose={() => setIsBidModalOpen(false)}
          onSubmit={handleBidSubmit}
          accountTitle={listing.title}
          currentBid={listing.currentBid}
        />

        {/* Buy Now Modal */}
        <BuyNowModal
          isOpen={isBuyModalOpen}
          onClose={() => setIsBuyModalOpen(false)}
          onSubmit={handleBuySubmit}
          listing={listing}
        />

        {/* Contact Seller Modal */}
        <ContactSellerModal
          isOpen={isContactModalOpen}
          onClose={() => setIsContactModalOpen(false)}
          listing={listing}
        />
      </div>
    </div>
  );
};

export default ListingDetail;
