import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Clock } from "lucide-react";
import { toast } from "sonner";
import ConsentCheckbox from "@/components/ConsentCheckbox";
import LegalDisclaimer from "@/components/LegalDisclaimer";

const Inquiry = () => {
  const [consentChecked, setConsentChecked] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!consentChecked) {
      toast.error("Please agree to the terms before submitting");
      return;
    }
    toast.success("Inquiry submitted successfully! Our team will contact you within 24 hours.");
  };

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="mb-8 text-center">
          <Search className="w-16 h-16 text-primary mx-auto mb-4" />
          <h1 className="text-4xl font-bold mb-2">Didn't Find Your Ideal Account?</h1>
          <p className="text-muted-foreground">Submit a custom request and we'll find the perfect Battle Royale account for you</p>
        </div>

        {/* Info Card */}
        <Card className="mb-8 border-accent/50 bg-accent/5">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Clock className="w-6 h-6 text-accent flex-shrink-0 mt-1" />
              <div>
                <p className="font-semibold mb-2">How Custom Requests Work</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Tell us exactly what you're looking for in a Battle Royale account</li>
                  <li>• Our team searches our network of verified sellers</li>
                  <li>• We contact you with matching options within 24-48 hours</li>
                  <li>• Choose your favorite and proceed with secure escrow payment</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Inquiry Form */}
        <Card>
          <CardHeader>
            <CardTitle>Custom Account Request</CardTitle>
            <CardDescription>The more specific you are, the better we can help you</CardDescription>
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="desired-tier">Desired Tier *</Label>
                  <Select required>
                    <SelectTrigger id="desired-tier">
                      <SelectValue placeholder="Select tier" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="conqueror">Conqueror</SelectItem>
                      <SelectItem value="ace-dominator">Ace Dominator</SelectItem>
                      <SelectItem value="ace-master">Ace Master</SelectItem>
                      <SelectItem value="ace">Ace</SelectItem>
                      <SelectItem value="crown">Crown</SelectItem>
                      <SelectItem value="diamond">Diamond</SelectItem>
                      <SelectItem value="any">Any (Flexible)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="min-kd">Minimum K/D Ratio *</Label>
                  <Input id="min-kd" type="number" step="0.1" placeholder="e.g., 3.0" required />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="min-level">Minimum Account Level</Label>
                  <Input id="min-level" type="number" placeholder="e.g., 50" />
                </div>

                <div>
                  <Label htmlFor="platform">Platform *</Label>
                  <Select required>
                    <SelectTrigger id="platform">
                      <SelectValue placeholder="Select platform" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="facebook">Facebook</SelectItem>
                      <SelectItem value="google">Google</SelectItem>
                      <SelectItem value="twitter">Twitter</SelectItem>
                      <SelectItem value="apple">Apple ID</SelectItem>
                      <SelectItem value="any">Any Platform</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="budget-min">Budget Range (₹) *</Label>
                  <Input id="budget-min" type="number" placeholder="Min: e.g., 10000" required />
                </div>
                <div>
                  <Label htmlFor="budget-max" className="invisible">Budget Max</Label>
                  <Input id="budget-max" type="number" placeholder="Max: e.g., 20000" required />
                </div>
              </div>

              <div>
                <Label htmlFor="requirements">Specific Requirements</Label>
                <Textarea
                  id="requirements"
                  placeholder="Mention any specific skins, emotes, achievements, or other features you want..."
                  rows={5}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Example: "Looking for Glacier M416, Fool Set, multiple mythic outfits"
                </p>
              </div>

              <div>
                <Label htmlFor="timeline">When do you need it?</Label>
                <Select>
                  <SelectTrigger id="timeline">
                    <SelectValue placeholder="Select urgency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="urgent">Urgent (Within 1-2 days)</SelectItem>
                    <SelectItem value="week">Within a week</SelectItem>
                    <SelectItem value="flexible">Flexible (No rush)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <ConsentCheckbox
                id="inquiry-consent"
                checked={consentChecked}
                onCheckedChange={setConsentChecked}
                label="We'll connect you with verified listings only after mediation approval."
                required
              />

              <LegalDisclaimer />

              <Button 
                type="submit" 
                size="lg" 
                className="w-full btn-primary"
                disabled={!consentChecked}
              >
                Submit Inquiry
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Additional Info */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <Clock className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-1">24-48 Hour Response</h3>
              <p className="text-sm text-muted-foreground">Quick turnaround on all inquiries</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <Search className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-1">Wide Network</h3>
              <p className="text-sm text-muted-foreground">Access to hundreds of verified sellers</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <Search className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-1">No Obligation</h3>
              <p className="text-sm text-muted-foreground">Free service, pay only if you buy</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Inquiry;
