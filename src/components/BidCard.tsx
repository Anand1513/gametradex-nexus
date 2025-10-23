import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, User, TrendingUp } from 'lucide-react';

interface Bid {
  user: string;
  amount: number;
  status: 'highest' | 'outbid' | 'pending' | 'accepted' | 'closed';
  timestamp: string;
}

interface BidCardProps {
  accountTitle: string;
  currentBid: number;
  baseRange: [number, number];
  expiresIn: string;
  bids: Bid[];
  onPlaceBid: () => void;
  className?: string;
}

const BidCard: React.FC<BidCardProps> = ({
  accountTitle,
  currentBid,
  baseRange,
  expiresIn,
  bids,
  onPlaceBid,
  className = ""
}) => {
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
    <Card className={`card-glow ${className}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold text-primary">
            🟢 Verified Account – Bidding Section
          </CardTitle>
          <Badge variant="outline" className="bidding-badge">
            <TrendingUp className="w-3 h-3 mr-1" />
            Active Bidding
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-3 bg-muted/30 rounded-lg">
            <p className="text-sm text-muted-foreground">Current Highest Bid</p>
            <p className="text-2xl font-bold text-primary">₹{currentBid.toLocaleString()}</p>
          </div>
          
          <div className="text-center p-3 bg-muted/30 rounded-lg">
            <p className="text-sm text-muted-foreground">Base Range</p>
            <p className="text-lg font-semibold">
              ₹{baseRange[0].toLocaleString()} – ₹{baseRange[1].toLocaleString()}
            </p>
          </div>
          
          <div className="text-center p-3 bg-muted/30 rounded-lg">
            <p className="text-sm text-muted-foreground">Bid Ends In</p>
            <p className="text-lg font-semibold text-accent flex items-center justify-center">
              <Clock className="w-4 h-4 mr-1" />
              {expiresIn}
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="font-semibold text-sm">Recent Bids</h4>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {bids.slice(0, 3).map((bid, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-muted/20 rounded">
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{bid.user}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-semibold">₹{bid.amount.toLocaleString()}</span>
                  <Badge className={`text-xs ${getStatusColor(bid.status)}`}>
                    {bid.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Button 
          onClick={onPlaceBid}
          className="w-full btn-primary"
        >
          Place a Bid
        </Button>
      </CardContent>
    </Card>
  );
};

export default BidCard;


