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
import { Shield, Users, DollarSign, FileText, LogOut } from 'lucide-react';
import { toast } from 'sonner';
import LegalDisclaimer from '@/components/LegalDisclaimer';

const Admin: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminKey, setAdminKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Mock data
  const [listings, setListings] = useState([
    { id: '1', title: 'Conqueror Account', seller: 'user1', status: 'pending', createdAt: '2025-01-15' },
    { id: '2', title: 'Ace Account', seller: 'user2', status: 'verified', createdAt: '2025-01-14' },
    { id: '3', title: 'Crown Account', seller: 'user3', status: 'rejected', createdAt: '2025-01-13' }
  ]);

  const [escrows, setEscrows] = useState([
    { id: '1', buyer: 'buyer1', seller: 'seller1', amount: 25000, status: 'pending', createdAt: '2025-01-15' },
    { id: '2', buyer: 'buyer2', seller: 'seller2', amount: 18000, status: 'held', createdAt: '2025-01-14' },
    { id: '3', buyer: 'buyer3', seller: 'seller3', amount: 12000, status: 'released', createdAt: '2025-01-13' }
  ]);

  const [users, setUsers] = useState([
    { id: '1', name: 'John Doe', email: 'john@example.com', role: 'user', status: 'active' },
    { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'user', status: 'active' },
    { id: '3', name: 'Admin User', email: 'admin@example.com', role: 'admin', status: 'active' }
  ]);

  useEffect(() => {
    // Check if already authenticated
    const adminAuth = localStorage.getItem('adminAuth');
    if (adminAuth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check admin key (in production, this would be server-side)
      if (adminKey === 'gtx_admin_2025') {
        localStorage.setItem('adminAuth', 'true');
        setIsAuthenticated(true);
        toast.success('Admin access granted');
      } else {
        toast.error('Invalid admin key');
      }
    } catch (error) {
      toast.error('Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminAuth');
    setIsAuthenticated(false);
    setAdminKey('');
    toast.success('Logged out successfully');
  };

  const handleListingAction = (id: string, action: 'approve' | 'reject') => {
    setListings(prev => prev.map(listing => 
      listing.id === id 
        ? { ...listing, status: action === 'approve' ? 'verified' : 'rejected' }
        : listing
    ));
    toast.success(`Listing ${action}d successfully`);
  };

  const handleEscrowAction = (id: string, action: 'release' | 'refund') => {
    setEscrows(prev => prev.map(escrow => 
      escrow.id === id 
        ? { ...escrow, status: action === 'release' ? 'released' : 'refunded' }
        : escrow
    ));
    toast.success(`Escrow ${action}d successfully`);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center font-bold text-lg">
                GT
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                GameTradeX
              </span>
            </div>
            <h1 className="text-3xl font-bold mb-2">Admin Access</h1>
            <p className="text-muted-foreground">Enter admin key to continue</p>
          </div>

          <Card className="card-glow">
            <CardHeader>
              <CardTitle className="text-center flex items-center justify-center">
                <Shield className="w-5 h-5 mr-2 text-primary" />
                Admin Login
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="adminKey">Admin Key</Label>
                  <Input
                    id="adminKey"
                    type="password"
                    value={adminKey}
                    onChange={(e) => setAdminKey(e.target.value)}
                    placeholder="Enter admin key"
                    required
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full btn-primary" 
                  disabled={isLoading}
                >
                  {isLoading ? 'Authenticating...' : 'Access Admin Panel'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-primary mb-2">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage listings, escrows, and users</p>
          </div>
          <Button onClick={handleLogout} variant="outline" className="flex items-center">
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
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
                  <p className="text-2xl font-bold">{escrows.length}</p>
                  <p className="text-sm text-muted-foreground">Active Escrows</p>
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
                  <p className="text-2xl font-bold">98%</p>
                  <p className="text-sm text-muted-foreground">Success Rate</p>
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
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {listings.map((listing) => (
                      <TableRow key={listing.id}>
                        <TableCell>{listing.id}</TableCell>
                        <TableCell>{listing.title}</TableCell>
                        <TableCell>{listing.seller}</TableCell>
                        <TableCell>
                          <Badge 
                            className={
                              listing.status === 'verified' ? 'bg-green-500/20 text-green-500' :
                              listing.status === 'rejected' ? 'bg-red-500/20 text-red-500' :
                              'bg-yellow-500/20 text-yellow-500'
                            }
                          >
                            {listing.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{listing.createdAt}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            {listing.status === 'pending' && (
                              <>
                                <Button 
                                  size="sm" 
                                  onClick={() => handleListingAction(listing.id, 'approve')}
                                  className="bg-green-500 hover:bg-green-600"
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
                        <TableCell>{escrow.id}</TableCell>
                        <TableCell>{escrow.buyer}</TableCell>
                        <TableCell>{escrow.seller}</TableCell>
                        <TableCell>₹{escrow.amount.toLocaleString()}</TableCell>
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
                        <TableCell>{escrow.createdAt}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            {escrow.status === 'held' && (
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
                        <TableCell>{user.id}</TableCell>
                        <TableCell>{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge 
                            className={user.role === 'admin' ? 'bg-primary/20 text-primary' : 'bg-muted/20 text-muted-foreground'}
                          >
                            {user.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-green-500/20 text-green-500">
                            {user.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline">
                              Ban
                            </Button>
                            <Button size="sm" variant="outline">
                              Promote
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
    </div>
  );
};

export default Admin;


