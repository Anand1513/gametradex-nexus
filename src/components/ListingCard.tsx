import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Shield, TrendingUp, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";

interface ListingCardProps {
  id: string;
  tier: string;
  kd: number;
  level: number;
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
  level, 
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
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">K/D Ratio</p>
            <p className="text-lg font-bold text-primary">{kd}</p>
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
      </CardContent>
      
      <CardFooter className="pt-0">
        <Link to={`/listing/${id}`} className="w-full">
          <Button variant="outline" className="w-full hover:bg-primary hover:text-primary-foreground">
            View Details
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

export default ListingCard;
