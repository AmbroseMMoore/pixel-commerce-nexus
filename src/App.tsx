
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Customer Pages
import Index from "./pages/Index";
import ProductDetailsPage from "./pages/ProductDetailsPage";
import CategoryPage from "./pages/CategoryPage";
import CartPage from "./pages/CartPage";
import LoginPage from "./pages/LoginPage";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";

// Common Pages
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
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
          
          {/* Admin Routes */}
          <Route path="/admin" element={<AdminDashboard />} />
          
          {/* Catch-All Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
