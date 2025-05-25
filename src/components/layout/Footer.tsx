
import React from "react";
import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, Facebook, Instagram, Twitter } from "lucide-react";

const Footer = () => {
  return (
    <footer className="pt-12 pb-6" style={{ backgroundColor: '#F0F0F0', color: '#353535' }}>
      <div className="container-custom">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Shop Info */}
          <div>
            <h3 className="text-xl font-bold mb-4" style={{ color: '#353535' }}>CuteBae</h3>
            <p className="mb-4" style={{ color: '#353535' }}>
              Your one-stop destination for sustainable and stylish products.
            </p>
            <div className="flex space-x-4">
              <a 
                href="#" 
                className="transition-colors hover:opacity-70"
                style={{ color: '#353535' }}
                aria-label="Facebook"
              >
                <Facebook size={20} />
              </a>
              <a 
                href="#" 
                className="transition-colors hover:opacity-70"
                style={{ color: '#353535' }}
                aria-label="Instagram"
              >
                <Instagram size={20} />
              </a>
              <a 
                href="#" 
                className="transition-colors hover:opacity-70"
                style={{ color: '#353535' }}
                aria-label="Twitter"
              >
                <Twitter size={20} />
              </a>
            </div>
          </div>

          {/* Shop Categories */}
          <div>
            <h3 className="text-lg font-semibold mb-4" style={{ color: '#353535' }}>Shop Categories</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/category/boys" className="hover:opacity-70 transition-colors" style={{ color: '#353535' }}>
                  Boys
                </Link>
              </li>
              <li>
                <Link to="/category/girls" className="hover:opacity-70 transition-colors" style={{ color: '#353535' }}>
                  Girls
                </Link>
              </li>
              <li>
                <Link to="/category/toys" className="hover:opacity-70 transition-colors" style={{ color: '#353535' }}>
                  Toys
                </Link>
              </li>
              <li>
                <Link to="/category/shoes" className="hover:opacity-70 transition-colors" style={{ color: '#353535' }}>
                  Shoes
                </Link>
              </li>
              <li>
                <Link to="/category/accessories" className="hover:opacity-70 transition-colors" style={{ color: '#353535' }}>
                  Accessories
                </Link>
              </li>
              <li>
                <Link to="/category/new-born" className="hover:opacity-70 transition-colors" style={{ color: '#353535' }}>
                  New Born
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="text-lg font-semibold mb-4" style={{ color: '#353535' }}>Customer Service</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/contact" className="hover:opacity-70 transition-colors" style={{ color: '#353535' }}>
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/faq" className="hover:opacity-70 transition-colors" style={{ color: '#353535' }}>
                  FAQ
                </Link>
              </li>
              <li>
                <Link to="/shipping" className="hover:opacity-70 transition-colors" style={{ color: '#353535' }}>
                  Shipping & Returns
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:opacity-70 transition-colors" style={{ color: '#353535' }}>
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link to="/admin" className="font-semibold hover:opacity-70 transition-colors" style={{ color: '#712D8F' }}>
                  Admin Panel
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4" style={{ color: '#353535' }}>Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <MapPin size={18} className="mr-2 mt-1 flex-shrink-0" style={{ color: '#353535' }} />
                <span style={{ color: '#353535' }}>
                  123 CuteBae Street, Fashion City, 
                  <br />CB 12345
                </span>
              </li>
              <li className="flex items-center">
                <Phone size={18} className="mr-2 flex-shrink-0" style={{ color: '#353535' }} />
                <span style={{ color: '#353535' }}>(123) 456-7890</span>
              </li>
              <li className="flex items-center">
                <Mail size={18} className="mr-2 flex-shrink-0" style={{ color: '#353535' }} />
                <span style={{ color: '#353535' }}>support@cutebae.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t mt-10 pt-6 text-center text-sm" style={{ borderColor: '#353535', color: '#353535' }}>
          <p>&copy; {new Date().getFullYear()} CuteBae. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
