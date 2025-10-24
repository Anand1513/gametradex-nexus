/**
 * Notification Panel Component
 * Displays notifications in the admin dashboard
 */

import React, { useState } from 'react';
import { Bell, X, Check, CheckCheck, Filter, Search, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNotifications } from '@/contexts/NotificationContext';
import { Notification, NotificationType, NotificationPriority } from '@/types/notifications';
import { formatDistanceToNow } from 'date-fns';

const NotificationPanel: React.FC = () => {
  const {
    notifications,
    unreadCount,
    stats,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    handleNotificationClick,
    loadNotifications
  } = useNotifications();

  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<NotificationType | 'all'>('all');
  const [filterPriority, setFilterPriority] = useState<NotificationPriority | 'all'>('all');

  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || notification.type === filterType;
    const matchesPriority = filterPriority === 'all' || notification.priority === filterPriority;
    
    return matchesSearch && matchesType && matchesPriority;
  });

  const getNotificationIcon = (type: NotificationType, priority: NotificationPriority) => {
    if (priority === 'URGENT') return <AlertCircle className="w-4 h-4 text-red-500" />;
    if (priority === 'HIGH') return <AlertTriangle className="w-4 h-4 text-orange-500" />;
    if (type.includes('SECURITY') || type.includes('ALERT')) return <AlertCircle className="w-4 h-4 text-red-500" />;
    return <Info className="w-4 h-4 text-blue-500" />;
  };

  const getPriorityColor = (priority: NotificationPriority) => {
    switch (priority) {
      case 'URGENT': return 'bg-red-500/20 text-red-500 border-red-500/20';
      case 'HIGH': return 'bg-orange-500/20 text-orange-500 border-orange-500/20';
      case 'MEDIUM': return 'bg-yellow-500/20 text-yellow-500 border-yellow-500/20';
      case 'LOW': return 'bg-green-500/20 text-green-500 border-green-500/20';
      default: return 'bg-gray-500/20 text-gray-500 border-gray-500/20';
    }
  };

  const onNotificationClick = (notification: Notification) => {
    handleNotificationClick(notification);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      {/* Notification Bell Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </Button>

      {/* Notification Panel */}
      {isOpen && (
        <div className="absolute right-0 top-12 w-96 z-50">
          <Card className="card-glow border-primary/20 shadow-glow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center">
                  <Bell className="w-5 h-5 mr-2 text-primary" />
                  Notifications
                  {unreadCount > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {unreadCount} unread
                    </Badge>
                  )}
                </CardTitle>
                <div className="flex items-center space-x-2">
                  {unreadCount > 0 && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={markAllAsRead}
                      className="text-xs"
                    >
                      <CheckCheck className="w-3 h-3 mr-1" />
                      Mark all read
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setIsOpen(false)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              {/* Filters */}
              <div className="p-4 border-b border-border">
                <div className="space-y-3">
                  <Input
                    placeholder="Search notifications..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full"
                  />
                  <div className="flex space-x-2">
                    <Select value={filterType} onValueChange={(value) => setFilterType(value as NotificationType | 'all')}>
                      <SelectTrigger className="w-1/2">
                        <SelectValue placeholder="Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="LISTING_APPROVED">Listing Approved</SelectItem>
                        <SelectItem value="LISTING_REJECTED">Listing Rejected</SelectItem>
                        <SelectItem value="PRICE_CHANGED">Price Changed</SelectItem>
                        <SelectItem value="USER_ROLE_CHANGED">User Role Changed</SelectItem>
                        <SelectItem value="SYSTEM_ALERT">System Alert</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={filterPriority} onValueChange={(value) => setFilterPriority(value as NotificationPriority | 'all')}>
                      <SelectTrigger className="w-1/2">
                        <SelectValue placeholder="Priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Priorities</SelectItem>
                        <SelectItem value="URGENT">Urgent</SelectItem>
                        <SelectItem value="HIGH">High</SelectItem>
                        <SelectItem value="MEDIUM">Medium</SelectItem>
                        <SelectItem value="LOW">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Notifications List */}
              <ScrollArea className="h-96">
                {loading ? (
                  <div className="p-4 text-center text-muted-foreground">
                    Loading notifications...
                  </div>
                ) : error ? (
                  <div className="p-4 text-center text-destructive">
                    Error loading notifications: {error}
                  </div>
                ) : filteredNotifications.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground">
                    No notifications found
                  </div>
                ) : (
                  <div className="space-y-1">
                    {filteredNotifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-3 border-b border-border cursor-pointer hover:bg-muted/50 transition-colors ${
                          !notification.isRead ? 'bg-primary/5 border-l-4 border-l-primary' : ''
                        }`}
                        onClick={() => onNotificationClick(notification)}
                      >
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0 mt-1">
                            {getNotificationIcon(notification.type, notification.priority)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h4 className={`text-sm font-medium ${!notification.isRead ? 'text-primary' : 'text-foreground'}`}>
                                {notification.title}
                              </h4>
                              <div className="flex items-center space-x-2">
                                <Badge 
                                  variant="outline" 
                                  className={`text-xs ${getPriorityColor(notification.priority)}`}
                                >
                                  {notification.priority}
                                </Badge>
                                {!notification.isRead && (
                                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                                )}
                              </div>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                              {notification.message}
                            </p>
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-xs text-muted-foreground">
                                {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                              </span>
                              {notification.relatedActionId && (
                                <span className="text-xs text-muted-foreground">
                                  Action: {notification.relatedActionId.slice(0, 8)}...
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default NotificationPanel;
