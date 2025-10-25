import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, User } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import ProfileMenu from "@/components/ProfileMenu";

const Navbar = () => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const { user, userData, logout } = useAuth();

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/browse", label: "Browse Accounts" },
    { to: "/bidding", label: "Bidding" },
    { to: "/sell", label: "Sell Account" },
    { to: "/inquiry", label: "Custom Request" },
    { to: "/success", label: "Success Stories" },
    { to: "/contact", label: "Contact" },
  ];

  // Add admin dashboard link if user is admin
  const adminLinks = userData?.role === 'admin' ? [
    { to: "/admin/dashboard", label: "Admin Dashboard" },
    { to: "/admin/activity", label: "Activity Log" }
  ] : [];

  // Debug logging
  console.log('Navbar - userData:', userData);
  console.log('Navbar - userData?.role:', userData?.role);
  console.log('Navbar - adminLinks:', adminLinks);

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center font-bold text-lg">
              GT
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              GameTradeX
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link key={link.to} to={link.to}>
                <Button
                  variant="ghost"
                  className={isActive(link.to) ? "text-primary" : "text-muted-foreground hover:text-foreground"}
                >
                  {link.label}
                </Button>
              </Link>
            ))}
            {/* Admin Dashboard Link - Only visible to admins */}
            {adminLinks.map((link) => (
              <Link key={link.to} to={link.to}>
                <Button
                  variant="ghost"
                  className={`${isActive(link.to) ? "text-primary" : "text-muted-foreground hover:text-foreground"} border-l border-border ml-2 pl-4`}
                >
                  {link.label}
                </Button>
              </Link>
            ))}
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-2">
            {user ? (
              <ProfileMenu />
            ) : (
              <div className="flex items-center space-x-2">
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    <User className="w-4 h-4 mr-1" />
                    Login
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button size="sm" className="btn-primary">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <div className="flex flex-col space-y-2">
              {navLinks.map((link) => (
                <Link 
                  key={link.to} 
                  to={link.to}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Button
                    variant="ghost"
                    className={`w-full justify-start ${isActive(link.to) ? "text-primary" : "text-muted-foreground"}`}
                  >
                    {link.label}
                  </Button>
                </Link>
              ))}
              
              {/* Admin Dashboard Link - Only visible to admins in mobile menu */}
              {adminLinks.map((link) => (
                <Link 
                  key={link.to} 
                  to={link.to}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Button
                    variant="ghost"
                    className={`w-full justify-start ${isActive(link.to) ? "text-primary" : "text-muted-foreground"} border-t border-border pt-2 mt-2`}
                  >
                    {link.label}
                  </Button>
                </Link>
              ))}
              
              {user ? (
                <div className="p-2 border-t border-border mt-2">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className={`h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white`}>
                      {userData?.name?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{userData?.name}</p>
                      <p className="text-xs text-muted-foreground capitalize">{userData?.role}</p>
                    </div>
                  </div>
                  <Link to={userData?.role === 'admin' ? '/admin/dashboard' : userData?.role === 'seller' ? '/sell-account' : '/dashboard'} onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start mb-1">
                      {userData?.role === 'admin' ? 'Admin Dashboard' : userData?.role === 'seller' ? 'Seller Dashboard' : 'My Dashboard'}
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-red-500"
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                  >
                    <User className="w-4 h-4 mr-2" />
                    Logout
                  </Button>
                </div>
              ) : (
                <>
                  <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start">
                      Login
                    </Button>
                  </Link>
                  <Link to="/signup" onClick={() => setMobileMenuOpen(false)}>
                    <Button className="w-full">Sign Up</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
