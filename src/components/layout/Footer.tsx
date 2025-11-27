import React from "react";
import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, Facebook, Instagram, Twitter, MessageCircle } from "lucide-react";

const Footer = () => {
  return (
    <footer className="pt-12 pb-6" style={{ backgroundColor: "#EAE6D3", color: "#353535" }}>
      <div className="container-custom">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Shop Info */}
          <div>
            <h3 className="text-xl font-bold mb-4" style={{ color: "#353535" }}>
              CuteBae
            </h3>
            <p className="mb-4" style={{ color: "#353535" }}>
              Your one-stop destination for sustainable and stylish products.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://www.facebook.com/p/cutebaein-61566951735246/ "
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:opacity-70"
                style={{ color: "#353535" }}
                aria-label="Facebook"
              >
                <Facebook size={20} />
              </a>
              <a
                href="https://www.instagram.com/cutebae.in/"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:opacity-70"
                style={{ color: "#353535" }}
                aria-label="Instagram"
              >
                <Instagram size={20} />
              </a>
              <a
                href="https://wa.me/919585851570"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:opacity-70"
                style={{ color: "#353535" }}
                aria-label="WhatsApp"
              >
                <MessageCircle size={20} />
              </a>
            </div>
          </div>

          {/* Shop Categories */}
          <div>
            <h3 className="text-lg font-semibold mb-4" style={{ color: "#353535" }}>
              Shop Categories
            </h3>
            <ul className="space-y-2">
              <li>
                <Link to="/category/boys" className="hover:opacity-70 transition-colors" style={{ color: "#353535" }}>
                  Boys
                </Link>
              </li>
              <li>
                <Link to="/category/girls" className="hover:opacity-70 transition-colors" style={{ color: "#353535" }}>
                  Girls
                </Link>
              </li>
              <li>
                <Link to="/category/toys" className="hover:opacity-70 transition-colors" style={{ color: "#353535" }}>
                  Toys
                </Link>
              </li>
              <li>
                <Link to="/category/shoes" className="hover:opacity-70 transition-colors" style={{ color: "#353535" }}>
                  Shoes
                </Link>
              </li>
              <li>
                <Link
                  to="/category/accessories"
                  className="hover:opacity-70 transition-colors"
                  style={{ color: "#353535" }}
                >
                  Accessories
                </Link>
              </li>
              <li>
                <Link
                  to="/category/new-born"
                  className="hover:opacity-70 transition-colors"
                  style={{ color: "#353535" }}
                >
                  New Born
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="text-lg font-semibold mb-4" style={{ color: "#353535" }}>
              Customer Service
            </h3>
            <ul className="space-y-2">
              <li>
                <Link to="/contact" className="hover:opacity-70 transition-colors" style={{ color: "#353535" }}>
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/faq" className="hover:opacity-70 transition-colors" style={{ color: "#353535" }}>
                  FAQ
                </Link>
              </li>
              <li>
                <Link to="/shipping-policy" className="hover:opacity-70 transition-colors" style={{ color: "#353535" }}>
                  Shipping Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/cancellation-refund"
                  className="hover:opacity-70 transition-colors"
                  style={{ color: "#353535" }}
                >
                  Cancellation & Refund
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Policies */}
          <div>
            <h3 className="text-lg font-semibold mb-4" style={{ color: "#353535" }}>
              Legal & Policies
            </h3>
            <ul className="space-y-2">
              <li>
                <Link to="/privacy-policy" className="hover:opacity-70 transition-colors" style={{ color: "#353535" }}>
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/terms-conditions"
                  className="hover:opacity-70 transition-colors"
                  style={{ color: "#353535" }}
                >
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <div className="mt-4">
                  <h4 className="font-medium mb-2" style={{ color: "#353535" }}>
                    Contact Info
                  </h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex items-start">
                      <MapPin size={14} className="mr-2 mt-0.5 flex-shrink-0" style={{ color: "#353535" }} />
                      <span style={{ color: "#353535" }}>
                        No 66/1/1 G2, Rathinasingh kulam street, Arni Rd, opp. to Dinesh hospital, Vellore, Tamil Nadu
                        632001
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Phone size={14} className="mr-2" style={{ color: "#353535" }} />
                      <span style={{ color: "#353535" }}>+91 97878 73712</span>
                    </div>
                    <div className="flex items-center">
                      <Mail size={14} className="mr-2" style={{ color: "#353535" }} />
                      <span style={{ color: "#353535" }}>cutebae.in@gmail.com</span>
                    </div>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t mt-10 pt-6 text-center text-sm" style={{ borderColor: "#353535", color: "#353535" }}>
          <p>&copy; {new Date().getFullYear()} CuteBae. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
