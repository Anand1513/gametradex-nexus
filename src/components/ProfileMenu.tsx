import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User, LogOut, Settings, LayoutDashboard } from 'lucide-react';

const ProfileMenu: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-500';
      case 'seller':
        return 'bg-blue-500';
      case 'buyer':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getDashboardLink = () => {
    switch (user.role) {
      case 'admin':
        return '/admin';
      case 'seller':
        return '/sell-account';
      case 'buyer':
        return '/browse';
      default:
        return '/';
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="focus:outline-none">
        <Avatar className={`h-8 w-8 ${getRoleColor(user.role)}`}>
          <AvatarFallback>{getInitials(user.name || 'User')}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium">{user.name}</p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="flex items-center">
          <User className="mr-2 h-4 w-4" />
          <span className="capitalize">{user.role}</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate(getDashboardLink())} className="cursor-pointer">
          <Settings className="mr-2 h-4 w-4" />
          {user.role === 'admin' ? 'Admin Dashboard' : 
           user.role === 'seller' ? 'Seller Dashboard' : 'My Account'}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate('/dashboard')} className="cursor-pointer">
          <LayoutDashboard className="mr-2 h-4 w-4" />
          My Dashboard
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="text-red-600 cursor-pointer">
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ProfileMenu;