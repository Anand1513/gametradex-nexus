import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, Shield, Info } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { DUMMY_CREDENTIALS } from '@/contexts/AuthContext';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login, isDummyAuth } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login(email, password);
    } catch (error) {
      // Error is handled in the auth context
    } finally {
      setIsLoading(false);
    }
  };

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
          <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
          <p className="text-muted-foreground">Sign in to your account to continue</p>
        </div>

        <Card className="card-glow">
          <CardHeader>
            <CardTitle className="text-center">Sign In</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full btn-primary" 
                disabled={isLoading}
              >
                {isLoading ? 'Signing In...' : 'Sign In'}
              </Button>
            </form>

            {isDummyAuth && (
              <div className="mt-4 p-3 bg-primary/10 border border-primary/20 rounded-md">
                <div className="flex items-start space-x-2">
                  <Info className="w-4 h-4 text-primary mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-primary">Dummy Auth Mode Active</p>
                    <p className="text-muted-foreground mt-1">Use these credentials to login:</p>
                    <div className="mt-1 p-2 bg-background/50 rounded border border-border">
                      <p className="font-medium text-primary mb-1">Admin:</p>
                      <p><span className="font-mono">Email:</span> {DUMMY_CREDENTIALS.admin.email}</p>
                      <p><span className="font-mono">Password:</span> {DUMMY_CREDENTIALS.admin.password}</p>
                    </div>
                    <div className="mt-2 p-2 bg-background/50 rounded border border-border">
                      <p className="font-medium text-primary mb-1">Seller:</p>
                      <p><span className="font-mono">Email:</span> {DUMMY_CREDENTIALS.seller.email}</p>
                      <p><span className="font-mono">Password:</span> {DUMMY_CREDENTIALS.seller.password}</p>
                    </div>
                    <div className="mt-2 p-2 bg-background/50 rounded border border-border">
                      <p className="font-medium text-primary mb-1">Buyer:</p>
                      <p><span className="font-mono">Email:</span> {DUMMY_CREDENTIALS.buyer.email}</p>
                      <p><span className="font-mono">Password:</span> {DUMMY_CREDENTIALS.buyer.password}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Don't have an account?{' '}
                <Link to="/signup" className="text-primary hover:underline">
                  Sign up
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <Alert className="bg-primary/10 border-primary/20">
            <Shield className="h-4 w-4" />
            <AlertDescription className="text-sm">
              Your account is protected with industry-standard security measures.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    </div>
  );
};

export default Login;


