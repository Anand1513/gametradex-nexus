import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import ConsentCheckbox from './ConsentCheckbox';

interface BidModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (bidData: { amount: number; message: string }) => void;
  accountTitle: string;
  currentBid?: number;
}

const BidModal: React.FC<BidModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  accountTitle,
  currentBid
}) => {
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');
  const [consentChecked, setConsentChecked] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (consentChecked && amount) {
      onSubmit({
        amount: parseFloat(amount),
        message
      });
      onClose();
      setAmount('');
      setMessage('');
      setConsentChecked(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            Place a Bid
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Bidding on: <span className="font-semibold text-primary">{accountTitle}</span>
          </p>
          {currentBid && (
            <p className="text-sm text-muted-foreground">
              Current highest bid: <span className="font-semibold text-primary">₹{currentBid.toLocaleString()}</span>
            </p>
          )}
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Bid Amount (₹)</Label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter your bid amount"
              min={currentBid ? currentBid + 1 : 1}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message (Optional)</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Add a message for the seller..."
              rows={3}
            />
          </div>

          <ConsentCheckbox
            id="bid-consent"
            checked={consentChecked}
            onCheckedChange={setConsentChecked}
            label="I understand that this bid is a non-binding offer pending verification."
            required
          />

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
              disabled={!consentChecked || !amount}
              className="flex-1 btn-primary"
            >
              Place Bid
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default BidModal;


