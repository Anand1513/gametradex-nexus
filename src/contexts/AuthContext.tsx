import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, USE_DUMMY_AUTH, dummyDB } from '@/lib/firebase';
import toast from 'react-hot-toast';

// Token expiration time (2 hours in milliseconds)
const TOKEN_EXPIRY = 2 * 60 * 60 * 1000;

// Dummy credentials
export const DUMMY_CREDENTIALS = {
  admin: { email: 'admin@example.com', password: 'admin123' },
  seller: { email: 'seller@example.com', password: 'seller123' },
  buyer: { email: 'buyer@example.com', password: 'buyer123' }
};

interface UserData {
  uid: string;
  name: string;
  email: string;
  role: 'admin' | 'seller' | 'buyer';
  createdAt: Date;
}

interface AuthContextType {
  user: User | null;
  userData: UserData | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string, role?: 'seller' | 'buyer') => Promise<void>;
  logout: () => Promise<void>;
  isAdmin: boolean;
  isSeller: boolean;
  isBuyer: boolean;
  isDummyAuth: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  // Check for dummy auth token on mount
  useEffect(() => {
    const checkDummyAuth = () => {
      if (USE_DUMMY_AUTH) {
        const dummyToken = localStorage.getItem('dummyAuthToken');
        if (dummyToken) {
          try {
            const tokenData = JSON.parse(dummyToken);
            // Check if token is still valid
            if (tokenData.expiry > Date.now()) {
              // Find user in dummy DB
              const dummyUser = dummyDB.users.find(u => u.uid === tokenData.uid);
              if (dummyUser) {
                // Create a pseudo Firebase User object
                const pseudoUser = {
                  uid: dummyUser.uid,
                  email: dummyUser.email,
                  displayName: dummyUser.name,
                } as User;
                
                setUser(pseudoUser);
                setUserData(dummyUser as UserData);
              }
            } else {
              // Token expired, remove it
              localStorage.removeItem('dummyAuthToken');
            }
          } catch (error) {
            console.error('Error parsing dummy auth token:', error);
            localStorage.removeItem('dummyAuthToken');
          }
        }
        setLoading(false);
        return;
      }
      
      // If not using dummy auth, proceed with Firebase auth
      if (auth) {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
          if (user) {
            setUser(user);
            // Fetch user data from Firestore
            try {
              const userDoc = await getDoc(doc(db, 'users', user.uid));
              if (userDoc.exists()) {
                setUserData(userDoc.data() as UserData);
              }
            } catch (error) {
              console.error('Error fetching user data:', error);
            }
          } else {
            setUser(null);
            setUserData(null);
          }
          setLoading(false);
        });
        return () => unsubscribe();
      } else {
        setLoading(false);
      }
    };
    
    checkDummyAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      // Check if using dummy auth
      if (USE_DUMMY_AUTH) {
        // Check if credentials match any dummy user
        let isValidCredential = false;
        let userRole = '';
        
        // Check admin credentials
        if (email === DUMMY_CREDENTIALS.admin.email && password === DUMMY_CREDENTIALS.admin.password) {
          isValidCredential = true;
          userRole = 'admin';
        }
        // Check seller credentials
        else if (email === DUMMY_CREDENTIALS.seller.email && password === DUMMY_CREDENTIALS.seller.password) {
          isValidCredential = true;
          userRole = 'seller';
        }
        // Check buyer credentials
        else if (email === DUMMY_CREDENTIALS.buyer.email && password === DUMMY_CREDENTIALS.buyer.password) {
          isValidCredential = true;
          userRole = 'buyer';
        }
        
        if (isValidCredential) {
          const dummyUser = dummyDB.users.find(u => u.email === email);
          
          if (dummyUser) {
            // Create token with expiry
            const token = {
              uid: dummyUser.uid,
              email: dummyUser.email,
              role: dummyUser.role,
              expiry: Date.now() + TOKEN_EXPIRY
            };
            
            // Store token in localStorage
            localStorage.setItem('dummyAuthToken', JSON.stringify(token));
            
            // Set user state
            const pseudoUser = {
              uid: dummyUser.uid,
              email: dummyUser.email,
              displayName: dummyUser.name,
            } as User;
            
            setUser(pseudoUser);
            setUserData(dummyUser as UserData);
            
            // Role-based redirection
            switch (userRole) {
              case 'admin':
                window.location.href = '/admin';
                break;
              case 'seller':
                window.location.href = '/sell';
                break;
              case 'buyer':
                window.location.href = '/browse';
                break;
              default:
                window.location.href = '/browse';
            }
            
            toast.success('Login successful!');
            return;
          }
        }
        
        throw new Error('Invalid credentials');
      }
      
      // If not using dummy auth, proceed with Firebase auth
      if (!auth) {
        throw new Error('Firebase auth not initialized');
      }
      
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Fetch user data
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data() as UserData;
        setUserData(userData);
        
        // Redirect based on role
        if (userData.role === 'admin') {
          window.location.href = '/admin';
        } else if (userData.role === 'seller') {
          window.location.href = '/sell';
        } else {
          window.location.href = '/browse';
        }
        
        toast.success('Login successful!');
      }
    } catch (error: any) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      if (USE_DUMMY_AUTH) {
        // Clear dummy auth token
        localStorage.removeItem('dummyAuthToken');
        setUser(null);
        setUserData(null);
        window.location.href = '/';
        toast.success('Logged out successfully');
        return;
      }
      
      if (auth) {
        await signOut(auth);
        toast.success('Logged out successfully');
      }
    } catch (error: any) {
      toast.error(error.message || 'Logout failed');
    }
  };

  const signup = async (name: string, email: string, password: string, role: 'seller' | 'buyer' = 'buyer') => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Create user document in Firestore
      const userData: UserData = {
        uid: user.uid,
        name,
        email,
        role,
        createdAt: new Date()
      };
      
      await setDoc(doc(db, 'users', user.uid), userData);
      setUserData(userData);
      
      // Redirect based on role
      if (role === 'seller') {
        window.location.href = '/sell';
      } else {
        window.location.href = '/browse';
      }
      
      toast.success('Account created successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Signup failed');
      throw error;
    }
  };

  // Logout function is already defined above

  const value = {
    user,
    userData,
    loading,
    login,
    signup,
    logout,
    isAdmin: userData?.role === 'admin',
    isSeller: userData?.role === 'seller' || userData?.role === 'admin',
    isBuyer: userData?.role === 'buyer' || userData?.role === 'admin',
    isDummyAuth: USE_DUMMY_AUTH
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
