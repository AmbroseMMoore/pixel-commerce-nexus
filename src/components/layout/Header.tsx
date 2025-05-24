
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, ShoppingCart, User, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/contexts/AuthContext";

// Using the uploaded CuteBae logo
const logoImage = "/lovable-uploads/c6e052b5-993b-4562-beed-1f882a5a2880.png";

// Updated categories to match the requested categories
const categories = [
  { id: "1", name: "Boys", slug: "boys" },
  { id: "2", name: "Girls", slug: "girls" },
  { id: "3", name: "Toys", slug: "toys" },
  { id: "4", name: "Shoes", slug: "shoes" },
  { id: "5", name: "Accessories", slug: "accessories" },
  { id: "6", name: "New Born", slug: "new-born" },
];

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const { cartCount } = useCart();
  const { user } = useAuth();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
    }
  };

  const handleAuthClick = () => {
    if (user) {
      navigate('/profile');
    } else {
      navigate('/auth');
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="container-custom py-4">
        <div className="flex items-center justify-between">
          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
              className="text-custom-purple hover:text-custom-pink"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </Button>
          </div>

          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center">
              <img 
                src={logoImage} 
                alt="CuteBae Logo" 
                className="h-10 w-auto"
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {categories.map((category) => (
              <Link
                key={category.id}
                to={`/category/${category.slug}`}
                className="text-gray-600 hover:text-custom-purple font-quicksand font-medium transition-colors"
              >
                {category.name}
              </Link>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center space-x-4">
            <form onSubmit={handleSearchSubmit} className="relative hidden sm:block">
              <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="search"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-custom-purple"
              />
            </form>

            <Button 
              variant="ghost" 
              size="icon" 
              aria-label="Account"
              className="text-custom-purple hover:text-custom-pink hidden sm:block"
              onClick={handleAuthClick}
            >
              <User size={20} />
            </Button>

            <Link to="/cart" className="relative">
              <Button 
                variant="ghost" 
                size="icon" 
                aria-label="Cart"
                className="text-custom-purple hover:text-custom-pink"
              >
                <ShoppingCart size={20} />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-custom-pink text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 animate-slide-in">
          <div className="container-custom py-4 space-y-4">
            <form onSubmit={handleSearchSubmit} className="relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="search"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-custom-purple"
              />
            </form>
            {categories.map((category) => (
              <Link
                key={category.id}
                to={`/category/${category.slug}`}
                className="block text-gray-600 py-2 border-b border-gray-100"
                onClick={() => setIsMenuOpen(false)}
              >
                {category.name}
              </Link>
            ))}
            <button
              onClick={() => {
                handleAuthClick();
                setIsMenuOpen(false);
              }}
              className="flex items-center text-gray-600 py-2"
            >
              <User size={18} className="mr-2" />
              <span>{user ? 'Profile' : 'Login'}</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
