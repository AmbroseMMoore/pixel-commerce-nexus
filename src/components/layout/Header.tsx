
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Search, ShoppingCart, User, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { categories } from "@/data/mockData";

// Default logo image - replace with your actual image when uploaded
const logoImage = "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [cartItemCount, setCartItemCount] = useState(0);

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
            <Link to="/" className="text-2xl font-dela-gothic text-custom-purple flex items-center">
              <img 
                src={logoImage} 
                alt="EcoShop Logo" 
                className="h-10 w-auto mr-2 object-contain"
              />
              <span>EcoShop</span>
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
            <Button 
              variant="ghost" 
              size="icon" 
              aria-label="Search" 
              className="text-custom-purple hover:text-custom-pink"
            >
              <Search size={20} />
            </Button>

            <Link to="/account" className="hidden sm:block">
              <Button 
                variant="ghost" 
                size="icon" 
                aria-label="Account"
                className="text-custom-purple hover:text-custom-pink"
              >
                <User size={20} />
              </Button>
            </Link>

            <Link to="/cart" className="relative">
              <Button 
                variant="ghost" 
                size="icon" 
                aria-label="Cart"
                className="text-custom-purple hover:text-custom-pink"
              >
                <ShoppingCart size={20} />
                {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-custom-pink text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {cartItemCount}
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
            <Link
              to="/account"
              className="flex items-center text-gray-600 py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              <User size={18} className="mr-2" />
              <span>My Account</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
