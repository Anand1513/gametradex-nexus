import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Upload, AlertTriangle, X, Image, Video, FileText, Loader2 } from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';
import { listingsService } from '@/services/firestore';
import toast from 'react-hot-toast';
import ConsentCheckbox from "@/components/ConsentCheckbox";
import LegalDisclaimer from "@/components/LegalDisclaimer";
import { serviceFees } from "@/data/mockData";

const Sell = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    tier: '',
    kd: '',
    level: '',
    priceMin: '',
    priceMax: '',
    description: '',
    game: 'BGMI',
    characterId: '',
    isFixedPrice: false,
    contactAdmin: false,
    sellerContacts: {
      discord: '',
      telegram: '',
      whatsapp: ''
    }
  });
  const [agreed1, setAgreed1] = useState(false);
  const [agreed2, setAgreed2] = useState(false);
  const [agreed3, setAgreed3] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [screenshots, setScreenshots] = useState<File[]>([]);
  const [videos, setVideos] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSellerContactChange = (field: string, value: string) => {
    setFormData({
      ...formData,
      sellerContacts: {
        ...formData.sellerContacts,
        [field]: value
      }
    });
  };

  const handleFileUpload = (files: FileList, type: 'screenshots' | 'videos') => {
    const fileArray = Array.from(files);
    
    // Validate file types
    if (type === 'screenshots') {
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      const invalidFiles = fileArray.filter(file => !validTypes.includes(file.type));
      if (invalidFiles.length > 0) {
        toast.error('Only JPEG, PNG, and WebP images are allowed for screenshots');
        return;
      }
    } else if (type === 'videos') {
      const validTypes = ['video/mp4', 'video/mov', 'video/webm'];
      const invalidFiles = fileArray.filter(file => !validTypes.includes(file.type));
      if (invalidFiles.length > 0) {
        toast.error('Only MP4, MOV, and WebM videos are allowed');
        return;
      }
      
      // Check file size (50MB max)
      const oversizedFiles = fileArray.filter(file => file.size > 50 * 1024 * 1024);
      if (oversizedFiles.length > 0) {
        toast.error('Videos must be smaller than 50MB each');
        return;
      }
    }
    
    if (type === 'screenshots') {
      setScreenshots(prev => [...prev, ...fileArray].slice(0, 10)); // Max 10 screenshots
    } else {
      setVideos(prev => [...prev, ...fileArray].slice(0, 5)); // Max 5 videos
    }
  };

  const removeFile = (index: number, type: 'screenshots' | 'videos') => {
    if (type === 'screenshots') {
      setScreenshots(prev => prev.filter((_, i) => i !== index));
    } else {
      setVideos(prev => prev.filter((_, i) => i !== index));
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error("Please log in to continue");
      return;
    }
    
    if (!agreed1 || !agreed2 || !agreed3) {
      toast.error("Please agree to all terms before submitting");
      return;
    }

    // Validate required fields
    if (!formData.characterId.trim()) {
      toast.error("Character ID is required");
      return;
    }

    if (!formData.kd.trim()) {
      toast.error("Collection Level is required");
      return;
    }

    if (screenshots.length === 0) {
      toast.error("At least one screenshot is required");
      return;
    }

    setIsLoading(true);
    setUploadProgress(0);

    try {
      // Create FormData for multipart/form-data submission
      const formDataToSend = new FormData();
      
      // Add text fields
      formDataToSend.append('title', formData.title);
      formDataToSend.append('game', formData.game);
      formDataToSend.append('characterId', formData.characterId);
      formDataToSend.append('collectionLevel', formData.kd);
      formDataToSend.append('level', formData.level);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('tier', formData.tier);
      formDataToSend.append('sellerId', user.uid);
      
      // Add seller contacts
      if (formData.sellerContacts.discord) {
        formDataToSend.append('sellerContacts[discord]', formData.sellerContacts.discord);
      }
      if (formData.sellerContacts.telegram) {
        formDataToSend.append('sellerContacts[telegram]', formData.sellerContacts.telegram);
      }
      if (formData.sellerContacts.whatsapp) {
        formDataToSend.append('sellerContacts[whatsapp]', formData.sellerContacts.whatsapp);
      }
      
      // Add price fields
      if (!formData.contactAdmin) {
        if (formData.isFixedPrice) {
          formDataToSend.append('priceMin', formData.priceMin);
          formDataToSend.append('priceMax', formData.priceMin);
        } else {
          formDataToSend.append('priceMin', formData.priceMin);
          formDataToSend.append('priceMax', formData.priceMax);
        }
      }

      // Add files
      screenshots.forEach((file, index) => {
        formDataToSend.append('screenshots', file);
      });
      
      videos.forEach((file, index) => {
        formDataToSend.append('videos', file);
      });

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Submit to API
      const response = await fetch('/api/listings', {
        method: 'POST',
        body: formDataToSend,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!response.ok) {
        throw new Error('Failed to submit listing');
      }

      const result = await response.json();
      
      const successMessage = formData.contactAdmin 
        ? "Listing submitted! Our admin team will contact you about pricing."
        : "Listing submitted for verification! Our team will contact you within 24-48 hours.";
      
      toast.success(successMessage);
      
      // Reset form
      setFormData({
        title: '',
        tier: '',
        kd: '',
        level: '',
        priceMin: '',
        priceMax: '',
        description: '',
        game: 'BGMI',
        characterId: '',
        isFixedPrice: false,
        contactAdmin: false,
        sellerContacts: {
          discord: '',
          telegram: '',
          whatsapp: ''
        }
      });
      setScreenshots([]);
      setVideos([]);
      setAgreed1(false);
      setAgreed2(false);
      setAgreed3(false);
      setUploadProgress(0);
    } catch (error) {
      console.error('Submission error:', error);
      toast.error("Failed to submit listing. Please try again.");
    } finally {
      setIsLoading(false);
    }
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
              <div>
                <Label htmlFor="title">Account Title *</Label>
                <Input 
                  id="title" 
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g., Conqueror Account with 3+ KD" 
                  required 
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="tier">Current Tier *</Label>
                  <Select name="tier" value={formData.tier} onValueChange={(value) => setFormData({...formData, tier: value})} required>
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
                  <Label htmlFor="level">Account Level *</Label>
                  <Input 
                    id="level" 
                    name="level"
                    value={formData.level}
                    onChange={handleChange}
                    type="number" 
                    placeholder="e.g., 65" 
                    required 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="characterId">Character ID *</Label>
                  <Input 
                    id="characterId" 
                    name="characterId"
                    value={formData.characterId}
                    onChange={handleChange}
                    placeholder="e.g., 1234567890" 
                    required 
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Your in-game character ID for verification
                  </p>
                </div>

                <div>
                  <Label htmlFor="kd">Collection Level *</Label>
                  <Input 
                    id="kd" 
                    name="kd"
                    value={formData.kd}
                    onChange={handleChange}
                    type="number" 
                    step="0.1" 
                    placeholder="e.g., 3.5" 
                    required 
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Your collection level or overall rating
                  </p>
                </div>
              </div>

              <div className="mb-4">
                <Label className="mb-2 block">Price Options</Label>
                <div className="flex items-center space-x-4 mb-4">
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="priceRange"
                      name="priceOption"
                      className="mr-2"
                      checked={!formData.isFixedPrice && !formData.contactAdmin}
                      onChange={() => setFormData({
                        ...formData,
                        isFixedPrice: false,
                        contactAdmin: false
                      })}
                    />
                    <Label htmlFor="priceRange" className="cursor-pointer">Price Range</Label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="fixedPrice"
                      name="priceOption"
                      className="mr-2"
                      checked={formData.isFixedPrice && !formData.contactAdmin}
                      onChange={() => setFormData({
                        ...formData,
                        isFixedPrice: true,
                        contactAdmin: false
                      })}
                    />
                    <Label htmlFor="fixedPrice" className="cursor-pointer">Fixed Price</Label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="contactAdmin"
                      name="priceOption"
                      className="mr-2"
                      checked={formData.contactAdmin}
                      onChange={() => setFormData({
                        ...formData,
                        isFixedPrice: false,
                        contactAdmin: true
                      })}
                    />
                    <Label htmlFor="contactAdmin" className="cursor-pointer">I'm Not Sure (Contact Admin)</Label>
                  </div>
                </div>
                
                {!formData.contactAdmin && (
                  formData.isFixedPrice ? (
                    <div className="mb-4">
                      <Label htmlFor="priceMin">Fixed Price (₹) *</Label>
                      <Input 
                        id="priceMin" 
                        name="priceMin"
                        value={formData.priceMin}
                        onChange={handleChange}
                        type="number" 
                        placeholder="e.g., 12000" 
                        required={!formData.contactAdmin}
                      />
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="priceMin">Minimum Price (₹) *</Label>
                        <Input 
                          id="priceMin" 
                          name="priceMin"
                          value={formData.priceMin}
                          onChange={handleChange}
                          type="number" 
                          placeholder="e.g., 10000" 
                          required={!formData.contactAdmin}
                        />
                      </div>
                      <div>
                        <Label htmlFor="priceMax">Maximum Price (₹) *</Label>
                        <Input 
                          id="priceMax" 
                          name="priceMax"
                          value={formData.priceMax}
                          onChange={handleChange}
                          type="number" 
                          placeholder="e.g., 15000" 
                          required={!formData.contactAdmin}
                        />
                      </div>
                    </div>
                  )
                )}
                
                {formData.contactAdmin && (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md text-yellow-800 text-sm">
                    <p className="font-medium">You've selected "Contact Admin"</p>
                    <p>Our admin team will review your listing and contact you to discuss pricing options.</p>
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="description">Account Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Mention any special skins, achievements, season rewards, etc."
                  rows={4}
                />
              </div>

              {/* Seller Contact Information */}
              <div>
                <Label className="text-base font-semibold">Contact Information (Optional)</Label>
                <p className="text-sm text-muted-foreground mb-4">
                  Provide your contact details for potential buyers to reach you directly
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="discord">Discord Username</Label>
                    <Input 
                      id="discord" 
                      name="discord"
                      value={formData.sellerContacts.discord}
                      onChange={(e) => handleSellerContactChange('discord', e.target.value)}
                      placeholder="e.g., username#1234" 
                    />
                  </div>

                  <div>
                    <Label htmlFor="telegram">Telegram Username</Label>
                    <Input 
                      id="telegram" 
                      name="telegram"
                      value={formData.sellerContacts.telegram}
                      onChange={(e) => handleSellerContactChange('telegram', e.target.value)}
                      placeholder="e.g., @username" 
                    />
                  </div>

                  <div>
                    <Label htmlFor="whatsapp">WhatsApp Number</Label>
                    <Input 
                      id="whatsapp" 
                      name="whatsapp"
                      value={formData.sellerContacts.whatsapp}
                      onChange={(e) => handleSellerContactChange('whatsapp', e.target.value)}
                      placeholder="7703976645" 
                    />
                  </div>
                </div>
                
                <p className="text-xs text-muted-foreground mt-2">
                  These details will be visible to verified buyers after purchase
                </p>
              </div>

              {/* Screenshots Upload */}
              <div>
                <Label htmlFor="screenshots">Upload Screenshots *</Label>
                <div 
                  className="mt-2 border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
                  onClick={() => document.getElementById('screenshots-input')?.click()}
                >
                  <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground mb-1">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Upload screenshots of stats, inventory, and tier (Max 10 images)
                  </p>
                </div>
                <input
                  id="screenshots-input"
                  type="file"
                  multiple
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={(e) => e.target.files && handleFileUpload(e.target.files, 'screenshots')}
                  className="hidden"
                />
                
                {/* Screenshot Previews */}
                {screenshots.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-medium mb-2">Screenshots ({screenshots.length}/10)</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {screenshots.map((file, index) => (
                        <div key={index} className="relative group">
                          <div className="aspect-square rounded-lg overflow-hidden border border-border bg-muted">
                            <img
                              src={URL.createObjectURL(file)}
                              alt={`Screenshot ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFile(index, 'screenshots')}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-3 h-3" />
                          </button>
                          <p className="text-xs text-muted-foreground mt-1 truncate">
                            {file.name}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <p className="text-xs text-muted-foreground mt-2">
                  All uploads will be watermarked for security
                </p>
              </div>

              {/* Videos Upload */}
              <div>
                <Label htmlFor="videos">Upload Videos (Optional)</Label>
                <div 
                  className="mt-2 border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
                  onClick={() => document.getElementById('videos-input')?.click()}
                >
                  <Video className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground mb-1">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Upload gameplay videos (Max 5 videos, 50MB each)
                  </p>
                </div>
                <input
                  id="videos-input"
                  type="file"
                  multiple
                  accept="video/mp4,video/mov,video/webm"
                  onChange={(e) => e.target.files && handleFileUpload(e.target.files, 'videos')}
                  className="hidden"
                />
                
                {/* Video Previews */}
                {videos.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-medium mb-2">Videos ({videos.length}/5)</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {videos.map((file, index) => (
                        <div key={index} className="relative group">
                          <div className="aspect-video rounded-lg overflow-hidden border border-border bg-muted">
                            <video
                              src={URL.createObjectURL(file)}
                              className="w-full h-full object-cover"
                              controls
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFile(index, 'videos')}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-3 h-3" />
                          </button>
                          <div className="mt-1">
                            <p className="text-xs text-muted-foreground truncate">
                              {file.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatFileSize(file.size)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
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
                disabled={!agreed1 || !agreed2 || !agreed3 || isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Uploading... {uploadProgress}%</span>
                  </div>
                ) : (
                  'Submit for Verification'
                )}
              </Button>
              
              {/* Upload Progress Bar */}
              {isLoading && uploadProgress > 0 && (
                <div className="mt-4">
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 text-center">
                    {uploadProgress < 100 ? 'Uploading files...' : 'Processing...'}
                  </p>
                </div>
              )}
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
