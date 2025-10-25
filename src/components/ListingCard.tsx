import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Shield, TrendingUp, AlertCircle, Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import toast from "react-hot-toast";

interface ListingCardProps {
  id: string;
  tier: string;
  kd?: number; // Legacy field
  collectionLevel?: number;
  level: number;
  characterId?: string;
  priceRange?: [number, number];
  priceFixed?: number;
  isFixed?: boolean;
  negotiable?: boolean;
  pendingPrice?: boolean;
  verified: boolean;
  bidding?: boolean;
  image: string;
  status?: string;
}

const ListingCard = ({ 
  id, 
  tier, 
  kd, 
  collectionLevel,
  level, 
  characterId,
  priceRange, 
  priceFixed,
  isFixed,
  negotiable,
  pendingPrice,
  verified, 
  bidding, 
  image,
  status
}: ListingCardProps) => {
  const [isInterested, setIsInterested] = useState(false);
  const [interestCount, setInterestCount] = useState(0);
  const { user, userData } = useAuth();

  // Fetch interest count for this listing
  useEffect(() => {
    const fetchInterestCount = async () => {
      try {
        const response = await fetch(`/api/interests/listing/${id}`);
        if (response.ok) {
          const interests = await response.json();
          setInterestCount(interests.length);
          
          // Check if current user has already shown interest
          if (userData) {
            const userInterest = interests.find((interest: any) => interest.userId === userData.uid);
            if (userInterest) {
              setIsInterested(true);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching interest count:', error);
      }
    };
    
    fetchInterestCount();
  }, [id, userData]);

  const handleInterested = async () => {
    try {
      // Check if user is logged in
      if (!user || !userData) {
        toast.error('Please login to show interest');
        return;
      }

      // Send interest to admin
      const response = await fetch('/api/interests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          listingId: id,
          userId: userData.uid,
          userEmail: userData.email,
          userName: userData.name || userData.email,
          userPhone: userData.phone || 'Not provided',
          listingTitle: `${tier} Account`,
          listingPrice: isFixed ? `₹${priceFixed?.toLocaleString()}` : `₹${priceRange?.[0].toLocaleString()} - ₹${priceRange?.[1].toLocaleString()}`,
          timestamp: new Date().toISOString()
        })
      });

      if (response.ok) {
        setIsInterested(true);
        setInterestCount(prev => prev + 1);
        toast.success('Interest recorded! We\'ll contact you soon.');
      } else {
        toast.error('Failed to record interest. Please try again.');
      }
    } catch (error) {
      console.error('Error recording interest:', error);
      toast.error('Failed to record interest. Please try again.');
    }
  };
  return (
    <Card className="bg-card border-border hover:border-primary/50 transition-all duration-300 hover:shadow-glow overflow-hidden group">
      <div className="relative h-48 overflow-hidden">
        <img
          src={image}
          alt={`${tier} Battle Royale account`}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
        {verified && (
          <Badge className="absolute top-3 right-3 bg-primary/90 text-primary-foreground">
            <Shield className="w-3 h-3 mr-1" />
            Verified
          </Badge>
        )}
        {bidding && (
          <Badge className="absolute top-3 left-3 bg-accent/90 text-accent-foreground">
            <TrendingUp className="w-3 h-3 mr-1" />
            Bidding
          </Badge>
        )}
      </div>
      
      <CardContent className="pt-4">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="font-semibold text-lg">{tier} Account</h3>
            <p className="text-sm text-muted-foreground">Level {level}</p>
            {characterId && (
              <p className="text-xs text-muted-foreground font-mono">ID: {characterId}</p>
            )}
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Collection Level</p>
            <p className="text-lg font-bold text-primary">{collectionLevel || kd || 'N/A'}</p>
          </div>
        </div>
        
        <div className="flex items-baseline gap-2 mb-4">
          {pendingPrice ? (
            <div className="flex items-center text-amber-500">
              <AlertCircle className="w-4 h-4 mr-1" />
              <span>Pending Price</span>
            </div>
          ) : isFixed ? (
            <>
              <span className="text-2xl font-bold text-accent">₹{priceFixed?.toLocaleString()}</span>
              {negotiable && <span className="text-xs text-muted-foreground">negotiable</span>}
            </>
          ) : (
            <>
              <span className="text-2xl font-bold text-accent">₹{priceRange?.[0].toLocaleString()} - ₹{priceRange?.[1].toLocaleString()}</span>
              {negotiable && <span className="text-xs text-muted-foreground">negotiable</span>}
            </>
          )}
        </div>
        
        {/* Interest Count Display */}
        {interestCount > 0 && (
          <div className="flex items-center justify-center mb-3">
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Heart className="w-4 h-4" />
              <span>{interestCount} {interestCount === 1 ? 'person' : 'people'} interested</span>
            </div>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="pt-0 flex gap-2">
        <Link to={`/listing/${id}`} className="flex-1">
          <Button variant="outline" className="w-full hover:bg-primary hover:text-primary-foreground">
            View Details
          </Button>
        </Link>
        <Button 
          onClick={handleInterested}
          disabled={isInterested}
          variant={isInterested ? "default" : "outline"}
          className={`px-3 ${isInterested ? "bg-green-500 hover:bg-green-600" : "hover:bg-primary hover:text-primary-foreground"}`}
        >
          <Heart className={`w-4 h-4 ${isInterested ? "fill-current" : ""}`} />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ListingCard;
