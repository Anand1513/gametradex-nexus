import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { CreditCard } from "lucide-react";
import toast from "react-hot-toast";

interface Listing {
  id: string;
  title: string;
  priceMin?: number;
  priceMax?: number;
  isFixed?: boolean;
  pendingPrice?: boolean;
  negotiable?: boolean;
}

interface EditPriceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  listing: Listing;
  isLoading?: boolean;
}

const EditPriceModal: React.FC<EditPriceModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  listing,
  isLoading = false
}) => {
  const [priceMin, setPriceMin] = useState<string>(listing.priceMin?.toString() || '');
  const [priceMax, setPriceMax] = useState<string>(listing.priceMax?.toString() || '');
  const [isFixedPrice, setIsFixedPrice] = useState<boolean>(listing.isFixed || false);
  const [isNegotiable, setIsNegotiable] = useState<boolean>(listing.negotiable || false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isFixedPrice && !priceMin) {
      toast.error("Please enter a fixed price");
      return;
    }
    
    if (!isFixedPrice && (!priceMin || !priceMax)) {
      toast.error("Please enter both minimum and maximum price");
      return;
    }
    
    if (!isFixedPrice && parseInt(priceMin) >= parseInt(priceMax)) {
      toast.error("Maximum price must be greater than minimum price");
      return;
    }

    const data = {
      id: listing.id,
      priceMin: parseInt(priceMin),
      priceMax: isFixedPrice ? parseInt(priceMin) : parseInt(priceMax),
      isFixed: isFixedPrice,
      negotiable: isNegotiable,
      pendingPrice: false // Admin has set the price, so it's no longer pending
    };

    onSubmit(data);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-card border-primary/20 shadow-glow">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            <CreditCard className="w-5 h-5 mr-2 text-primary" />
            Edit Listing Price
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Editing: <span className="font-semibold text-primary">{listing.title}</span>
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="isFixedPrice" 
                checked={isFixedPrice} 
                onCheckedChange={(checked) => {
                  setIsFixedPrice(checked as boolean);
                  if (checked) {
                    setIsNegotiable(false);
                  }
                }}
              />
              <Label htmlFor="isFixedPrice" className="cursor-pointer">Fixed Price</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="isNegotiable" 
                checked={isNegotiable} 
                onCheckedChange={(checked) => {
                  setIsNegotiable(checked as boolean);
                  if (checked) {
                    setIsFixedPrice(false);
                  }
                }}
              />
              <Label htmlFor="isNegotiable" className="cursor-pointer">Negotiable</Label>
            </div>
          </div>

          {isFixedPrice ? (
            <div>
              <Label htmlFor="fixedPrice">Fixed Price (₹)</Label>
              <Input
                id="fixedPrice"
                type="number"
                value={priceMin}
                onChange={(e) => setPriceMin(e.target.value)}
                placeholder="e.g., 15000"
                required
                className="bg-background border-border focus:border-primary focus:ring-primary/20"
              />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="minPrice">Minimum Price (₹)</Label>
                <Input
                  id="minPrice"
                  type="number"
                  value={priceMin}
                  onChange={(e) => setPriceMin(e.target.value)}
                  placeholder="e.g., 10000"
                  required
                  className="bg-background border-border focus:border-primary focus:ring-primary/20"
                />
              </div>
              <div>
                <Label htmlFor="maxPrice">Maximum Price (₹)</Label>
                <Input
                  id="maxPrice"
                  type="number"
                  value={priceMax}
                  onChange={(e) => setPriceMax(e.target.value)}
                  placeholder="e.g., 20000"
                  required
                  className="bg-background border-border focus:border-primary focus:ring-primary/20"
                />
              </div>
            </div>
          )}

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={onClose} className="border-border hover:bg-muted">
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="btn-primary">
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditPriceModal;