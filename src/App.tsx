
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Customer Pages
import Index from "./pages/Index";
import ProductDetailsPage from "./pages/ProductDetailsPage";
import CategoryPage from "./pages/CategoryPage";
import CartPage from "./pages/CartPage";
import LoginPage from "./pages/LoginPage";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminSubCategories from "./pages/admin/AdminSubCategories";
import AdminCustomers from "./pages/admin/AdminCustomers";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminCMS from "./pages/admin/AdminCMS";
import AdminProductForm from "./pages/admin/AdminProductForm";

// Common Pages
import NotFound from "./pages/NotFound";
import ProfilePage from "./pages/ProfilePage";

// Auth Provider
import { AuthProvider } from "./contexts/AuthContext";
import { useEffect } from "react";
import { toast } from "sonner";

// Admin Protected Route
import AdminProtectedRoute from "./components/admin/AdminProtectedRoute";

// Logout Component
import AdminLogout from "./pages/admin/AdminLogout";

const queryClient = new QueryClient();

// Google Auth Callback Handler
const GoogleAuthCallback = () => {
  useEffect(() => {
    // In a real implementation, this would validate the auth code and get tokens
    // For demo, we'll simulate successful login
    const mockGoogleUser = {
      id: "google-user-1",
      name: "Google User",
      email: "google.user@example.com",
      isAdmin: false
    };
    
    // Store in localStorage to simulate auth
    localStorage.setItem("user", JSON.stringify(mockGoogleUser));
    
    toast.success("Successfully logged in with Google!");
  }, []);
  
  return <Navigate to="/profile" replace />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Customer-facing Routes */}
            <Route path="/" element={<Index />} />
            <Route path="/product/:slug" element={<ProductDetailsPage />} />
            <Route path="/category/:slug" element={<CategoryPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            
            {/* Auth callback routes */}
            <Route path="/auth/google/callback" element={<GoogleAuthCallback />} />
            
            {/* Logout route */}
            <Route path="/logout" element={<AdminLogout />} />
            
            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={
              <AdminProtectedRoute>
                <AdminDashboard />
              </AdminProtectedRoute>
            } />
            <Route path="/admin/products" element={
              <AdminProtectedRoute>
                <AdminProducts />
              </AdminProtectedRoute>
            } />
            <Route path="/admin/products/new" element={
              <AdminProtectedRoute>
                <AdminProductForm />
              </AdminProtectedRoute>
            } />
            <Route path="/admin/products/:id" element={
              <AdminProtectedRoute>
                <AdminProductForm />
              </AdminProtectedRoute>
            } />
            <Route path="/admin/subcategories" element={
              <AdminProtectedRoute>
                <AdminSubCategories />
              </AdminProtectedRoute>
            } />
            <Route path="/admin/customers" element={
              <AdminProtectedRoute>
                <AdminCustomers />
              </AdminProtectedRoute>
            } />
            <Route path="/admin/orders" element={
              <AdminProtectedRoute>
                <AdminOrders />
              </AdminProtectedRoute>
            } />
            <Route path="/admin/cms" element={
              <AdminProtectedRoute>
                <AdminCMS />
              </AdminProtectedRoute>
            } />
            
            {/* Catch-All Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
