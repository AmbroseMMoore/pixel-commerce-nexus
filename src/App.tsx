
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { queryClient } from "@/lib/queryClient";

// Customer Pages
import Index from "./pages/Index";
import ProductDetailsPage from "./pages/ProductDetailsPage";
import CategoryPage from "./pages/CategoryPage";
import CartPage from "./pages/CartPage";
import AuthPage from "./pages/AuthPage";
import CheckoutPage from "./pages/CheckoutPage";
import ContactPage from "./pages/ContactPage";
import SearchPage from "./pages/SearchPage";
import FAQPage from "./pages/FAQPage";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";
import ShippingPolicyPage from "./pages/ShippingPolicyPage";
import TermsConditionsPage from "./pages/TermsConditionsPage";
import CancellationRefundPage from "./pages/CancellationRefundPage";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminSubCategories from "./pages/admin/AdminSubCategories";
import AdminCustomers from "./pages/admin/AdminCustomers";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminCMS from "./pages/admin/AdminCMS";
import AdminProductForm from "./pages/admin/AdminProductForm";
import AdminSettings from "./pages/admin/AdminSettings";

// Common Pages
import NotFound from "./pages/NotFound";
import ProfilePage from "./pages/ProfilePage";

// Auth Provider
import { AuthProvider } from "./contexts/AuthContext";

// Admin Protected Route
import AdminProtectedRoute from "./components/admin/AdminProtectedRoute";

// Logout Component
import AdminLogout from "./pages/admin/AdminLogout";

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
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/faq" element={<FAQPage />} />
            <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
            <Route path="/shipping-policy" element={<ShippingPolicyPage />} />
            <Route path="/terms-conditions" element={<TermsConditionsPage />} />
            <Route path="/cancellation-refund" element={<CancellationRefundPage />} />
            
            {/* Legacy routes redirects */}
            <Route path="/login" element={<Navigate to="/auth" replace />} />
            <Route path="/shipping" element={<Navigate to="/shipping-policy" replace />} />
            <Route path="/terms" element={<Navigate to="/terms-conditions" replace />} />
            
            {/* Logout routes */}
            <Route path="/logout" element={<AdminLogout />} />
            <Route path="/admin/logout" element={<AdminLogout />} />
            
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
            <Route path="/admin/settings" element={
              <AdminProtectedRoute>
                <AdminSettings />
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
