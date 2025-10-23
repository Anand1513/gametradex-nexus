import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Environment variables
export const USE_DUMMY_AUTH = import.meta.env.VITE_REACT_APP_USE_DUMMY_AUTH === 'true';
const FIREBASE_API_KEY = import.meta.env.VITE_REACT_APP_FIREBASE_API_KEY;

// Dummy DB for testing without Firebase
export const dummyDB = {
  users: [
    {
      uid: 'admin-user-123',
      name: 'Admin User',
      email: 'admin@example.com',
      role: 'admin',
      createdAt: new Date()
    },
    {
      uid: 'seller-user-123',
      name: 'Seller User',
      email: 'seller@example.com',
      role: 'seller',
      createdAt: new Date()
    },
    {
      uid: 'buyer-user-123',
      name: 'Buyer User',
      email: 'buyer@example.com',
      role: 'buyer',
      createdAt: new Date()
    }
  ],
  // Add other collections as needed
};

let app;
let auth;
let db;

// Only initialize Firebase if API key is set and dummy auth is disabled
if (FIREBASE_API_KEY && !USE_DUMMY_AUTH) {
  // Firebase configuration
  const firebaseConfig = {
    apiKey: FIREBASE_API_KEY,
    authDomain: "gametradex-demo.firebaseapp.com",
    projectId: "gametradex-demo",
    storageBucket: "gametradex-demo.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abcdef123456"
  };

  // Initialize Firebase
  app = initializeApp(firebaseConfig);

  // Initialize Firebase Authentication and get a reference to the service
  auth = getAuth(app);

  // Initialize Cloud Firestore and get a reference to the service
  db = getFirestore(app);
}

export { app, auth, db };
