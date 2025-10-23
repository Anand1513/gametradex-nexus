import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Upload, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import ConsentCheckbox from "@/components/ConsentCheckbox";
import LegalDisclaimer from "@/components/LegalDisclaimer";
import { serviceFees } from "@/data/mockData";

const Sell = () => {
  const [agreed1, setAgreed1] = useState(false);
  const [agreed2, setAgreed2] = useState(false);
  const [agreed3, setAgreed3] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed1 || !agreed2 || !agreed3) {
      toast.error("Please agree to all terms before submitting");
      return;
    }
    toast.success("Listing submitted for verification! Our team will contact you within 24-48 hours.");
  };

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-2">List Your Battle Royale Account</h1>
          <p className="text-muted-foreground">Submit your account for verification and connect with verified buyers</p>
        </div>

        {/* Info Banner */}
        <Card className="mb-8 border-primary/50 bg-primary/5">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Shield className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
              <div>
                <p className="font-semibold mb-2">How It Works</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Submit your account details and screenshots for verification</li>
                  <li>• Our team verifies ownership and statistics within 24-48 hours</li>
                  <li>• Once verified, your listing goes live on the marketplace</li>
                  <li>• We facilitate secure escrow transactions with interested buyers</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Form */}
        <Card>
          <CardHeader>
            <CardTitle>Account Details</CardTitle>
            <CardDescription>Provide accurate information for faster verification</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Your Name *</Label>
                  <Input id="name" placeholder="Full name" required />
                </div>
                <div>
                  <Label htmlFor="contact">Contact Number *</Label>
                  <Input id="contact" type="tel" placeholder="+91 XXXXXXXXXX" required />
                </div>
              </div>

              <div>
                <Label htmlFor="email">Email Address *</Label>
                <Input id="email" type="email" placeholder="your@email.com" required />
              </div>

              <div>
                <Label htmlFor="bgmi-id">Partial Battleground ID *</Label>
                <Input id="bgmi-id" placeholder="e.g., 51XXXXX789 (mask middle digits)" required />
                <p className="text-xs text-muted-foreground mt-1">
                  For security, only share partial ID. Full ID will be verified privately.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="tier">Current Tier *</Label>
                  <Select required>
                    <SelectTrigger id="tier">
                      <SelectValue placeholder="Select tier" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="conqueror">Conqueror</SelectItem>
                      <SelectItem value="ace-dominator">Ace Dominator</SelectItem>
                      <SelectItem value="ace-master">Ace Master</SelectItem>
                      <SelectItem value="ace">Ace</SelectItem>
                      <SelectItem value="crown">Crown</SelectItem>
                      <SelectItem value="diamond">Diamond</SelectItem>
                      <SelectItem value="platinum">Platinum</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="kd">K/D Ratio *</Label>
                  <Input id="kd" type="number" step="0.1" placeholder="e.g., 3.5" required />
                </div>

                <div>
                  <Label htmlFor="level">Account Level *</Label>
                  <Input id="level" type="number" placeholder="e.g., 65" required />
                </div>
              </div>

              <div>
                <Label htmlFor="price">Expected Price (₹) *</Label>
                <Input id="price" type="number" placeholder="e.g., 15000" required />
                <p className="text-xs text-muted-foreground mt-1">
                  Final price will be negotiated based on verification and market demand
                </p>
              </div>

              <div>
                <Label htmlFor="description">Account Description</Label>
                <Textarea
                  id="description"
                  placeholder="Mention any special skins, achievements, season rewards, etc."
                  rows={4}
                />
              </div>

              <div>
                <Label htmlFor="screenshots">Upload Screenshots *</Label>
                <div className="mt-2 border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer">
                  <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground mb-1">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Upload screenshots of stats, inventory, and tier (Max 5 images)
                  </p>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  All uploads will be watermarked for security
                </p>
              </div>

              {/* Legal Agreements */}
              <div className="space-y-4 bg-muted/50 p-6 rounded-lg border border-border">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                  <p className="text-sm font-semibold">Important Legal Notices</p>
                </div>

                <ConsentCheckbox
                  id="consent1"
                  checked={agreed1}
                  onCheckedChange={setAgreed1}
                  label="I confirm that I am the rightful owner of this gaming account."
                  required
                />

                <ConsentCheckbox
                  id="consent2"
                  checked={agreed2}
                  onCheckedChange={setAgreed2}
                  label="I understand that GameTradeX provides mediation only — not direct account sales."
                  required
                />

                <ConsentCheckbox
                  id="consent3"
                  checked={agreed3}
                  onCheckedChange={setAgreed3}
                  label="I take full responsibility and agree to the platform's Terms of Service."
                  required
                />

                <LegalDisclaimer />
              </div>

              <Button 
                type="submit" 
                size="lg" 
                className="w-full btn-primary"
                disabled={!agreed1 || !agreed2 || !agreed3}
              >
                Submit for Verification
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Service Fee Info */}
        <Card className="mt-6 card-glow">
          <CardHeader>
            <CardTitle className="text-lg">Service Fee Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Seller Price</span>
                <span>100%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Platform Fee</span>
                <span>{(serviceFees.platformFee * 100).toFixed(0)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Escrow Fee</span>
                <span>{(serviceFees.escrowFee * 100).toFixed(0)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Verification Fee</span>
                <span>{(serviceFees.verificationFee * 100).toFixed(0)}%</span>
              </div>
              <div className="flex justify-between border-t border-border pt-2 font-semibold">
                <span>You Receive</span>
                <span>{((1 - serviceFees.platformFee - serviceFees.escrowFee - serviceFees.verificationFee) * 100).toFixed(0)}%</span>
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                Service fees cover verification, escrow, negotiation support, and 24/7 customer service.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Sell;
