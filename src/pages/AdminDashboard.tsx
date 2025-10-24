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
import { Shield, Users, DollarSign, FileText, LogOut, Search, Filter, Download, Edit, Settings, Trash2 } from 'lucide-react';
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
  const navigate = useNavigate();
  
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
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="listings">📋 Listings</TabsTrigger>
            <TabsTrigger value="escrows">💸 Escrows</TabsTrigger>
            <TabsTrigger value="users">👥 Users</TabsTrigger>
            <TabsTrigger value="transactions">🧾 Transactions</TabsTrigger>
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
