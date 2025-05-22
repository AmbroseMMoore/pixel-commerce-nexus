
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Search, ShoppingCart, User, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { categories } from "@/data/mockData";

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
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </Button>
          </div>

          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="text-2xl font-bold text-brand">
              EcoShop
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {categories.map((category) => (
              <Link
                key={category.id}
                to={`/category/${category.slug}`}
                className="text-gray-600 hover:text-brand font-medium transition-colors"
              >
                {category.name}
              </Link>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" aria-label="Search">
              <Search size={20} />
            </Button>

            <Link to="/account" className="hidden sm:block">
              <Button variant="ghost" size="icon" aria-label="Account">
                <User size={20} />
              </Button>
            </Link>

            <Link to="/cart" className="relative">
              <Button variant="ghost" size="icon" aria-label="Cart">
                <ShoppingCart size={20} />
                {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-brand text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
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
