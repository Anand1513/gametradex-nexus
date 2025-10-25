import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Shield, Users, DollarSign, FileText, LogOut, Search, Filter, Download, Edit, Settings, Trash2, CheckCircle, Clock, AlertCircle, Image, MessageSquare, Plus, X, Save, Camera, Heart, RefreshCw, Check } from 'lucide-react';
import { toast } from 'sonner';
import LegalDisclaimer from '@/components/LegalDisclaimer';
import EditPriceModal from '@/components/EditPriceModal';
import { updateListingPrice } from '@/api/admin';
import { 
  logAdminLogout, 
  logPriceChange, 
  logListingApproval, 
  logListingDeletion,
  logListingEdit,
  logUserAction,
  logSystemUpdate,
  logEscrowUpdate,
  logPaymentEdit
} from '@/utils/adminLogger';
import { endAdminSession, updateAdminActivity } from '@/utils/adminSessions';
import { NotificationProvider } from '@/contexts/NotificationContext';
import NotificationPanel from '@/components/NotificationPanel';

const AdminDashboard: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isEditPriceModalOpen, setIsEditPriceModalOpen] = useState(false);
  const [selectedListing, setSelectedListing] = useState<any>(null);
  const [adminSession, setAdminSession] = useState<any>(null);
  const [successStories, setSuccessStories] = useState<any[]>([]);
  const [dealLogs, setDealLogs] = useState<any[]>([]);
  const [isSuccessStoriesLoading, setIsSuccessStoriesLoading] = useState(false);
  const [isDealLogsLoading, setIsDealLogsLoading] = useState(false);
  const [editingStory, setEditingStory] = useState<string | null>(null);
  const [editingDeal, setEditingDeal] = useState<string | null>(null);
  const [newCaption, setNewCaption] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [showAddStoryForm, setShowAddStoryForm] = useState(false);
  const [showAddDealForm, setShowAddDealForm] = useState(false);
  const [newStoryCaption, setNewStoryCaption] = useState('');
  const [newDealMessage, setNewDealMessage] = useState('');
  const [newDealDate, setNewDealDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Interests state
  const [interests, setInterests] = useState<any[]>([]);
  const [isInterestsLoading, setIsInterestsLoading] = useState(false);
  
  const navigate = useNavigate();

  // Custom Request interface and state
  interface CustomRequest {
    _id: string;
    title: string;
    game: string;
    budget: {
      min: number;
      max: number;
      currency: string;
    };
    status: 'pending_payment' | 'processing' | 'fulfilled' | 'cancelled' | 'expired';
    customRequestId?: string;
    advancePaid: boolean;
    userId: string;
    userEmail: string;
    createdAt: string;
    expiresAt?: string;
  }

  const [customRequests, setCustomRequests] = useState<CustomRequest[]>([]);
  
  // Dummy data
  const [listings, setListings] = useState([
    { 
      id: '1', 
      title: 'Conqueror Account - 4.2 KD', 
      sellerId: 'seller-123', 
      status: 'open', 
      verified: true, 
      priceMin: 25000, 
      priceMax: 35000, 
      isFixed: false,
      negotiable: true,
      pendingPrice: false,
      createdAt: { toDate: () => new Date() } 
    },
    { 
      id: '2', 
      title: 'Ace Master Account - 3.8 KD', 
      sellerId: 'seller-123', 
      status: 'bidding', 
      verified: false, 
      priceMin: 15000, 
      priceMax: 22000, 
      isFixed: false,
      negotiable: true,
      pendingPrice: false,
      createdAt: { toDate: () => new Date() } 
    },
    { 
      id: '3', 
      title: 'Crown Account - 2.5 KD', 
      sellerId: 'seller-456', 
      status: 'sold', 
      verified: true, 
      priceMin: 8000, 
      priceMax: 12000, 
      isFixed: false,
      negotiable: true,
      pendingPrice: false,
      createdAt: { toDate: () => new Date() } 
    },
    { 
      id: '4', 
      title: 'Platinum Account - 1.8 KD', 
      sellerId: 'seller-789', 
      status: 'open', 
      verified: false, 
      pendingPrice: true,
      createdAt: { toDate: () => new Date() } 
    }
  ]);
  
  const [escrows, setEscrows] = useState([
    { id: '1', buyerId: 'buyer-123', sellerId: 'seller-123', amount: 30000, status: 'pending', createdAt: { toDate: () => new Date() } },
    { id: '2', buyerId: 'buyer-456', sellerId: 'seller-456', amount: 18000, status: 'released', createdAt: { toDate: () => new Date() } },
    { id: '3', buyerId: 'buyer-789', sellerId: 'seller-789', amount: 12000, status: 'refunded', createdAt: { toDate: () => new Date() } }
  ]);
  
  const [users, setUsers] = useState([
    { id: 'admin-123', name: 'Admin User', email: 'admin@gametradex.com', role: 'admin' },
    { id: 'seller-123', name: 'John Seller', email: 'seller@gametradex.com', role: 'seller' },
    { id: 'buyer-123', name: 'Jane Buyer', email: 'buyer@gametradex.com', role: 'buyer' }
  ]);
  
  const [bids, setBids] = useState([
    { id: '1', listingId: '2', bidderId: 'buyer-123', bidAmount: 18000, status: 'active', timestamp: { toDate: () => new Date() } },
    { id: '2', listingId: '2', bidderId: 'buyer-456', bidAmount: 20000, status: 'active', timestamp: { toDate: () => new Date() } }
  ]);
  
  const [supportMessages, setSupportMessages] = useState([
    { id: '1', name: 'Test User', email: 'test@example.com', message: 'I have a question about account verification', status: 'pending', createdAt: { toDate: () => new Date() } }
  ]);

  // Mock custom requests data
  useEffect(() => {
        setCustomRequests([
          {
            _id: 'req-1',
            title: 'Premium Conqueror Account Request',
            game: 'BGMI',
            budget: { min: 20000, max: 30000, currency: 'INR' },
            status: 'processing',
            customRequestId: 'CR-20251025-1289',
            advancePaid: true,
            userId: 'test-user-789',
            userEmail: 'test789@example.com',
            createdAt: '2025-10-25T12:07:09.539Z'
          },
          {
            _id: 'req-2',
            title: 'High-tier Valorant Account',
            game: 'Valorant',
            budget: { min: 150, max: 250, currency: 'USD' },
            status: 'processing',
            customRequestId: 'CR-20251025-2087',
            advancePaid: true,
            userId: 'test-user-dashboard',
            userEmail: 'dashboard@example.com',
            createdAt: '2025-10-25T12:13:42.827Z'
          },
          {
            _id: 'req-3',
            title: 'Fortnite Pro Account',
            game: 'Fortnite',
            budget: { min: 100, max: 200, currency: 'USD' },
            status: 'pending_payment',
            advancePaid: false,
            userId: 'test-user-456',
            userEmail: 'test456@example.com',
            createdAt: '2025-10-24T15:30:00Z',
            expiresAt: '2025-10-31T15:30:00Z'
          },
          {
            _id: 'req-4',
            title: 'Low Budget Request (Invalid)',
            game: 'BGMI',
            budget: { min: 3000, max: 4000, currency: 'INR' },
            status: 'cancelled',
            advancePaid: false,
            userId: 'test-user-low',
            userEmail: 'low@example.com',
            createdAt: '2025-10-24T10:00:00Z',
            expiresAt: '2025-10-31T10:00:00Z'
          }
        ]);
  }, []);

  // Check admin session on component mount
  useEffect(() => {
    const checkAdminSession = () => {
      const session = localStorage.getItem('adminSession');
      if (session) {
        try {
          const sessionData = JSON.parse(session);
          if (sessionData.expiry > Date.now()) {
            setAdminSession(sessionData);
          } else {
            // Session expired
            localStorage.removeItem('adminSession');
            navigate('/admin/login');
          }
        } catch (error) {
          localStorage.removeItem('adminSession');
          navigate('/admin/login');
        }
      } else {
        navigate('/admin/login');
      }
    };

    checkAdminSession();
  }, [navigate]);

  // Update admin activity periodically (every 5 minutes)
  useEffect(() => {
    const activityInterval = setInterval(() => {
      updateAdminActivity();
    }, 5 * 60 * 1000); // 5 minutes

    // Update activity on component mount
    updateAdminActivity();

    return () => {
      clearInterval(activityInterval);
    };
  }, []);

  // Load success stories, deal logs, and interests on component mount
  useEffect(() => {
    fetchSuccessStories();
    fetchDealLogs();
    fetchInterests();
  }, []);

  // Success Stories Management Functions
  const fetchSuccessStories = async () => {
    try {
      setIsSuccessStoriesLoading(true);
      const response = await fetch('/api/success/stories');
      if (response.ok) {
        const data = await response.json();
        setSuccessStories(data);
      } else {
        toast.error('Failed to fetch success stories');
      }
    } catch (error) {
      console.error('Error fetching success stories:', error);
      toast.error('Failed to fetch success stories');
    } finally {
      setIsSuccessStoriesLoading(false);
    }
  };

  const fetchDealLogs = async () => {
    try {
      setIsDealLogsLoading(true);
      const response = await fetch('/api/success/deals');
      if (response.ok) {
        const data = await response.json();
        setDealLogs(data);
      } else {
        toast.error('Failed to fetch deal logs');
      }
    } catch (error) {
      console.error('Error fetching deal logs:', error);
      toast.error('Failed to fetch deal logs');
    } finally {
      setIsDealLogsLoading(false);
    }
  };

  const deleteSuccessStory = async (id: string) => {
    try {
      const response = await fetch(`/api/success/stories/${id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        toast.success('Success story deleted');
        fetchSuccessStories();
      } else {
        toast.error('Failed to delete success story');
      }
    } catch (error) {
      console.error('Error deleting success story:', error);
      toast.error('Failed to delete success story');
    }
  };

  const deleteDealLog = async (id: string) => {
    try {
      const response = await fetch(`/api/success/deals/${id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        toast.success('Deal log deleted');
        fetchDealLogs();
      } else {
        toast.error('Failed to delete deal log');
      }
    } catch (error) {
      console.error('Error deleting deal log:', error);
      toast.error('Failed to delete deal log');
    }
  };

  // Inline editing functions
  const startEditingStory = (story: any) => {
    setEditingStory(story._id);
    setNewCaption(story.caption);
  };

  const startEditingDeal = (deal: any) => {
    setEditingDeal(deal._id);
    setNewMessage(deal.message);
  };

  const saveStoryEdit = async (id: string) => {
    try {
      const response = await fetch(`/api/success/stories/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caption: newCaption })
      });
      if (response.ok) {
        toast.success('Story updated');
        setEditingStory(null);
        fetchSuccessStories();
      } else {
        toast.error('Failed to update story');
      }
    } catch (error) {
      console.error('Error updating story:', error);
      toast.error('Failed to update story');
    }
  };

  const saveDealEdit = async (id: string) => {
    try {
      const response = await fetch(`/api/success/deals/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: newMessage })
      });
      if (response.ok) {
        toast.success('Deal updated');
        setEditingDeal(null);
        fetchDealLogs();
      } else {
        toast.error('Failed to update deal');
      }
    } catch (error) {
      console.error('Error updating deal:', error);
      toast.error('Failed to update deal');
    }
  };

  const cancelEdit = () => {
    setEditingStory(null);
    setEditingDeal(null);
    setNewCaption('');
    setNewMessage('');
  };

  // Add new entry functions
  const addNewStory = async () => {
    if (!newStoryCaption.trim()) {
      toast.error('Caption is required');
      return;
    }
    // Note: Image upload would need to be handled separately
    toast.info('Image upload functionality needs to be implemented');
    setShowAddStoryForm(false);
    setNewStoryCaption('');
  };

  const addNewDeal = async () => {
    if (!newDealMessage.trim()) {
      toast.error('Message is required');
      return;
    }
    try {
      const response = await fetch('/api/success/deals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: newDealMessage,
          date: newDealDate
        })
      });
      if (response.ok) {
        toast.success('Deal added with auto-generated format');
        setShowAddDealForm(false);
        setNewDealMessage('');
        setNewDealDate(new Date().toISOString().split('T')[0]);
        fetchDealLogs();
      } else {
        toast.error('Failed to add deal');
      }
    } catch (error) {
      console.error('Error adding deal:', error);
      toast.error('Failed to add deal');
    }
  };

  // Interests functions
  const fetchInterests = async () => {
    try {
      setIsInterestsLoading(true);
      const response = await fetch('/api/interests');
      if (response.ok) {
        const data = await response.json();
        setInterests(data);
      } else {
        toast.error('Failed to fetch interests');
      }
    } catch (error) {
      console.error('Error fetching interests:', error);
      toast.error('Failed to fetch interests');
    } finally {
      setIsInterestsLoading(false);
    }
  };

  const updateInterestStatus = async (interestId: string, status: string) => {
    try {
      const response = await fetch(`/api/interests/${interestId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (response.ok) {
        toast.success('Interest status updated');
        fetchInterests();
      } else {
        toast.error('Failed to update interest status');
      }
    } catch (error) {
      console.error('Error updating interest status:', error);
      toast.error('Failed to update interest status');
    }
  };

  const deleteInterest = async (interestId: string) => {
    try {
      const response = await fetch(`/api/interests/${interestId}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        toast.success('Interest deleted');
        fetchInterests();
      } else {
        toast.error('Failed to delete interest');
      }
    } catch (error) {
      console.error('Error deleting interest:', error);
      toast.error('Failed to delete interest');
    }
  };

  const handleListingAction = async (id: string, action: 'approve' | 'reject') => {
    // Get admin email for logging
    const adminSession = localStorage.getItem('adminSession');
    let adminEmail = 'unknown';
    if (adminSession) {
      try {
        const session = JSON.parse(adminSession);
        adminEmail = session.email || 'unknown';
      } catch (error) {
        console.error('Error parsing admin session:', error);
      }
    }
    
    // Get listing details before action
    const listingToUpdate = listings.find(listing => listing.id === id);
    const listingDetails = {
      title: listingToUpdate?.title,
      status: listingToUpdate?.status,
      priceMin: listingToUpdate?.priceMin,
      priceMax: listingToUpdate?.priceMax,
      sellerId: listingToUpdate?.sellerId,
      verified: listingToUpdate?.verified
    };
    
    // Log the listing action with detailed before state
    await logListingApproval(id, action, adminEmail, listingDetails);
    
    setListings(prev => prev.map(listing => 
      listing.id === id 
        ? { ...listing, status: action === 'approve' ? 'open' : 'sold', verified: action === 'approve' }
        : listing
    ));
    toast.success(`Listing ${action}d successfully`);
  };

  const handleDeleteListing = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this listing? This action cannot be undone.')) {
      // Get admin email and listing details for logging
      const adminSession = localStorage.getItem('adminSession');
      let adminEmail = 'unknown';
      if (adminSession) {
        try {
          const session = JSON.parse(adminSession);
          adminEmail = session.email || 'unknown';
        } catch (error) {
          console.error('Error parsing admin session:', error);
        }
      }
      
      // Get listing details before deletion
      const listingToDelete = listings.find(listing => listing.id === id);
      const listingTitle = listingToDelete?.title || 'Unknown Listing';
      const listingDetails = {
        title: listingToDelete?.title,
        status: listingToDelete?.status,
        priceMin: listingToDelete?.priceMin,
        priceMax: listingToDelete?.priceMax,
        sellerId: listingToDelete?.sellerId,
        verified: listingToDelete?.verified,
        createdAt: listingToDelete?.createdAt
      };
      
      // Log the deletion with detailed listing info
      await logListingDeletion(id, listingTitle, adminEmail, listingDetails);
      
      setListings(prev => prev.filter(listing => listing.id !== id));
      toast.success('Listing deleted successfully');
    }
  };
  
  const handleEditPrice = (listing: any) => {
    setSelectedListing(listing);
    setIsEditPriceModalOpen(true);
  };
  
  const handlePriceUpdate = async (data: any) => {
    try {
      setIsLoading(true);
      
      // Get admin email for logging
      const adminSession = localStorage.getItem('adminSession');
      let adminEmail = 'unknown';
      if (adminSession) {
        try {
          const session = JSON.parse(adminSession);
          adminEmail = session.email || 'unknown';
        } catch (error) {
          console.error('Error parsing admin session:', error);
        }
      }
      
      // Get old price data for logging
      const oldListing = listings.find(listing => listing.id === data.id);
      const oldPrice = {
        priceMin: oldListing?.priceMin,
        priceMax: oldListing?.priceMax,
        isFixed: oldListing?.isFixed,
        negotiable: oldListing?.negotiable
      };
      
      // Use the admin API service to update price
      const result = await updateListingPrice(data.id, {
        priceMin: data.priceMin,
        priceMax: data.priceMax,
        isFixed: data.isFixed,
        negotiable: data.negotiable
      });
      
      // Log the price change with detailed before/after tracking
      await logPriceChange(data.id, oldPrice, {
        priceMin: data.priceMin,
        priceMax: data.priceMax,
        isFixed: data.isFixed,
        negotiable: data.negotiable
      }, adminEmail, {
        listingTitle: oldListing?.title,
        listingStatus: oldListing?.status,
        sellerId: oldListing?.sellerId,
        changeReason: 'admin_manual_edit',
        priceChangeSummary: {
          oldPriceRange: oldPrice?.isFixed ? 
            `₹${oldPrice.priceMin?.toLocaleString()}` : 
            `₹${oldPrice.priceMin?.toLocaleString()} - ₹${oldPrice.priceMax?.toLocaleString()}`,
          newPriceRange: data.isFixed ? 
            `₹${data.priceMin?.toLocaleString()}` : 
            `₹${data.priceMin?.toLocaleString()} - ₹${data.priceMax?.toLocaleString()}`,
          priceTypeChanged: oldPrice?.isFixed !== data.isFixed,
          negotiableChanged: oldPrice?.negotiable !== data.negotiable
        }
      });
      
      // Update local state with the response data
      setListings(prev => prev.map(listing => 
        listing.id === data.id 
          ? { 
              ...listing, 
              priceMin: result.priceMin,
              priceMax: result.priceMax,
              isFixed: result.isFixed,
              negotiable: result.negotiable,
              pendingPrice: false
            }
          : listing
      ));
      
      toast.success("Price updated successfully");
      setIsEditPriceModalOpen(false); // Close modal after successful update
    } catch (error: any) {
      console.error('Error updating price:', error);
      toast.error(error.message || "Failed to update price. Please try again.");
      
      // Fallback: update local state even if API call fails (for demo purposes)
      setListings(prev => prev.map(listing => 
        listing.id === data.id 
          ? { 
              ...listing, 
              priceMin: data.priceMin,
              priceMax: data.priceMax,
              isFixed: data.isFixed,
              negotiable: data.negotiable,
              pendingPrice: false
            }
          : listing
      ));
    } finally {
      setIsLoading(false);
    }
  };

  const handleEscrowAction = async (id: string, action: 'release' | 'refund') => {
    // Get admin email for logging
    const adminSession = localStorage.getItem('adminSession');
    let adminEmail = 'unknown';
    if (adminSession) {
      try {
        const session = JSON.parse(adminSession);
        adminEmail = session.email || 'unknown';
      } catch (error) {
        console.error('Error parsing admin session:', error);
      }
    }
    
    // Get escrow details before action
    const escrowToUpdate = escrows.find(escrow => escrow.id === id);
    const escrowDetails = {
      escrowId: id,
      listingId: escrowToUpdate?.listingId,
      buyerId: escrowToUpdate?.buyerId,
      sellerId: escrowToUpdate?.sellerId,
      amount: escrowToUpdate?.amount,
      oldStatus: escrowToUpdate?.status,
      newStatus: action === 'release' ? 'released' : 'refunded'
    };
    
    // Log the escrow action
    await logEscrowUpdate(id, action.toUpperCase(), {
      ...escrowDetails,
      actionDetails: {
        action,
        escrowId: id,
        listingId: escrowToUpdate?.listingId,
        amount: escrowToUpdate?.amount,
        oldStatus: escrowToUpdate?.status,
        newStatus: action === 'release' ? 'released' : 'refunded',
        actionReason: 'admin_manual_action'
      }
    }, adminEmail);
    
    setEscrows(prev => prev.map(escrow => 
      escrow.id === id 
        ? { ...escrow, status: action === 'release' ? 'released' : 'refunded' }
        : escrow
    ));
    toast.success(`Payment ${action}d successfully`);
  };

  const handleUserRoleUpdate = async (userId: string, newRole: 'admin' | 'seller' | 'buyer') => {
    // Get admin email for logging
    const adminSession = localStorage.getItem('adminSession');
    let adminEmail = 'unknown';
    if (adminSession) {
      try {
        const session = JSON.parse(adminSession);
        adminEmail = session.email || 'unknown';
      } catch (error) {
        console.error('Error parsing admin session:', error);
      }
    }
    
    // Get user details before change
    const userToUpdate = users.find(user => user.id === userId);
    const oldRole = userToUpdate?.role;
    const userDetails = {
      userId,
      userName: userToUpdate?.name,
      userEmail: userToUpdate?.email,
      oldRole,
      newRole
    };
    
    // Log the user role change
    await logUserAction(userId, 'ROLE_CHANGE', {
      ...userDetails,
      changeDetails: {
        oldRole,
        newRole,
        userName: userToUpdate?.name,
        userEmail: userToUpdate?.email,
        changeReason: 'admin_manual_change'
      }
    }, adminEmail);
    
    setUsers(prev => prev.map(user => 
      user.id === userId 
        ? { ...user, role: newRole }
        : user
    ));
    toast.success('User role updated successfully');
  };

  const handleLogout = async () => {
    // Get admin email before clearing session
    const adminSession = localStorage.getItem('adminSession');
    let adminEmail = 'unknown';
    if (adminSession) {
      try {
        const session = JSON.parse(adminSession);
        adminEmail = session.email || 'unknown';
      } catch (error) {
        console.error('Error parsing admin session:', error);
      }
    }
    
    // End admin session
    await endAdminSession();
    
    // Log admin logout action
    await logAdminLogout(adminEmail);
    
    localStorage.removeItem('adminSession');
    localStorage.removeItem('dummyAuthToken');
    toast.success('Logged out successfully');
    navigate('/admin/login');
  };

  const handleMarkFulfilled = async (requestId: string) => {
    try {
      setIsLoading(true);
      
      // Get admin session data
      const adminSession = localStorage.getItem('adminSession');
      const sessionData = adminSession ? JSON.parse(adminSession) : null;
      
      // Call backend API to mark as fulfilled
      const response = await fetch(`http://localhost:3001/api/admin/custom-requests/${requestId}/fulfill`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          adminEmail: sessionData?.email || 'admin@example.com',
          adminId: sessionData?.adminId || 'admin-123'
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Update the local state
        setCustomRequests(prev => 
          prev.map(req => 
            req._id === requestId 
              ? { ...req, status: 'fulfilled' as const }
              : req
          )
        );
        
        toast.success('Custom request marked as fulfilled. User has been notified.');
      } else {
        toast.error(result.message || 'Failed to mark request as fulfilled');
      }
    } catch (error) {
      console.error('Error marking request as fulfilled:', error);
      toast.error('Failed to mark request as fulfilled');
    } finally {
      setIsLoading(false);
    }
  };

  if (!adminSession) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <NotificationProvider>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-primary mb-2">Admin Dashboard</h1>
            <p className="text-muted-foreground">Secure admin panel - {adminSession.loginMethod} login</p>
          </div>
          <div className="flex items-center space-x-4">
            <Button 
              onClick={() => navigate('/admin/activity')} 
              className="bg-green-600 hover:bg-green-700 text-white flex items-center"
            >
              <Shield className="w-4 h-4 mr-2" />
              Verify Integrity
            </Button>
            <NotificationPanel />
            <Button onClick={handleLogout} variant="outline" className="flex items-center">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="card-glow">
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <FileText className="w-8 h-8 text-primary" />
                <div>
                  <p className="text-2xl font-bold">{listings.length}</p>
                  <p className="text-sm text-muted-foreground">Total Listings</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-glow">
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <DollarSign className="w-8 h-8 text-primary" />
                <div>
                  <p className="text-2xl font-bold">
                    ₹{escrows.reduce((sum, escrow) => sum + (escrow.amount || 0), 0).toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground">Total Volume</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-glow">
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Users className="w-8 h-8 text-primary" />
                <div>
                  <p className="text-2xl font-bold">{users.length}</p>
                  <p className="text-sm text-muted-foreground">Total Users</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-glow">
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Shield className="w-8 h-8 text-primary" />
                <div>
                  <p className="text-2xl font-bold">
                    {listings.filter(l => l.verified).length}
                  </p>
                  <p className="text-sm text-muted-foreground">Verified Listings</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="listings" className="space-y-6">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="listings">📋 Listings</TabsTrigger>
            <TabsTrigger value="escrows">💸 Escrows</TabsTrigger>
            <TabsTrigger value="users">👥 Users</TabsTrigger>
            <TabsTrigger value="transactions">🧾 Transactions</TabsTrigger>
            <TabsTrigger value="custom-requests">🎯 Custom Requests</TabsTrigger>
            <TabsTrigger value="interests">❤️ Interests</TabsTrigger>
            <TabsTrigger value="success-stories">⭐ Success Stories</TabsTrigger>
          </TabsList>

          {/* Listings Management */}
          <TabsContent value="listings">
            <Card className="card-glow">
              <CardHeader>
                <CardTitle>Listings Management</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>Seller</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Verified</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                  </TableHeader>
                  <TableBody>
                    {listings.map((listing) => (
                      <TableRow key={listing.id}>
                        <TableCell className="font-mono text-xs">{listing.id?.slice(0, 8)}...</TableCell>
                        <TableCell>{listing.title}</TableCell>
                        <TableCell className="font-mono text-xs">{listing.sellerId?.slice(0, 8)}...</TableCell>
                        <TableCell>
                          <Badge 
                            className={
                              listing.status === 'open' ? 'bg-green-500/20 text-green-500' :
                              listing.status === 'sold' ? 'bg-red-500/20 text-red-500' :
                              'bg-yellow-500/20 text-yellow-500'
                            }
                          >
                            {listing.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            className={
                              listing.verified ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'
                            }
                          >
                            {listing.verified ? 'Verified' : 'Pending'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {listing.pendingPrice ? (
                            <span className="text-amber-500 font-medium">Pending Price</span>
                          ) : listing.isFixed ? (
                            <span>₹{listing.priceMin?.toLocaleString()}</span>
                          ) : (
                            <span>₹{listing.priceMin?.toLocaleString()} - ₹{listing.priceMax?.toLocaleString()}</span>
                          )}
                          {!listing.pendingPrice && listing.negotiable && (
                            <span className="ml-2 text-xs text-gray-500">(Negotiable)</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {listing.createdAt?.toDate?.()?.toLocaleDateString() || 'N/A'}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-2">
                            {/* Approve/Reject buttons for unverified listings */}
                            {!listing.verified && (
                              <>
                                <Button 
                                  size="sm" 
                                  onClick={() => handleListingAction(listing.id, 'approve')}
                                  className="bg-green-500 hover:bg-green-600 text-white"
                                >
                                  Approve
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="destructive"
                                  onClick={() => handleListingAction(listing.id, 'reject')}
                                >
                                  Reject
                                </Button>
                              </>
                            )}
                            
                            {/* Edit Price button */}
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleEditPrice(listing)}
                              className="flex items-center"
                              disabled={isLoading}
                            >
                              <Edit className="w-3 h-3 mr-1" />
                              {isLoading ? "Updating..." : (listing.pendingPrice ? "Set Price" : "Edit Price")}
                            </Button>
                            
                            {/* View button */}
                            <Button size="sm" variant="outline">
                              View
                            </Button>
                            
                            {/* Delete button */}
                            <Button 
                              size="sm" 
                              variant="destructive"
                              onClick={() => handleDeleteListing(listing.id)}
                              className="flex items-center"
                            >
                              <Trash2 className="w-3 h-3 mr-1" />
                              Delete
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Escrows Management */}
          <TabsContent value="escrows">
            <Card className="card-glow">
              <CardHeader>
                <CardTitle>Escrows & Bids</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Buyer</TableHead>
                      <TableHead>Seller</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {escrows.map((escrow) => (
                      <TableRow key={escrow.id}>
                        <TableCell className="font-mono text-xs">{escrow.id?.slice(0, 8)}...</TableCell>
                        <TableCell className="font-mono text-xs">{escrow.buyerId?.slice(0, 8)}...</TableCell>
                        <TableCell className="font-mono text-xs">{escrow.sellerId?.slice(0, 8)}...</TableCell>
                        <TableCell>₹{escrow.amount?.toLocaleString() || 0}</TableCell>
                        <TableCell>
                          <Badge 
                            className={
                              escrow.status === 'released' ? 'bg-green-500/20 text-green-500' :
                              escrow.status === 'refunded' ? 'bg-red-500/20 text-red-500' :
                              'bg-yellow-500/20 text-yellow-500'
                            }
                          >
                            {escrow.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {escrow.createdAt?.toDate?.()?.toLocaleDateString() || 'N/A'}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            {escrow.status === 'pending' && (
                              <>
                                <Button 
                                  size="sm" 
                                  onClick={() => handleEscrowAction(escrow.id, 'release')}
                                  className="bg-green-500 hover:bg-green-600"
                                >
                                  Release
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="destructive"
                                  onClick={() => handleEscrowAction(escrow.id, 'refund')}
                                >
                                  Refund
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Management */}
          <TabsContent value="users">
            <Card className="card-glow">
              <CardHeader>
                <CardTitle>Users Management</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-mono text-xs">{user.id?.slice(0, 8)}...</TableCell>
                        <TableCell>{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge 
                            className={
                              user.role === 'admin' ? 'bg-primary/20 text-primary' : 
                              user.role === 'seller' ? 'bg-blue-500/20 text-blue-500' :
                              'bg-muted/20 text-muted-foreground'
                            }
                          >
                            {user.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-green-500/20 text-green-500">
                            Active
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Select onValueChange={(value) => handleUserRoleUpdate(user.id, value as any)}>
                              <SelectTrigger className="w-24">
                                <SelectValue placeholder="Role" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="buyer">Buyer</SelectItem>
                                <SelectItem value="seller">Seller</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Transactions */}
          <TabsContent value="transactions">
            <Card className="card-glow">
              <CardHeader>
                <CardTitle>Transaction Export</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <Select>
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Select date range" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="last7days">Last 7 days</SelectItem>
                        <SelectItem value="last30days">Last 30 days</SelectItem>
                        <SelectItem value="last90days">Last 90 days</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button className="btn-primary">
                      Export CSV
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Export transaction data for accounting and reporting purposes.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Custom Requests Management */}
          <TabsContent value="custom-requests">
            <Card className="card-glow">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="w-5 h-5 mr-2" />
                  Custom Requests Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Request ID</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Game</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Budget</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customRequests.map((request) => (
                      <TableRow key={request._id}>
                        <TableCell className="font-mono text-sm">
                          {request.customRequestId || 'Pending'}
                        </TableCell>
                        <TableCell className="font-medium">{request.title}</TableCell>
                        <TableCell>{request.game}</TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{request.userEmail}</div>
                            <div className="text-sm text-muted-foreground">{request.userId}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {request.budget.currency} {request.budget.min.toLocaleString()} - {request.budget.max.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Badge className={
                            request.status === 'fulfilled' ? 'bg-green-500' :
                            request.status === 'processing' ? 'bg-yellow-500' :
                            request.status === 'pending_payment' ? 'bg-orange-500' :
                            'bg-red-500'
                          }>
                            {request.status.replace('_', ' ').toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(request.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            {request.status === 'processing' && (
                              <Button
                                size="sm"
                                className="bg-green-600 hover:bg-green-700"
                                onClick={() => handleMarkFulfilled(request._id)}
                                disabled={isLoading}
                              >
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Mark Fulfilled
                              </Button>
                            )}
                            {request.status === 'fulfilled' && (
                              <Badge className="bg-green-100 text-green-800">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Completed
                              </Badge>
                            )}
                            {request.status === 'pending_payment' && (
                              <Badge className="bg-orange-100 text-orange-800">
                                <Clock className="w-3 h-3 mr-1" />
                                Awaiting Payment
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                
                {customRequests.length === 0 && (
                  <div className="text-center py-8">
                    <Shield className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Custom Requests</h3>
                    <p className="text-muted-foreground">
                      No custom requests have been submitted yet.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Interests Management */}
          <TabsContent value="interests">
            <Card className="card-glow">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center">
                    <Heart className="w-5 h-5 mr-2" />
                    User Interests
                  </CardTitle>
                  <Button onClick={fetchInterests} disabled={isInterestsLoading} variant="outline">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {isInterestsLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="text-muted-foreground mt-2">Loading interests...</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {interests.length > 0 ? (
                      interests.map((interest) => (
                        <Card key={interest._id} className="border border-border hover:border-primary/50 transition-colors">
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start mb-3">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <Badge variant={interest.status === 'pending' ? 'destructive' : interest.status === 'contacted' ? 'default' : 'secondary'}>
                                    {interest.status}
                                  </Badge>
                                  <span className="text-sm text-muted-foreground">
                                    {new Date(interest.timestamp).toLocaleString()}
                                  </span>
                                </div>
                                <h4 className="font-semibold text-lg mb-1">{interest.listingTitle}</h4>
                                <p className="text-primary font-medium mb-2">{interest.listingPrice}</p>
                                <div className="text-sm text-muted-foreground">
                                  <p><strong>User:</strong> {interest.userName}</p>
                                  <p><strong>Email:</strong> {interest.userEmail}</p>
                                  <p><strong>Phone:</strong> {interest.userPhone || 'Not provided'}</p>
                                  <p><strong>Listing ID:</strong> {interest.listingId}</p>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                {interest.status === 'pending' && (
                                  <Button
                                    size="sm"
                                    onClick={() => updateInterestStatus(interest._id, 'contacted')}
                                    className="bg-green-500 hover:bg-green-600"
                                  >
                                    <Check className="w-4 h-4 mr-1" />
                                    Mark Contacted
                                  </Button>
                                )}
                                {interest.status === 'contacted' && (
                                  <Button
                                    size="sm"
                                    onClick={() => updateInterestStatus(interest._id, 'closed')}
                                    variant="outline"
                                  >
                                    <X className="w-4 h-4 mr-1" />
                                    Close
                                  </Button>
                                )}
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => deleteInterest(interest._id)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <Heart className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No Interests Yet</h3>
                        <p className="text-muted-foreground">
                          No users have shown interest in any listings yet.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Success Stories Management */}
          <TabsContent value="success-stories">
            <div className="space-y-6">
              <Tabs defaultValue="screenshots" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="screenshots" className="flex items-center">
                    <Camera className="w-4 h-4 mr-2" />
                    📸 Screenshots
                  </TabsTrigger>
                  <TabsTrigger value="deals" className="flex items-center">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    📝 Recent Deals
                  </TabsTrigger>
                  <TabsTrigger value="carousel" className="flex items-center">
                    <Image className="w-4 h-4 mr-2" />
                    🎠 Homepage Carousel
                  </TabsTrigger>
                </TabsList>

                {/* Screenshots Subtab */}
                <TabsContent value="screenshots">
                  <Card className="card-glow">
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <CardTitle className="flex items-center">
                          <Image className="w-5 h-5 mr-2" />
                          Success Stories Screenshots
                        </CardTitle>
                        <div className="flex gap-2">
                          <Button 
                            onClick={() => setShowAddStoryForm(!showAddStoryForm)}
                            className="bg-primary hover:bg-primary/90"
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Screenshot
                          </Button>
                          <Button onClick={fetchSuccessStories} disabled={isSuccessStoriesLoading} variant="outline">
                            <Plus className="w-4 h-4 mr-2" />
                            Refresh
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {/* Add New Story Form */}
                      {showAddStoryForm && (
                        <Card className="mb-6 border-primary/20 bg-primary/5">
                          <CardContent className="p-4">
                            <h4 className="font-semibold mb-3">Add New Success Story</h4>
                            <div className="space-y-3">
                              <div>
                                <Label htmlFor="story-caption">Caption</Label>
                                <Input
                                  id="story-caption"
                                  value={newStoryCaption}
                                  onChange={(e) => setNewStoryCaption(e.target.value)}
                                  placeholder="Enter success story caption..."
                                />
                              </div>
                              <div className="flex gap-2">
                                <Button onClick={addNewStory} size="sm">
                                  <Save className="w-4 h-4 mr-2" />
                                  Add Story
                                </Button>
                                <Button onClick={() => setShowAddStoryForm(false)} variant="outline" size="sm">
                                  <X className="w-4 h-4 mr-2" />
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )}
                      
                      {isSuccessStoriesLoading ? (
                        <div className="text-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                          <p className="text-muted-foreground mt-2">Loading success stories...</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {successStories.map((story) => (
                            <div key={story._id} className="border border-border rounded-lg p-4 hover:border-primary/50 transition-colors">
                              <div className="aspect-video bg-muted rounded-lg mb-3 overflow-hidden">
                                <img 
                                  src={story.imageUrl} 
                                  alt={story.caption}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              
                              {editingStory === story._id ? (
                                <div className="space-y-2">
                                  <Input
                                    value={newCaption}
                                    onChange={(e) => setNewCaption(e.target.value)}
                                    placeholder="Edit caption..."
                                  />
                                  <div className="flex gap-2">
                                    <Button onClick={() => saveStoryEdit(story._id)} size="sm">
                                      <Save className="w-4 h-4 mr-1" />
                                      Save
                                    </Button>
                                    <Button onClick={cancelEdit} variant="outline" size="sm">
                                      <X className="w-4 h-4 mr-1" />
                                      Cancel
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <>
                                  <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{story.caption}</p>
                                  <div className="flex justify-between items-center">
                                    <span className="text-xs text-muted-foreground">
                                      {new Date(story.createdAt).toLocaleDateString()}
                                    </span>
                                    <div className="flex gap-1">
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => startEditingStory(story)}
                                      >
                                        <Edit className="w-4 h-4" />
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="destructive"
                                        onClick={() => deleteSuccessStory(story._id)}
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </Button>
                                    </div>
                                  </div>
                                </>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {successStories.length === 0 && !isSuccessStoriesLoading && (
                        <div className="text-center py-8">
                          <Image className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                          <h3 className="text-lg font-semibold mb-2">No Success Stories</h3>
                          <p className="text-muted-foreground">
                            No success story screenshots have been uploaded yet.
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Recent Deals Subtab */}
                <TabsContent value="deals">
                  <Card className="card-glow">
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <CardTitle className="flex items-center">
                          <MessageSquare className="w-5 h-5 mr-2" />
                          Recent Deals
                        </CardTitle>
                        <div className="flex gap-2">
                          <Button 
                            onClick={() => setShowAddDealForm(!showAddDealForm)}
                            className="bg-primary hover:bg-primary/90"
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Deal
                          </Button>
                          <Button onClick={fetchDealLogs} disabled={isDealLogsLoading} variant="outline">
                            <Plus className="w-4 h-4 mr-2" />
                            Refresh
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {/* Add New Deal Form */}
                      {showAddDealForm && (
                        <Card className="mb-6 border-primary/20 bg-primary/5">
                          <CardContent className="p-4">
                            <h4 className="font-semibold mb-3">Add New Deal</h4>
                            <div className="space-y-3">
                              <div>
                                <Label htmlFor="deal-message">Deal Message</Label>
                                <Input
                                  id="deal-message"
                                  value={newDealMessage}
                                  onChange={(e) => setNewDealMessage(e.target.value)}
                                  placeholder="Enter deal message (format will be auto-generated)..."
                                />
                                <p className="text-xs text-muted-foreground mt-1">
                                  Format: ✅ {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} — Your message 🎉
                                </p>
                              </div>
                              <div>
                                <Label htmlFor="deal-date">Date</Label>
                                <Input
                                  id="deal-date"
                                  type="date"
                                  value={newDealDate}
                                  onChange={(e) => setNewDealDate(e.target.value)}
                                />
                              </div>
                              <div className="flex gap-2">
                                <Button onClick={addNewDeal} size="sm">
                                  <Save className="w-4 h-4 mr-2" />
                                  Add Deal
                                </Button>
                                <Button onClick={() => setShowAddDealForm(false)} variant="outline" size="sm">
                                  <X className="w-4 h-4 mr-2" />
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )}
                      
                      {isDealLogsLoading ? (
                        <div className="text-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                          <p className="text-muted-foreground mt-2">Loading deal logs...</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {dealLogs.map((deal) => (
                            <div key={deal._id} className="border border-border rounded-lg p-4 hover:border-primary/50 transition-colors">
                              {editingDeal === deal._id ? (
                                <div className="space-y-3">
                                  <Input
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Edit deal message..."
                                  />
                                  <div className="flex gap-2">
                                    <Button onClick={() => saveDealEdit(deal._id)} size="sm">
                                      <Save className="w-4 h-4 mr-1" />
                                      Save
                                    </Button>
                                    <Button onClick={cancelEdit} variant="outline" size="sm">
                                      <X className="w-4 h-4 mr-1" />
                                      Cancel
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex justify-between items-start">
                                  <div className="flex-1">
                                    <p className="text-sm mb-2">{deal.message}</p>
                                    <span className="text-xs text-muted-foreground">
                                      {new Date(deal.date).toLocaleDateString()}
                                    </span>
                                  </div>
                                  <div className="flex gap-1">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => startEditingDeal(deal)}
                                    >
                                      <Edit className="w-4 h-4" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="destructive"
                                      onClick={() => deleteDealLog(deal._id)}
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {dealLogs.length === 0 && !isDealLogsLoading && (
                        <div className="text-center py-8">
                          <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                          <h3 className="text-lg font-semibold mb-2">No Deal Logs</h3>
                          <p className="text-muted-foreground">
                            No recent deals have been logged yet.
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Homepage Carousel Subtab */}
                <TabsContent value="carousel">
                  <Card className="card-glow">
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <CardTitle className="flex items-center">
                          <Image className="w-5 h-5 mr-2" />
                          Homepage Carousel Photos
                        </CardTitle>
                        <div className="flex gap-2">
                          <Button 
                            onClick={() => setShowAddStoryForm(!showAddStoryForm)}
                            className="bg-primary hover:bg-primary/90"
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Carousel Photo
                          </Button>
                          <Button onClick={fetchSuccessStories} disabled={isSuccessStoriesLoading} variant="outline">
                            <Plus className="w-4 h-4 mr-2" />
                            Refresh
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {/* Add New Carousel Photo Form */}
                      {showAddStoryForm && (
                        <Card className="mb-6 border-primary/20 bg-primary/5">
                          <CardContent className="p-4">
                            <h4 className="font-semibold mb-3">Add New Carousel Photo</h4>
                            <div className="space-y-3">
                              <div>
                                <Label htmlFor="carousel-caption">Caption</Label>
                                <Input
                                  id="carousel-caption"
                                  value={newStoryCaption}
                                  onChange={(e) => setNewStoryCaption(e.target.value)}
                                  placeholder="Enter carousel photo caption..."
                                />
                                <p className="text-xs text-muted-foreground mt-1">
                                  This photo will appear in the homepage continuous loop carousel
                                </p>
                              </div>
                              <div className="flex gap-2">
                                <Button onClick={addNewStory} size="sm">
                                  <Save className="w-4 h-4 mr-2" />
                                  Add Photo
                                </Button>
                                <Button onClick={() => setShowAddStoryForm(false)} variant="outline" size="sm">
                                  <X className="w-4 h-4 mr-2" />
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )}
                      
                      {isSuccessStoriesLoading ? (
                        <div className="text-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                          <p className="text-muted-foreground mt-2">Loading carousel photos...</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {successStories.map((story) => (
                            <div key={story._id} className="border border-border rounded-lg p-4 hover:border-primary/50 transition-colors">
                              <div className="aspect-video bg-muted rounded-lg mb-3 overflow-hidden">
                                <img 
                                  src={story.imageUrl} 
                                  alt={story.caption}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              
                              {editingStory === story._id ? (
                                <div className="space-y-2">
                                  <Input
                                    value={newCaption}
                                    onChange={(e) => setNewCaption(e.target.value)}
                                    placeholder="Edit caption..."
                                  />
                                  <div className="flex gap-2">
                                    <Button onClick={() => saveStoryEdit(story._id)} size="sm">
                                      <Save className="w-4 h-4 mr-1" />
                                      Save
                                    </Button>
                                    <Button onClick={cancelEdit} variant="outline" size="sm">
                                      <X className="w-4 h-4 mr-1" />
                                      Cancel
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <>
                                  <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{story.caption}</p>
                                  <div className="flex justify-between items-center">
                                    <span className="text-xs text-muted-foreground">
                                      {new Date(story.createdAt).toLocaleDateString()}
                                    </span>
                                    <div className="flex gap-1">
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => startEditingStory(story)}
                                      >
                                        <Edit className="w-4 h-4" />
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="destructive"
                                        onClick={() => deleteSuccessStory(story._id)}
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </Button>
                                    </div>
                                  </div>
                                </>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {successStories.length === 0 && !isSuccessStoriesLoading && (
                        <div className="text-center py-8">
                          <Image className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                          <h3 className="text-lg font-semibold mb-2">No Carousel Photos</h3>
                          <p className="text-muted-foreground">
                            No carousel photos have been uploaded yet. Add photos to see them in the homepage continuous loop.
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </TabsContent>
        </Tabs>

        {/* Legal Disclaimer */}
        <div className="mt-8">
          <LegalDisclaimer />
        </div>
      </div>
      
      {/* Edit Price Modal */}
      {selectedListing && (
        <EditPriceModal
          isOpen={isEditPriceModalOpen}
          onClose={() => setIsEditPriceModalOpen(false)}
          onSubmit={handlePriceUpdate}
          listing={selectedListing}
          isLoading={isLoading}
        />
      )}
      </div>
    </NotificationProvider>
  );
};

export default AdminDashboard;
