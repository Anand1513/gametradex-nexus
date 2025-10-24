/**
 * Admin Activity Page
 * Displays admin action logs with filtering, table view, and CSV export
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Download, Eye, Filter, Search, ArrowLeft, Shield } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

interface AdminAction {
  id: string;
  adminId: string;
  adminEmail: string;
  sessionId: string;
  actionType: string;
  targetType: string;
  targetId: string;
  details: Record<string, any>;
  ip: string;
  userAgent: string;
  createdAt: string;
}

interface ActivityFilters {
  adminEmail: string;
  actionType: string;
  from: Date | undefined;
  to: Date | undefined;
  sessionId: string;
}

const AdminActivity: React.FC = () => {
  const [actions, setActions] = useState<AdminAction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAction, setSelectedAction] = useState<AdminAction | null>(null);
  const [actionTypes, setActionTypes] = useState<string[]>([]);
  const [filters, setFilters] = useState<ActivityFilters>({
    adminEmail: '',
    actionType: '',
    from: undefined,
    to: undefined,
    sessionId: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [integrityStatus, setIntegrityStatus] = useState<{valid: number, invalid: number, total: number} | null>(null);
  const navigate = useNavigate();

  // Fetch admin actions
  const fetchActions = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      
      if (filters.adminEmail) queryParams.append('adminEmail', filters.adminEmail);
      if (filters.actionType) queryParams.append('actionType', filters.actionType);
      if (filters.from) queryParams.append('from', filters.from.toISOString());
      if (filters.to) queryParams.append('to', filters.to.toISOString());
      if (filters.sessionId) queryParams.append('sessionId', filters.sessionId);
      
      const response = await fetch(`http://localhost:3001/api/admin/actions?${queryParams.toString()}`);
      
      if (response.ok) {
        const data = await response.json();
        setActions(data.data.actions || []);
      } else {
        console.warn('Backend not available, using mock data');
        // Fallback to mock data
        setActions([
          {
            id: 'action-1',
            adminId: 'admin-123',
            adminEmail: 'admin@gametradex.com',
            sessionId: 'session-abc123',
            actionType: 'LOGIN',
            targetType: 'SESSION',
            targetId: 'session-abc123',
            details: { loginMethod: 'key', loginTime: '2025-10-25T02:30:00.000Z' },
            ip: '127.0.0.1',
            userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
            createdAt: '2025-10-25T02:30:00.000Z'
          }
        ]);
      }
    } catch (error) {
      console.error('Error fetching admin actions:', error);
      toast.error('Failed to fetch admin actions');
    } finally {
      setLoading(false);
    }
  };

  // Fetch action types for filter dropdown
  const fetchActionTypes = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/admin/actions/types');
      if (response.ok) {
        const data = await response.json();
        setActionTypes(data.data || []);
      }
    } catch (error) {
      console.warn('Failed to fetch action types, using defaults');
      setActionTypes(['LOGIN', 'LOGOUT', 'PRICE_UPDATE', 'LISTING_APPROVE', 'USER_ROLE_CHANGE']);
    }
  };

  useEffect(() => {
    fetchActions();
    fetchActionTypes();
  }, [filters]);

  // Verify integrity
  const handleVerifyIntegrity = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/admin/actions/verify');
      const data = await response.json();
      
      if (data.success) {
        setIntegrityStatus({
          valid: data.data.valid,
          invalid: data.data.invalid,
          total: data.data.total
        });
        
        if (data.data.invalid > 0) {
          toast.error(`${data.data.invalid} actions have been tampered with!`);
        } else {
          toast.success(`All ${data.data.total} actions verified - No tampering detected`);
        }
      } else {
        toast.error('Failed to verify integrity');
      }
    } catch (error) {
      console.error('Error verifying integrity:', error);
      toast.error('Failed to verify integrity');
    }
  };

  // Export CSV
  const handleExportCSV = async () => {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters.adminEmail) queryParams.append('adminEmail', filters.adminEmail);
      if (filters.actionType) queryParams.append('actionType', filters.actionType);
      if (filters.from) queryParams.append('from', filters.from.toISOString());
      if (filters.to) queryParams.append('to', filters.to.toISOString());
      if (filters.sessionId) queryParams.append('sessionId', filters.sessionId);
      
      // Use the new export endpoint
      const response = await fetch(`http://localhost:3001/api/admin/actions/export?${queryParams.toString()}`);
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `admin-actions-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success('CSV exported successfully with HMAC signatures');
      } else {
        toast.error('Failed to export CSV');
      }
    } catch (error) {
      console.error('Error exporting CSV:', error);
      toast.error('Failed to export CSV');
    }
  };

  // Get short details for table display
  const getShortDetails = (details: Record<string, any>): string => {
    const keys = Object.keys(details);
    if (keys.length === 0) return 'No details';
    
    const firstKey = keys[0];
    const value = details[firstKey];
    
    if (typeof value === 'object') {
      return `${firstKey}: ${JSON.stringify(value).substring(0, 50)}...`;
    }
    
    return `${firstKey}: ${String(value).substring(0, 50)}${String(value).length > 50 ? '...' : ''}`;
  };

  // Get action type badge color
  const getActionTypeColor = (actionType: string): string => {
    switch (actionType) {
      case 'LOGIN':
      case 'LOGOUT':
        return 'bg-blue-500';
      case 'PRICE_UPDATE':
        return 'bg-yellow-500';
      case 'LISTING_APPROVE':
      case 'LISTING_REJECT':
        return 'bg-green-500';
      case 'USER_ROLE_CHANGE':
        return 'bg-purple-500';
      case 'SECURITY_ACTION':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button 
              onClick={() => navigate('/admin/dashboard')} 
              variant="outline" 
              className="flex items-center"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground flex items-center">
                <Shield className="w-6 h-6 mr-2 text-green-500" />
                Admin Activity
              </h1>
              <p className="text-muted-foreground mt-2">
                Monitor and track all admin actions and activities
              </p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button
              onClick={handleVerifyIntegrity}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Shield className="w-4 h-4 mr-2" />
              Verify Integrity
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="border-primary/20 hover:bg-primary/10"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
            <Button
              onClick={handleExportCSV}
              className="bg-primary hover:bg-primary/90"
            >
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>

        {/* Integrity Status */}
        {integrityStatus && (
          <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
            <CardContent className="p-4">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Shield className="w-5 h-5 text-green-600" />
                  <span className="font-semibold text-green-800 dark:text-green-200">
                    Integrity Status
                  </span>
                </div>
                <div className="flex items-center space-x-4 text-sm">
                  <span className="text-green-700 dark:text-green-300">
                    Valid: {integrityStatus.valid}
                  </span>
                  <span className="text-red-700 dark:text-red-300">
                    Invalid: {integrityStatus.invalid}
                  </span>
                  <span className="text-gray-700 dark:text-gray-300">
                    Total: {integrityStatus.total}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filters */}
        {showFilters && (
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="text-lg">Filter Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="adminEmail">Admin Email</Label>
                  <Input
                    id="adminEmail"
                    placeholder="Filter by admin email"
                    value={filters.adminEmail}
                    onChange={(e) => setFilters({ ...filters, adminEmail: e.target.value })}
                    className="border-primary/20 focus:border-primary"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="actionType">Action Type</Label>
                  <Select
                    value={filters.actionType}
                    onValueChange={(value) => setFilters({ ...filters, actionType: value })}
                  >
                    <SelectTrigger className="border-primary/20 focus:border-primary">
                      <SelectValue placeholder="Select action type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Types</SelectItem>
                      {actionTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="sessionId">Session ID</Label>
                  <Input
                    id="sessionId"
                    placeholder="Filter by session ID"
                    value={filters.sessionId}
                    onChange={(e) => setFilters({ ...filters, sessionId: e.target.value })}
                    className="border-primary/20 focus:border-primary"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>From Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal border-primary/20 hover:bg-primary/10",
                          !filters.from && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {filters.from ? format(filters.from, "PPP") : "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={filters.from}
                        onSelect={(date) => setFilters({ ...filters, from: date })}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div className="space-y-2">
                  <Label>To Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal border-primary/20 hover:bg-primary/10",
                          !filters.to && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {filters.to ? format(filters.to, "PPP") : "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={filters.to}
                        onSelect={(date) => setFilters({ ...filters, to: date })}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div className="flex items-end">
                  <Button
                    variant="outline"
                    onClick={() => setFilters({
                      adminEmail: '',
                      actionType: '',
                      from: undefined,
                      to: undefined,
                      sessionId: ''
                    })}
                    className="w-full border-primary/20 hover:bg-primary/10"
                  >
                    Clear Filters
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Actions Table */}
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Admin Actions ({actions.length})</span>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchActions}
                className="border-primary/20 hover:bg-primary/10"
              >
                <Search className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-primary/20">
                      <TableHead>Time</TableHead>
                      <TableHead>Admin Email</TableHead>
                      <TableHead>Session ID</TableHead>
                      <TableHead>Action Type</TableHead>
                      <TableHead>Target Type</TableHead>
                      <TableHead>Target ID</TableHead>
                      <TableHead>Short Details</TableHead>
                      <TableHead>IP</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {actions.map((action) => (
                      <TableRow key={action.id} className="border-primary/10 hover:bg-primary/5">
                        <TableCell className="font-mono text-sm">
                          {format(new Date(action.createdAt), 'MMM dd, yyyy HH:mm:ss')}
                        </TableCell>
                        <TableCell className="font-medium">
                          {action.adminEmail}
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {action.sessionId.substring(0, 12)}...
                        </TableCell>
                        <TableCell>
                          <Badge className={`${getActionTypeColor(action.actionType)} text-white`}>
                            {action.actionType}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="border-primary/20">
                            {action.targetType}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {action.targetId}
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          {getShortDetails(action.details)}
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {action.ip}
                        </TableCell>
                        <TableCell>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedAction(action)}
                                className="border-primary/20 hover:bg-primary/10"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>Action Details</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label className="text-sm font-medium">Action ID</Label>
                                    <p className="text-sm text-muted-foreground font-mono">{action.id}</p>
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium">Admin Email</Label>
                                    <p className="text-sm text-muted-foreground">{action.adminEmail}</p>
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium">Session ID</Label>
                                    <p className="text-sm text-muted-foreground font-mono">{action.sessionId}</p>
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium">IP Address</Label>
                                    <p className="text-sm text-muted-foreground font-mono">{action.ip}</p>
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium">Action Type</Label>
                                    <Badge className={`${getActionTypeColor(action.actionType)} text-white`}>
                                      {action.actionType}
                                    </Badge>
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium">Target Type</Label>
                                    <Badge variant="outline" className="border-primary/20">
                                      {action.targetType}
                                    </Badge>
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium">Target ID</Label>
                                    <p className="text-sm text-muted-foreground font-mono">{action.targetId}</p>
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium">Timestamp</Label>
                                    <p className="text-sm text-muted-foreground">
                                      {format(new Date(action.createdAt), 'PPP p')}
                                    </p>
                                  </div>
                                </div>
                                
                                <div>
                                  <Label className="text-sm font-medium">User Agent</Label>
                                  <p className="text-sm text-muted-foreground break-all">{action.userAgent}</p>
                                </div>
                                
                                <div>
                                  <Label className="text-sm font-medium">Full Details (JSON)</Label>
                                  <pre className="bg-muted p-4 rounded-md text-sm overflow-x-auto">
                                    {JSON.stringify(action.details, null, 2)}
                                  </pre>
                                </div>
                                
                                {action.details.targetUrl && (
                                  <div>
                                    <Label className="text-sm font-medium">Target URL</Label>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => window.open(action.details.targetUrl, '_blank')}
                                      className="mt-2 border-primary/20 hover:bg-primary/10"
                                    >
                                      Open Target URL
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                
                {actions.length === 0 && !loading && (
                  <div className="text-center py-8 text-muted-foreground">
                    No admin actions found matching your filters.
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminActivity;
