import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MessageCircle, Send, Phone, X } from 'lucide-react';

interface ContactSellerModalProps {
  isOpen: boolean;
  onClose: () => void;
  listing: {
    id: string;
    title: string;
    priceRange: [number, number];
    priceFixed?: number;
    isFixed?: boolean;
    sellerContacts?: {
      discord?: string;
      telegram?: string;
      whatsapp?: string;
    };
  };
}

const ContactSellerModal: React.FC<ContactSellerModalProps> = ({
  isOpen,
  onClose,
  listing
}) => {
  const generateMessage = () => {
    const priceText = listing.isFixed && listing.priceFixed 
      ? `₹${listing.priceFixed.toLocaleString()}`
      : `₹${listing.priceRange[0].toLocaleString()} - ₹${listing.priceRange[1].toLocaleString()}`;
    
    const listingUrl = `${window.location.origin}/listing/${listing.id}`;
    
    return `Hi! I'm interested in your ${listing.title} (ID: ${listing.id}) with price ${priceText}. Can we discuss the details? Listing URL: ${listingUrl}`;
  };

  const handleDiscordClick = () => {
    if (listing.sellerContacts?.discord) {
      const message = encodeURIComponent(generateMessage());
      const discordUrl = `https://discord.com/users/${listing.sellerContacts.discord}?message=${message}`;
      window.open(discordUrl, '_blank');
    }
  };

  const handleTelegramClick = () => {
    if (listing.sellerContacts?.telegram) {
      const message = encodeURIComponent(generateMessage());
      const telegramUrl = `https://t.me/${listing.sellerContacts.telegram}?text=${message}`;
      window.open(telegramUrl, '_blank');
    }
  };

  const handleWhatsAppClick = () => {
    if (listing.sellerContacts?.whatsapp) {
      const message = encodeURIComponent(generateMessage());
      const whatsappUrl = `https://wa.me/${listing.sellerContacts.whatsapp}?text=${message}`;
      window.open(whatsappUrl, '_blank');
    }
  };

  const hasAnyContact = listing.sellerContacts && (
    listing.sellerContacts.discord || 
    listing.sellerContacts.telegram || 
    listing.sellerContacts.whatsapp
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md card-glow">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            Contact Seller
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {hasAnyContact ? (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground text-center">
                Choose your preferred way to contact the seller:
              </p>
              
              <div className="space-y-2">
                {listing.sellerContacts?.discord && (
                  <Button
                    onClick={handleDiscordClick}
                    variant="outline"
                    className="w-full justify-center hover:bg-primary/10 hover:border-primary/50 transition-all duration-300"
                  >
                    <MessageCircle className="w-4 h-4 mr-2 text-primary" />
                    <span className="font-medium">Discord</span>
                  </Button>
                )}

                {listing.sellerContacts?.telegram && (
                  <Button
                    onClick={handleTelegramClick}
                    variant="outline"
                    className="w-full justify-center hover:bg-primary/10 hover:border-primary/50 transition-all duration-300"
                  >
                    <Send className="w-4 h-4 mr-2 text-primary" />
                    <span className="font-medium">Telegram</span>
                  </Button>
                )}

                {listing.sellerContacts?.whatsapp && (
                  <Button
                    onClick={handleWhatsAppClick}
                    variant="outline"
                    className="w-full justify-center hover:bg-primary/10 hover:border-primary/50 transition-all duration-300"
                  >
                    <Phone className="w-4 h-4 mr-2 text-primary" />
                    <span className="font-medium">WhatsApp</span>
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <Card className="bg-muted/50 border-border">
              <CardContent className="p-4 text-center">
                <MessageCircle className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  No contact information available for this seller.
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Please use the "Contact Support" button for assistance.
                </p>
              </CardContent>
            </Card>
          )}
          
          <div className="pt-4 border-t border-border">
            <Button onClick={onClose} variant="outline" className="w-full">
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ContactSellerModal;
