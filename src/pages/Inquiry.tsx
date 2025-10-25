import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Clock, CreditCard, CheckCircle, FileText, DollarSign, Phone } from "lucide-react";
import { toast } from "sonner";
import ConsentCheckbox from "@/components/ConsentCheckbox";
import LegalDisclaimer from "@/components/LegalDisclaimer";
import { useAuth } from "@/contexts/AuthContext";

const Inquiry = () => {
  const { user, userData } = useAuth();
  const [consentChecked, setConsentChecked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [requestId, setRequestId] = useState<string | null>(null);
  const [showPayment, setShowPayment] = useState(false);
  const [currentStep, setCurrentStep] = useState(1); // 1: Details, 2: Payment, 3: Contact
  const [customRequestId, setCustomRequestId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    game: 'BGMI',
    budgetMin: '',
    budgetMax: '',
    description: '',
    minimumLevel: '',
    minimumCollectionLevel: '',
    platform: 'Any',
    specificFeatures: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !userData) {
      toast.error("Please log in to submit a custom request");
      return;
    }

    if (!consentChecked) {
      toast.error("Please agree to the terms before submitting");
      return;
    }

    if (!formData.title || !formData.description || !formData.budgetMin || !formData.budgetMax) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Validate minimum budget
    const minBudget = parseInt(formData.budgetMin);
    if (minBudget < 5000) {
      toast.error("Minimum budget must be ₹5,000 or more");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:3001/api/custom-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userData.uid,
          title: formData.title,
          game: formData.game,
          budget: {
            min: parseInt(formData.budgetMin),
            max: parseInt(formData.budgetMax),
            currency: 'INR'
          },
          description: formData.description,
          requirements: {
            minimumLevel: formData.minimumLevel ? parseInt(formData.minimumLevel) : undefined,
            minimumCollectionLevel: formData.minimumCollectionLevel ? parseFloat(formData.minimumCollectionLevel) : undefined,
            platform: formData.platform,
            specificFeatures: formData.specificFeatures ? formData.specificFeatures.split(',').map(f => f.trim()) : []
          },
          userEmail: userData.email
        })
      });

      const result = await response.json();

      if (result.success) {
        setRequestId(result.data.requestId);
        setShowPayment(true);
        setCurrentStep(2);
        toast.success("Request received. Please complete payment to proceed.");
      } else {
        toast.error(result.message || "Failed to create custom request");
      }
    } catch (error) {
      console.error('Error creating custom request:', error);
      toast.error("Failed to create custom request. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!requestId) return;

    setIsLoading(true);

    try {
      // Simulate payment process
      const paymentDetails = {
        amount: parseInt(formData.budgetMin) * 0.1, // 10% advance payment
        paymentMethod: 'upi',
        transactionId: `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`
      };

      const response = await fetch('http://localhost:3001/api/payments/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requestId,
          paymentDetails,
          transactionId: paymentDetails.transactionId,
          paymentMethod: paymentDetails.paymentMethod,
          userEmail: userData?.email
        })
      });

      const result = await response.json();

      if (result.success) {
        setCustomRequestId(result.data.customRequestId);
        setShowPayment(false);
        setCurrentStep(3);
        toast.success(`Your Custom Request ID is ${result.data.customRequestId}`);
      } else {
        toast.error(result.message || "Payment verification failed");
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      toast.error("Payment processing failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="mb-8 text-center">
          <Search className="w-16 h-16 text-primary mx-auto mb-4" />
          <h1 className="text-4xl font-bold mb-2">Didn't Find Your Ideal Account?</h1>
          <p className="text-muted-foreground">Submit a custom request and we'll find the perfect Battle Royale account for you</p>
        </div>

        {/* 3-Step Progress Indicator */}
        <Card className="mb-8 border-primary/20 bg-primary/5">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              {/* Step 1: Fill Details */}
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  currentStep === 1 ? 'bg-primary text-white' : 
                  currentStep > 1 ? 'bg-green-500 text-white' : 'bg-muted text-muted-foreground'
                }`}>
                  {currentStep > 1 ? <CheckCircle className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="font-semibold">1. Fill Details</h3>
                  <p className="text-sm text-muted-foreground">Provide your requirements</p>
                </div>
              </div>

              {/* Arrow */}
              <div className={`flex-1 h-0.5 mx-4 ${
                currentStep > 1 ? 'bg-primary' : 'bg-muted'
              }`}></div>

              {/* Step 2: Payment */}
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  currentStep === 2 ? 'bg-primary text-white' : 
                  currentStep > 2 ? 'bg-green-500 text-white' : 'bg-muted text-muted-foreground'
                }`}>
                  {currentStep > 2 ? <CheckCircle className="w-5 h-5" /> : <CreditCard className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="font-semibold">2. Payment</h3>
                  <p className="text-sm text-muted-foreground">Complete advance payment</p>
                </div>
              </div>

              {/* Arrow */}
              <div className={`flex-1 h-0.5 mx-4 ${
                currentStep > 2 ? 'bg-primary' : 'bg-muted'
              }`}></div>

              {/* Step 3: Contact */}
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  currentStep === 3 ? 'bg-primary text-white' : 
                  currentStep > 3 ? 'bg-green-500 text-white' : 'bg-muted text-muted-foreground'
                }`}>
                  {currentStep > 3 ? <CheckCircle className="w-5 h-5" /> : <Phone className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="font-semibold">3. Contact</h3>
                  <p className="text-sm text-muted-foreground">We'll contact you with options</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

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

        {/* Step Content */}
        {currentStep === 1 && (
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
                <Label htmlFor="title">Request Title *</Label>
                <Input 
                  id="title" 
                  placeholder="e.g., High-tier Conqueror Account" 
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  required 
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="game">Game *</Label>
                  <Select 
                    value={formData.game}
                    onValueChange={(value) => handleInputChange('game', value)}
                    required
                  >
                    <SelectTrigger id="game">
                      <SelectValue placeholder="Select game" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BGMI">BGMI</SelectItem>
                      <SelectItem value="PUBG">PUBG</SelectItem>
                      <SelectItem value="Free Fire">Free Fire</SelectItem>
                      <SelectItem value="Valorant">Valorant</SelectItem>
                      <SelectItem value="Fortnite">Fortnite</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="min-collection-level">Minimum Collection Level *</Label>
                  <Input 
                    id="min-collection-level" 
                    type="number" 
                    step="0.1" 
                    placeholder="e.g., 3.0" 
                    value={formData.minimumCollectionLevel}
                    onChange={(e) => handleInputChange('minimumCollectionLevel', e.target.value)}
                    required 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="min-level">Minimum Account Level</Label>
                  <Input 
                    id="min-level" 
                    type="number" 
                    placeholder="e.g., 50" 
                    value={formData.minimumLevel}
                    onChange={(e) => handleInputChange('minimumLevel', e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="platform">Platform *</Label>
                  <Select 
                    value={formData.platform}
                    onValueChange={(value) => handleInputChange('platform', value)}
                    required
                  >
                    <SelectTrigger id="platform">
                      <SelectValue placeholder="Select platform" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Facebook">Facebook</SelectItem>
                      <SelectItem value="Google">Google</SelectItem>
                      <SelectItem value="Twitter">Twitter</SelectItem>
                      <SelectItem value="Apple">Apple ID</SelectItem>
                      <SelectItem value="Any">Any Platform</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="budget-min">Budget Range (₹) *</Label>
                  <Input 
                    id="budget-min" 
                    type="number" 
                    placeholder="Min: ₹5,000 or more" 
                    min="5000"
                    value={formData.budgetMin}
                    onChange={(e) => handleInputChange('budgetMin', e.target.value)}
                    required 
                  />
                  <p className="text-xs text-muted-foreground mt-1">Minimum budget: ₹5,000</p>
                </div>
                <div>
                  <Label htmlFor="budget-max" className="invisible">Budget Max</Label>
                  <Input 
                    id="budget-max" 
                    type="number" 
                    placeholder="Max: e.g., 20000" 
                    value={formData.budgetMax}
                    onChange={(e) => handleInputChange('budgetMax', e.target.value)}
                    required 
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Describe what you're looking for in detail..."
                  rows={5}
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Be specific about what you want: skins, achievements, stats, etc.
                </p>
              </div>

              <div>
                <Label htmlFor="specific-features">Specific Features</Label>
                <Textarea
                  id="specific-features"
                  placeholder="Mention any specific skins, emotes, achievements, or other features you want..."
                  rows={3}
                  value={formData.specificFeatures}
                  onChange={(e) => handleInputChange('specificFeatures', e.target.value)}
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
                disabled={!consentChecked || isLoading}
              >
                {isLoading ? "Creating Request..." : "Submit Custom Request"}
              </Button>
            </form>
          </CardContent>
        </Card>
        )}

        {/* Step 2: Payment */}
        {currentStep === 2 && showPayment && (
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCard className="w-5 h-5 mr-2" />
                Complete Payment to Proceed
              </CardTitle>
              <CardDescription>
                A small advance payment is required to confirm your custom request
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Request Details</h4>
                  <p><strong>Title:</strong> {formData.title}</p>
                  <p><strong>Game:</strong> {formData.game}</p>
                  <p><strong>Budget:</strong> ₹{formData.budgetMin} - ₹{formData.budgetMax}</p>
                  {requestId && (
                    <div className="mt-3 p-3 bg-primary/10 rounded-lg border border-primary/20">
                      <p className="text-sm font-medium text-primary">Your Request ID:</p>
                      <p className="font-mono text-lg font-bold">{requestId}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Keep this ID safe for future reference
                      </p>
                    </div>
                  )}
                </div>
                
                <div className="bg-accent/10 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Advance Payment</h4>
                  <p className="text-2xl font-bold text-primary">
                    ₹{Math.round(parseInt(formData.budgetMin) * 0.1).toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    10% of minimum budget (₹{formData.budgetMin})
                  </p>
                </div>

                {/* Terms and Conditions */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="font-semibold text-yellow-800 mb-2">Terms & Conditions</h4>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    <li>• Advance payment is non-refundable once processing begins</li>
                    <li>• We will contact you within 24-48 hours with account options</li>
                    <li>• If no suitable account is found, advance payment will be refunded</li>
                    <li>• Final payment is due only after you approve the account</li>
                  </ul>
                </div>

                <div className="flex space-x-2">
                  <Button 
                    onClick={handlePayment}
                    disabled={isLoading}
                    className="flex-1"
                  >
                    {isLoading ? "Processing..." : "Pay Now"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setCurrentStep(1);
                      setShowPayment(false);
                    }}
                    disabled={isLoading}
                  >
                    Back to Details
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Contact */}
        {currentStep === 3 && (
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="flex items-center text-green-800">
                <CheckCircle className="w-5 h-5 mr-2" />
                Request Submitted Successfully!
              </CardTitle>
              <CardDescription className="text-green-700">
                We'll contact you soon with account options
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-lg border border-green-200">
                  <h4 className="font-semibold text-green-800 mb-4">Your Custom Request Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 block">Request ID:</label>
                        <div className="font-mono bg-green-100 text-green-800 px-3 py-2 rounded border border-green-300 text-sm font-semibold">
                          {requestId}
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 block">Custom Request ID:</label>
                        <div className="font-mono bg-blue-100 text-blue-800 px-3 py-2 rounded border border-blue-300 text-sm font-semibold">
                          {customRequestId}
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Title:</label>
                        <div className="text-lg font-semibold text-gray-800">{formData.title}</div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-gray-600">Game:</label>
                        <div className="text-lg font-semibold text-gray-800">{formData.game}</div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Budget Range:</label>
                        <div className="text-lg font-semibold text-gray-800">₹{parseInt(formData.budgetMin).toLocaleString()} - ₹{parseInt(formData.budgetMax).toLocaleString()}</div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Advance Paid:</label>
                        <div className="text-lg font-semibold text-green-600">₹{Math.round(parseInt(formData.budgetMin) * 0.1).toLocaleString()}</div>
                      </div>
                    </div>
                  </div>
                  
                  {formData.description && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <label className="text-sm font-medium text-gray-600">Description:</label>
                      <div className="mt-1 text-gray-800 bg-gray-50 p-3 rounded">{formData.description}</div>
                    </div>
                  )}
                  
                  {(formData.minimumLevel || formData.minimumCollectionLevel) && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <label className="text-sm font-medium text-gray-600">Requirements:</label>
                      <div className="mt-1 grid grid-cols-1 md:grid-cols-2 gap-2">
                        {formData.minimumLevel && (
                          <div className="text-sm text-gray-700">
                            <span className="font-medium">Level:</span> {formData.minimumLevel}
                          </div>
                        )}
                        {formData.minimumCollectionLevel && (
                          <div className="text-sm text-gray-700">
                            <span className="font-medium">Collection Level:</span> {formData.minimumCollectionLevel}
                          </div>
                        )}
                        {formData.platform && formData.platform !== 'Any' && (
                          <div className="text-sm text-gray-700">
                            <span className="font-medium">Platform:</span> {formData.platform}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-800 mb-2">What happens next?</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Our team will start searching for matching accounts</li>
                    <li>• We'll contact you within 24-48 hours with options</li>
                    <li>• You can approve or request different accounts</li>
                    <li>• Final payment is due only after you approve an account</li>
                  </ul>
                </div>

                <div className="text-center">
                  <Button 
                    onClick={() => {
                      setCurrentStep(1);
                      setRequestId(null);
                      setCustomRequestId(null);
                      setShowPayment(false);
                      setFormData({
                        title: '',
                        game: 'BGMI',
                        budgetMin: '',
                        budgetMax: '',
                        description: '',
                        minimumLevel: '',
                        minimumCollectionLevel: '',
                        platform: 'Any',
                        specificFeatures: ''
                      });
                      setConsentChecked(false);
                    }}
                    variant="outline"
                  >
                    Submit Another Request
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}


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
