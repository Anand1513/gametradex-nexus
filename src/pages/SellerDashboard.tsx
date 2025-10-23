import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useAuth } from '@/contexts/AuthContext';
import { AlertCircle, Eye, Info } from 'lucide-react';
import { Link } from 'react-router-dom';

const SellerDashboard: React.FC = () => {
  const { userData } = useAuth();
  const [activeTab, setActiveTab] = useState('listings');

  // Dummy data for seller listings
  const [myListings, setMyListings] = useState([
    { 
      id: '1', 
      title: 'Conqueror Account - 4.2 KD', 
      status: 'open', 
      verified: true, 
      priceMin: 25000, 
      priceMax: 35000, 
      isFixed: false,
      negotiable: true,
      pendingPrice: false,
      createdAt: new Date() 
    },
    { 
      id: '2', 
      title: 'Ace Master Account - 3.8 KD', 
      status: 'bidding', 
      verified: false, 
      priceMin: 15000, 
      priceMax: 22000, 
      isFixed: false,
      negotiable: true,
      pendingPrice: false,
      createdAt: new Date() 
    },
    { 
      id: '3', 
      title: 'Platinum Account - 1.8 KD', 
      status: 'open', 
      verified: false, 
      pendingPrice: true,
      createdAt: new Date() 
    }
  ]);

  return (
    <div className="container mx-auto py-10 px-4 max-w-7xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Seller Dashboard</h1>
          <p className="text-muted-foreground">Manage your game account listings</p>
        </div>
        <Link to="/sell">
          <Button>Create New Listing</Button>
        </Link>
      </div>

      <Tabs defaultValue="listings" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="listings">My Listings</TabsTrigger>
          <TabsTrigger value="messages">Messages</TabsTrigger>
        </TabsList>

        <TabsContent value="listings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Your Game Account Listings</CardTitle>
              <CardDescription>
                View and manage all your listed game accounts
              </CardDescription>
            </CardHeader>
            <CardContent>
              {myListings.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {myListings.map((listing) => (
                      <TableRow key={listing.id}>
                        <TableCell className="font-medium">{listing.title}</TableCell>
                        <TableCell>
                          <Badge 
                            className={
                              listing.status === 'open' 
                                ? 'bg-green-500' 
                                : listing.status === 'bidding' 
                                ? 'bg-blue-500' 
                                : 'bg-gray-500'
                            }
                          >
                            {listing.status.charAt(0).toUpperCase() + listing.status.slice(1)}
                          </Badge>
                          {!listing.verified && (
                            <Badge variant="outline" className="ml-2 border-amber-500 text-amber-500">
                              Pending Verification
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {listing.pendingPrice ? (
                            <div className="flex items-center text-amber-500">
                              <AlertCircle className="w-4 h-4 mr-1" />
                              <span>Pending Admin Review</span>
                            </div>
                          ) : listing.isFixed ? (
                            <span>₹{listing.priceMin?.toLocaleString()}</span>
                          ) : (
                            <span>₹{listing.priceMin?.toLocaleString()} - ₹{listing.priceMax?.toLocaleString()}</span>
                          )}
                          {!listing.pendingPrice && listing.negotiable && (
                            <span className="ml-2 text-xs text-gray-500">(Negotiable)</span>
                          )}
                        </TableCell>
                        <TableCell>{listing.createdAt.toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline" className="flex items-center">
                              <Eye className="w-3 h-3 mr-1" />
                              View
                            </Button>
                            {listing.pendingPrice && (
                              <Button size="sm" variant="outline" className="flex items-center">
                                <Info className="w-3 h-3 mr-1" />
                                Contact Admin
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-10">
                  <p className="text-muted-foreground mb-4">You haven't created any listings yet</p>
                  <Link to="/sell">
                    <Button>Create Your First Listing</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="messages" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Messages</CardTitle>
              <CardDescription>
                Communication with buyers and admin
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-10">
                <p className="text-muted-foreground mb-4">No messages yet</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SellerDashboard;