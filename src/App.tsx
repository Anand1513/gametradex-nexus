import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster as HotToaster } from "react-hot-toast";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminProtectedRoute from "./components/AdminProtectedRoute";
import Home from "./pages/Home";
import Browse from "./pages/Browse";
import ListingDetail from "./pages/ListingDetail";
import Sell from "./pages/Sell";
import Inquiry from "./pages/Inquiry";
import Contact from "./pages/Contact";
import Bidding from "./pages/Bidding";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Admin from "./pages/Admin";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminActivity from "./pages/AdminActivity";
import Dashboard from "./pages/Dashboard";
import SellerDashboard from "./pages/SellerDashboard";
import Success from "./pages/Success";
import TermsOfService from "./pages/legal/TermsOfService";
import PrivacyPolicy from "./pages/legal/PrivacyPolicy";
import RefundPolicy from "./pages/legal/RefundPolicy";
import DisputeResolution from "./pages/legal/DisputeResolution";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
          <Toaster />
          <Sonner />
          <HotToaster position="top-right" />
          <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-1 pt-16">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/browse" element={<Browse />} />
                <Route path="/success" element={<Success />} />
                <Route path="/listing/:id" element={<ListingDetail />} />
                <Route path="/sell" element={
                  <ProtectedRoute requireAuth requireSeller>
                    <Sell />
                  </ProtectedRoute>
                } />
                <Route path="/inquiry" element={
                  <ProtectedRoute requireAuth>
                    <Inquiry />
                  </ProtectedRoute>
                } />
                <Route path="/contact" element={<Contact />} />
                <Route path="/bidding" element={
                  <ProtectedRoute requireAuth>
                    <Bidding />
                  </ProtectedRoute>
                } />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/admin" element={
                  <ProtectedRoute requireAuth requireAdmin>
                    <Admin />
                  </ProtectedRoute>
                } />
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin/dashboard" element={
                  <AdminProtectedRoute>
                    <AdminDashboard />
                  </AdminProtectedRoute>
                } />
                <Route path="/admin/activity" element={
                  <AdminProtectedRoute>
                    <AdminActivity />
                  </AdminProtectedRoute>
                } />
                <Route path="/dashboard" element={
                  <ProtectedRoute requireAuth>
                    <Dashboard />
                  </ProtectedRoute>
                } />
                <Route path="/sell-account" element={
                  <ProtectedRoute requireAuth requireSeller>
                    <SellerDashboard />
                  </ProtectedRoute>
                } />
                <Route path="/legal/terms" element={<TermsOfService />} />
                <Route path="/legal/privacy" element={<PrivacyPolicy />} />
                <Route path="/legal/refund" element={<RefundPolicy />} />
                <Route path="/legal/disputes" element={<DisputeResolution />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
