import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  User, 
  ShoppingCart, 
  Package, 
  TrendingUp, 
  DollarSign, 
  Star, 
  Eye, 
  Heart, 
  MessageSquare,
  Plus,
  ExternalLink,
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
  Bell,
  BellRing,
  Check,
  X,
  UserCheck,
  Store,
  ShoppingBag
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface UserStats {
  listedCount: number;
  boughtCount: number;
  totalSpent: number;
  totalEarned: number;
  rating: number;
  reviewCount: number;
}

interface Listing {
  _id: string;
  title: string;
  game: string;
  platform: string;
  price: {
    min: number;
    max: number;
    currency: string;
  };
  status: string;
  stats: {
    views: number;
    favorites: number;
    inquiries: number;
  };
  createdAt: string;
}

interface Purchase {
  _id: string;
  listingId: string;
  listingTitle: string;
  amount: number;
  currency: string;
  status: string;
  sellerEmail: string;
  createdAt: string;
  deliveryDetails: {
    method: string;
    instructions: string;
    deliveredAt?: string;
    receivedAt?: string;
  };
}

interface Activity {
  _id: string;
  type: string;
  title: string;
  description: string;
  timestamp: string;
  status: string;
}

const Dashboard: React.FC = () => {
  const { user, userData } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [userStats, setUserStats] = useState<UserStats>({
    listedCount: 0,
    boughtCount: 0,
    totalSpent: 0,
    totalEarned: 0,
    rating: 0,
    reviewCount: 0
  });
  const [listings, setListings] = useState<Listing[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(null);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [currentRole, setCurrentRole] = useState<'buyer' | 'seller' | 'both'>('both');

  // Mock data for demonstration
  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      
      // Simulate API calls
      setTimeout(() => {
        setUserStats({
          listedCount: 5,
          boughtCount: 3,
          totalSpent: 450,
          totalEarned: 1200,
          rating: 4.8,
          reviewCount: 12
        });

        setListings([
          {
            _id: '1',
            title: 'Conqueror Account - Season 12',
            game: 'BGMI',
            platform: 'Mobile',
            price: { min: 20000, max: 30000, currency: 'INR' },
            status: 'approved',
            stats: { views: 50, favorites: 5, inquiries: 2 },
            createdAt: '2025-10-20T10:00:00Z'
          },
          {
            _id: '2',
            title: 'Radiant Account - Act 3',
            game: 'Valorant',
            platform: 'PC',
            price: { min: 300, max: 400, currency: 'USD' },
            status: 'pending',
            stats: { views: 25, favorites: 3, inquiries: 1 },
            createdAt: '2025-10-22T14:30:00Z'
          }
        ]);

        setPurchases([
          {
            _id: 'purchase-1',
            listingId: '3',
            listingTitle: 'CS:GO Global Elite Account',
            amount: 250,
            currency: 'USD',
            status: 'delivered',
            sellerEmail: 'seller@example.com',
            createdAt: '2025-10-18T09:15:00Z',
            deliveryDetails: {
              method: 'email',
              instructions: 'Account details sent via email',
              deliveredAt: '2025-10-19T10:00:00Z'
            }
          },
          {
            _id: 'purchase-2',
            listingId: '4',
            listingTitle: 'Apex Legends Predator Account',
            amount: 180,
            currency: 'USD',
            status: 'paid',
            sellerEmail: 'seller2@example.com',
            createdAt: '2025-10-23T16:45:00Z',
            deliveryDetails: {
              method: 'email',
              instructions: 'Waiting for delivery'
            }
          }
        ]);

        setActivities([
          {
            _id: 'activity-1',
            type: 'listing_created',
            title: 'Listing Created',
            description: 'Premium Fortnite Account - 200+ Wins',
            timestamp: '2025-10-20T10:00:00Z',
            status: 'success'
          },
          {
            _id: 'activity-2',
            type: 'purchase_completed',
            title: 'Purchase Completed',
            description: 'CS:GO Global Elite Account - $250',
            timestamp: '2025-10-19T10:00:00Z',
            status: 'success'
          },
          {
            _id: 'activity-3',
            type: 'listing_pending',
            title: 'Listing Pending Review',
            description: 'Valorant Radiant Account',
            timestamp: '2025-10-22T14:30:00Z',
            status: 'pending'
          }
        ]);

        setLoading(false);
      }, 1000);
    };

    loadDashboardData();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
      case 'completed':
      case 'delivered':
        return 'bg-green-500';
      case 'pending':
        return 'bg-yellow-500';
      case 'rejected':
      case 'cancelled':
        return 'bg-red-500';
      case 'paid':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
      case 'completed':
      case 'delivered':
        return <CheckCircle className="w-4 h-4" />;
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'rejected':
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      case 'paid':
        return <DollarSign className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const formatDate = (dateString: string | Date) => {
    const date = dateString instanceof Date ? dateString : new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Handler functions
  const handleViewListing = (listingId: string) => {
    navigate(`/listing/${listingId}`);
  };

  const handleViewPurchaseDetails = (purchase: Purchase) => {
    setSelectedPurchase(purchase);
    setShowPurchaseModal(true);
  };

  const handleConfirmReceipt = async (purchaseId: string) => {
    try {
      // Here you would call the API to confirm receipt
      console.log('Confirming receipt for purchase:', purchaseId);
      
      // Update local state
      setPurchases(prev => 
        prev.map(purchase => 
          purchase._id === purchaseId 
            ? { ...purchase, status: 'completed' }
            : purchase
        )
      );
      
      toast.success('Receipt confirmed successfully!');
    } catch (error) {
      console.error('Error confirming receipt:', error);
      toast.error('Failed to confirm receipt. Please try again.');
    }
  };

  const handleRoleChange = (newRole: 'buyer' | 'seller' | 'both') => {
    setCurrentRole(newRole);
    toast.success(`Role changed to ${newRole === 'both' ? 'Buyer & Seller' : newRole.charAt(0).toUpperCase() + newRole.slice(1)}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-primary mb-2">My Dashboard</h1>
            <p className="text-muted-foreground">Welcome back, {userData?.username || 'User'}!</p>
          </div>
          <div className="flex items-center space-x-4">
            {/* Role Selector */}
            <div className="flex items-center space-x-2">
              <UserCheck className="w-4 h-4 text-muted-foreground" />
              <Select value={currentRole} onValueChange={handleRoleChange}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="both">
                    <div className="flex items-center">
                      <UserCheck className="w-4 h-4 mr-2" />
                      Buyer & Seller
                    </div>
                  </SelectItem>
                  <SelectItem value="buyer">
                    <div className="flex items-center">
                      <ShoppingBag className="w-4 h-4 mr-2" />
                      Buyer Only
                    </div>
                  </SelectItem>
                  <SelectItem value="seller">
                    <div className="flex items-center">
                      <Store className="w-4 h-4 mr-2" />
                      Seller Only
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={() => navigate('/sell')} className="bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              Create Listing
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-primary/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Listings</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userStats.listedCount}</div>
              <p className="text-xs text-muted-foreground">Active listings</p>
            </CardContent>
          </Card>

          <Card className="border-primary/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Purchases</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userStats.boughtCount}</div>
              <p className="text-xs text-muted-foreground">Total purchases</p>
            </CardContent>
          </Card>

          <Card className="border-primary/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(userStats.totalSpent)}</div>
              <p className="text-xs text-muted-foreground">All time spending</p>
            </CardContent>
          </Card>

          <Card className="border-primary/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Earned</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(userStats.totalEarned)}</div>
              <p className="text-xs text-muted-foreground">From sales</p>
            </CardContent>
          </Card>
        </div>

        {/* Rating Card */}
        <Card className="mb-8 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Star className="w-5 h-5 mr-2 text-yellow-500" />
              Your Rating
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <div className="text-3xl font-bold">{userStats.rating}</div>
              <div className="flex items-center space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      i < Math.floor(userStats.rating)
                        ? 'text-yellow-500 fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <div className="text-sm text-muted-foreground">
                ({userStats.reviewCount} reviews)
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Role Status Card */}
        <Card className="mb-8 border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-primary/20 rounded-full">
                  {currentRole === 'both' ? (
                    <UserCheck className="w-6 h-6 text-primary" />
                  ) : currentRole === 'buyer' ? (
                    <ShoppingBag className="w-6 h-6 text-primary" />
                  ) : (
                    <Store className="w-6 h-6 text-primary" />
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-semibold">
                    Current Role: {currentRole === 'both' ? 'Buyer & Seller' : currentRole.charAt(0).toUpperCase() + currentRole.slice(1)}
                  </h3>
                  <p className="text-muted-foreground">
                    {currentRole === 'both' 
                      ? 'You can both buy and sell accounts on GameTradeX'
                      : currentRole === 'buyer'
                      ? 'You can browse and purchase accounts'
                      : 'You can create and manage your listings'
                    }
                  </p>
                </div>
              </div>
              <div className="flex space-x-2">
                {currentRole === 'both' || currentRole === 'buyer' ? (
                  <Button 
                    variant="outline" 
                    onClick={() => navigate('/browse')}
                    className="border-primary/20 hover:bg-primary/10"
                  >
                    <ShoppingBag className="w-4 h-4 mr-2" />
                    Browse Accounts
                  </Button>
                ) : null}
                {currentRole === 'both' || currentRole === 'seller' ? (
                  <Button 
                    onClick={() => navigate('/sell')}
                    className="bg-primary hover:bg-primary/90"
                  >
                    <Store className="w-4 h-4 mr-2" />
                    Create Listing
                  </Button>
                ) : null}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notifications Section */}
        {unreadCount > 0 && (
          <Card className="mb-6 border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <BellRing className="w-5 h-5 text-primary" />
                  <span>Notifications</span>
                  <Badge variant="destructive">{unreadCount}</Badge>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => markAllAsRead()}
                  className="text-xs"
                >
                  <Check className="w-4 h-4 mr-1" />
                  Mark All Read
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-32">
                <div className="space-y-2">
                  {notifications.slice(0, 5).map((notification) => (
                    <div
                      key={notification.id}
                      className={`flex items-center justify-between p-3 rounded-lg border ${
                        notification.isRead ? 'bg-muted/50' : 'bg-primary/10 border-primary/20'
                      }`}
                    >
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <div className={`w-2 h-2 rounded-full ${
                            notification.priority === 'HIGH' ? 'bg-red-500' :
                            notification.priority === 'MEDIUM' ? 'bg-yellow-500' : 'bg-green-500'
                          }`} />
                          <span className="font-medium text-sm">{notification.title}</span>
                          {!notification.isRead && (
                            <Badge variant="secondary" className="text-xs">New</Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDate(notification.createdAt)}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {!notification.isRead && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => markAsRead(notification.id)}
                            className="h-8 w-8 p-0"
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                        )}
                        {notification.targetUrl && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              if (notification.targetUrl) {
                                navigate(notification.targetUrl);
                                markAsRead(notification.id);
                              }
                            }}
                            className="h-8 w-8 p-0"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className={`grid w-full ${currentRole === 'both' ? 'grid-cols-3' : 'grid-cols-2'}`}>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            {currentRole === 'both' || currentRole === 'seller' ? (
              <TabsTrigger value="listings">My Listings</TabsTrigger>
            ) : null}
            {currentRole === 'both' || currentRole === 'buyer' ? (
              <TabsTrigger value="purchases">My Purchases</TabsTrigger>
            ) : null}
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Listings */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Listings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {listings.slice(0, 3).map((listing) => (
                      <div key={listing._id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h4 className="font-medium">{listing.title}</h4>
                          <p className="text-sm text-muted-foreground">{listing.game} • {listing.platform}</p>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{formatCurrency(listing.price.min, listing.price.currency)}</div>
                          <Badge className={getStatusColor(listing.status)}>
                            {listing.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Purchases */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Purchases</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {purchases.slice(0, 3).map((purchase) => (
                      <div key={purchase._id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h4 className="font-medium">{purchase.listingTitle}</h4>
                          <p className="text-sm text-muted-foreground">
                            {formatDate(purchase.createdAt)}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{formatCurrency(purchase.amount, purchase.currency)}</div>
                          <Badge className={getStatusColor(purchase.status)}>
                            {purchase.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activities.map((activity) => (
                    <div key={activity._id} className="flex items-center space-x-4 p-4 border rounded-lg">
                      <div className={`p-2 rounded-full ${getStatusColor(activity.status)}`}>
                        {getStatusIcon(activity.status)}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{activity.title}</h4>
                        <p className="text-sm text-muted-foreground">{activity.description}</p>
                        <p className="text-xs text-muted-foreground">{formatDate(activity.timestamp)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* My Listings Tab */}
          {(currentRole === 'both' || currentRole === 'seller') && (
            <TabsContent value="listings">
            <Card>
              <CardHeader>
                <CardTitle>My Listings</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Game</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Views</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {listings.map((listing) => (
                      <TableRow key={listing._id}>
                        <TableCell className="font-medium">{listing.title}</TableCell>
                        <TableCell>{listing.game}</TableCell>
                        <TableCell>
                          {formatCurrency(listing.price.min, listing.price.currency)}
                          {!listing.price.min === listing.price.max && ` - ${formatCurrency(listing.price.max, listing.price.currency)}`}
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(listing.status)}>
                            {listing.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-1">
                              <Eye className="w-4 h-4" />
                              <span>{listing.stats.views}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Heart className="w-4 h-4" />
                              <span>{listing.stats.favorites}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <MessageSquare className="w-4 h-4" />
                              <span>{listing.stats.inquiries}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleViewListing(listing._id)}
                          >
                            <ExternalLink className="w-4 h-4 mr-2" />
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          )}

          {/* My Purchases Tab */}
          {(currentRole === 'both' || currentRole === 'buyer') && (
            <TabsContent value="purchases">
            <Card>
              <CardHeader>
                <CardTitle>My Purchases</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {purchases.map((purchase) => (
                      <TableRow key={purchase._id}>
                        <TableCell className="font-medium">{purchase.listingTitle}</TableCell>
                        <TableCell>{formatCurrency(purchase.amount, purchase.currency)}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(purchase.status)}>
                            {purchase.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDate(purchase.createdAt)}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleViewPurchaseDetails(purchase)}
                            >
                              View Details
                            </Button>
                            {purchase.status === 'delivered' && (
                              <Button 
                                size="sm" 
                                className="bg-green-600 hover:bg-green-700"
                                onClick={() => handleConfirmReceipt(purchase._id)}
                              >
                                Confirm Receipt
                              </Button>
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
          )}
        </Tabs>

        {/* Purchase Details Modal */}
        <Dialog open={showPurchaseModal} onOpenChange={setShowPurchaseModal}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Purchase Details</DialogTitle>
              <DialogDescription>
                Detailed information about your purchase
              </DialogDescription>
            </DialogHeader>
            
            {selectedPurchase && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-sm text-muted-foreground">Item</h4>
                    <p className="text-lg font-medium">{selectedPurchase.listingTitle}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-muted-foreground">Amount</h4>
                    <p className="text-lg font-medium">{formatCurrency(selectedPurchase.amount, selectedPurchase.currency)}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-sm text-muted-foreground">Status</h4>
                    <Badge className={getStatusColor(selectedPurchase.status)}>
                      {selectedPurchase.status}
                    </Badge>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-muted-foreground">Purchase Date</h4>
                    <p>{formatDate(selectedPurchase.createdAt)}</p>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground mb-2">Delivery Details</h4>
                  <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                    <div>
                      <span className="font-medium">Method:</span> {selectedPurchase.deliveryDetails.method}
                    </div>
                    <div>
                      <span className="font-medium">Instructions:</span> {selectedPurchase.deliveryDetails.instructions}
                    </div>
                    {selectedPurchase.deliveryDetails.deliveredAt && (
                      <div>
                        <span className="font-medium">Delivered At:</span> {formatDate(selectedPurchase.deliveryDetails.deliveredAt)}
                      </div>
                    )}
                    {selectedPurchase.deliveryDetails.receivedAt && (
                      <div>
                        <span className="font-medium">Received At:</span> {formatDate(selectedPurchase.deliveryDetails.receivedAt)}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground mb-2">Seller Information</h4>
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <p><span className="font-medium">Email:</span> {selectedPurchase.sellerEmail}</p>
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowPurchaseModal(false)}
                  >
                    Close
                  </Button>
                  {selectedPurchase.status === 'delivered' && (
                    <Button 
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => {
                        handleConfirmReceipt(selectedPurchase._id);
                        setShowPurchaseModal(false);
                      }}
                    >
                      Confirm Receipt
                    </Button>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Dashboard;
