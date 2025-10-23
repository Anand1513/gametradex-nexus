import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Shield, CreditCard, AlertTriangle } from 'lucide-react';
import ConsentCheckbox from './ConsentCheckbox';
import { useAuth } from '@/contexts/AuthContext';
import { escrowsService } from '@/services/firestore';
import toast from 'react-hot-toast';

interface BuyNowModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (buyData: { amount: number; paymentMethod: string }) => void;
  listing: {
    id: string;
    title: string;
    priceRange: [number, number];
    currentBid?: number;
    sellerId: string;
  };
}

const BuyNowModal: React.FC<BuyNowModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  listing
}) => {
  const { user } = useAuth();
  const [amount, setAmount] = useState(listing.currentBid || listing.priceRange[1]);
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [consent1, setConsent1] = useState(false);
  const [consent2, setConsent2] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const escrowFee = 0.05; // 5%
  const platformFee = 0.05; // 5%
  const totalFees = (amount * (escrowFee + platformFee));
  const totalAmount = amount + totalFees;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Please log in to continue');
      return;
    }
    
    if (!consent1 || !consent2) {
      toast.error('Please agree to all terms before proceeding');
      return;
    }

    setIsLoading(true);

    try {
      // Create escrow in Firestore
      await escrowsService.create({
        buyerId: user.uid,
        sellerId: listing.sellerId,
        listingId: listing.id,
        amount: totalAmount,
        paymentMethod,
        status: 'pending'
      });
      
      if (onSubmit) {
        onSubmit({
          amount: totalAmount,
          paymentMethod
        });
      }
      
      toast.success('Escrow created successfully! Payment is now held securely.');
      onClose();
    } catch (error) {
      toast.error('Failed to create escrow. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center">
            <CreditCard className="w-5 h-5 mr-2 text-primary" />
            Buy Now - Escrow Payment
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Purchasing: <span className="font-semibold text-primary">{listing.title}</span>
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Price Selection */}
          <div className="space-y-3">
            <Label>Select Purchase Amount</Label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant={amount === listing.priceRange[0] ? "default" : "outline"}
                onClick={() => setAmount(listing.priceRange[0])}
                className="text-sm"
              >
                ₹{listing.priceRange[0].toLocaleString()}
              </Button>
              <Button
                type="button"
                variant={amount === listing.priceRange[1] ? "default" : "outline"}
                onClick={() => setAmount(listing.priceRange[1])}
                className="text-sm"
              >
                ₹{listing.priceRange[1].toLocaleString()}
              </Button>
            </div>
            <div className="flex items-center space-x-2">
              <Label htmlFor="custom-amount" className="text-sm">Custom Amount:</Label>
              <Input
                id="custom-amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                min={listing.priceRange[0]}
                max={listing.priceRange[1]}
                className="text-sm"
              />
            </div>
          </div>

          {/* Payment Method */}
          <div className="space-y-2">
            <Label>Payment Method</Label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant={paymentMethod === 'upi' ? "default" : "outline"}
                onClick={() => setPaymentMethod('upi')}
                className="text-sm"
              >
                UPI
              </Button>
              <Button
                type="button"
                variant={paymentMethod === 'card' ? "default" : "outline"}
                onClick={() => setPaymentMethod('card')}
                className="text-sm"
              >
                Card
              </Button>
            </div>
          </div>

          {/* Cost Breakdown */}
          <Card className="bg-muted/30">
            <CardContent className="p-4">
              <h4 className="font-semibold mb-3">Cost Breakdown</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Account Price</span>
                  <span>₹{amount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Escrow Fee (5%)</span>
                  <span>₹{(amount * escrowFee).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Platform Fee (5%)</span>
                  <span>₹{(amount * platformFee).toLocaleString()}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold">
                  <span>Total Payable</span>
                  <span className="text-primary">₹{totalAmount.toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Legal Consent */}
          <div className="space-y-3">
            <ConsentCheckbox
              id="buy-consent-1"
              checked={consent1}
              onCheckedChange={setConsent1}
              label="I confirm I am the rightful owner or have verified this listing."
              required
            />

            <ConsentCheckbox
              id="buy-consent-2"
              checked={consent2}
              onCheckedChange={setConsent2}
              label="I understand GameTradeX is an escrow-only platform."
              required
            />
          </div>

          {/* Escrow Info */}
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-3">
            <div className="flex items-start space-x-2">
              <Shield className="w-4 h-4 text-primary mt-0.5" />
              <div className="text-sm">
                <p className="font-semibold text-primary mb-1">Escrow Protection</p>
                <p className="text-muted-foreground">
                  Your payment will be held securely until account verification is complete. 
                  Only after successful transfer will the seller receive payment.
                </p>
              </div>
            </div>
          </div>

          <div className="flex space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!consent1 || !consent2 || isLoading}
              className="flex-1 btn-primary"
            >
              {isLoading ? 'Processing...' : 'Proceed to Checkout'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default BuyNowModal;


