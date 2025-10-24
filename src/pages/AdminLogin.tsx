import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Key, User, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { logAdminLogin } from '@/utils/adminLogger';
import { startAdminSession } from '@/utils/adminSessions';

const AdminLogin: React.FC = () => {
  const [loginMethod, setLoginMethod] = useState<'key' | 'credentials'>('key');
  const [adminKey, setAdminKey] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  // Admin credentials and key (in production, these should be in environment variables)
  const ADMIN_CREDENTIALS = {
    email: 'admin@gametradex.com',
    password: 'admin123'
  };
  const ADMIN_KEY = 'GAMETRADEX_ADMIN_2024';

  const handleKeyLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (adminKey === ADMIN_KEY) {
        // Set admin role in localStorage for key-based login
        const adminUserData = {
          uid: 'admin-key-user',
          name: 'Admin User',
          email: 'admin@gametradex.com',
          role: 'admin',
          createdAt: new Date()
        };
        localStorage.setItem('dummyAuthToken', JSON.stringify({
          uid: adminUserData.uid,
          email: adminUserData.email,
          role: adminUserData.role,
          expiry: Date.now() + (2 * 60 * 60 * 1000) // 2 hours
        }));
        
        // Set admin session
        const adminSession = {
          isAdmin: true,
          loginMethod: 'key',
          timestamp: Date.now(),
          expiry: Date.now() + (2 * 60 * 60 * 1000) // 2 hours
        };
        localStorage.setItem('adminSession', JSON.stringify(adminSession));
        
        console.log('Admin key session set:', adminSession);
        console.log('Admin session in localStorage:', localStorage.getItem('adminSession'));
        
        // Start admin session
        const sessionId = await startAdminSession('key', 'admin@example.com');
        
        // Log admin login action
        await logAdminLogin('key', 'admin@example.com');
        
        toast.success('Admin access granted!');
        navigate('/admin/dashboard');
      } else {
        toast.error('Invalid admin key');
      }
    } catch (error) {
      toast.error('Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCredentialLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
        // Set admin role in localStorage for credential-based login
        const adminUserData = {
          uid: 'admin-credential-user',
          name: 'Admin User',
          email: email,
          role: 'admin',
          createdAt: new Date()
        };
        localStorage.setItem('dummyAuthToken', JSON.stringify({
          uid: adminUserData.uid,
          email: adminUserData.email,
          role: adminUserData.role,
          expiry: Date.now() + (2 * 60 * 60 * 1000) // 2 hours
        }));
        
        // Set admin session
        const adminSession = {
          isAdmin: true,
          loginMethod: 'credentials',
          email: email,
          timestamp: Date.now(),
          expiry: Date.now() + (2 * 60 * 60 * 1000) // 2 hours
        };
        localStorage.setItem('adminSession', JSON.stringify(adminSession));
        
        console.log('Admin credentials session set:', adminSession);
        console.log('Admin session in localStorage:', localStorage.getItem('adminSession'));
        
        // Start admin session
        const sessionId = await startAdminSession('credentials', email);
        
        // Log admin login action
        await logAdminLogin('credentials', email);
        
        toast.success('Admin access granted!');
        navigate('/admin/dashboard');
      } else {
        toast.error('Invalid credentials');
      }
    } catch (error) {
      toast.error('Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="card-glow border-primary/20 shadow-glow">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center shadow-glow">
                <Shield className="w-8 h-8 text-primary-foreground" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Admin Access</CardTitle>
            <p className="text-muted-foreground">Secure admin login required</p>
          </CardHeader>
          <CardContent>
            <Tabs value={loginMethod} onValueChange={(value) => setLoginMethod(value as 'key' | 'credentials')}>
              <TabsList className="grid w-full grid-cols-2 bg-muted/50 border border-border">
                <TabsTrigger value="key" className="flex items-center data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-glow">
                  <Key className="w-4 h-4 mr-2" />
                  Admin Key
                </TabsTrigger>
                <TabsTrigger value="credentials" className="flex items-center data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-glow">
                  <User className="w-4 h-4 mr-2" />
                  ID & Password
                </TabsTrigger>
              </TabsList>

              {/* Admin Key Login */}
              <TabsContent value="key" className="space-y-4">
                <form onSubmit={handleKeyLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="adminKey">Admin Key</Label>
                    <Input
                      id="adminKey"
                      type="password"
                      placeholder="Enter admin key"
                      value={adminKey}
                      onChange={(e) => setAdminKey(e.target.value)}
                      required
                      className="bg-background border-border focus:border-primary focus:ring-primary/20"
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full btn-primary" 
                    disabled={isLoading}
                  >
                    {isLoading ? 'Verifying...' : 'Access Dashboard'}
                  </Button>
                </form>
              </TabsContent>

              {/* Credentials Login */}
              <TabsContent value="credentials" className="space-y-4">
                <form onSubmit={handleCredentialLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Admin Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="admin@gametradex.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="bg-background border-border focus:border-primary focus:ring-primary/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="bg-background border-border focus:border-primary focus:ring-primary/20"
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full btn-primary" 
                    disabled={isLoading}
                  >
                    {isLoading ? 'Verifying...' : 'Access Dashboard'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            <div className="mt-6 p-4 bg-muted/50 rounded-lg border border-primary/20 shadow-glow-sm">
              <h4 className="font-semibold text-sm mb-2 text-primary">Demo Credentials:</h4>
              <div className="text-xs text-muted-foreground space-y-1">
                <p><strong className="text-primary">Admin Key:</strong> GAMETRADEX_ADMIN_2024</p>
                <p><strong className="text-primary">Email:</strong> admin@gametradex.com</p>
                <p><strong className="text-primary">Password:</strong> admin123</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminLogin;
