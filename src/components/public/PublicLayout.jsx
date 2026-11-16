import { Link, Outlet, useLocation } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useState } from "react";
import "../../styles/public.css";

export default function PublicLayout() {
  const { cartCount } = useCart();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  return (
    <div className="public-container">
      <nav className="public-navbar">
        <Link to="/" className="nav-logo">
          🍽️ Grand Table
        </Link>
        
        {/* Mobile Hamburger - visible only on mobile */}
        <button 
          className="hamburger-btn"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          <span className={`hamburger-icon ${mobileMenuOpen ? 'open' : ''}`}>
            <span></span>
            <span></span>
            <span></span>
          </span>
        </button>

        {/* Desktop Nav Links */}
        <div className="nav-links">
          <Link to="/" className={`nav-link ${isActive("/") ? "active" : ""}`}>
            Home
          </Link>
          <Link to="/menu" className={`nav-link ${isActive("/menu") ? "active" : ""}`}>
            Menu
          </Link>
          <Link to="/track" className={`nav-link ${isActive("/track") ? "active" : ""}`}>
            Track Order
          </Link>
        </div>
        
        {/* Desktop Nav Actions */}
        <div className="nav-actions">
          <Link to="/login/admin" className="signin-btn">
            Sign In
          </Link>
          <Link to="/cart" className="cart-icon-btn">
            🛒
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </Link>
        </div>

        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
          <div className="mobile-menu">
            <div className="mobile-menu-content">
              <Link to="/" className={`mobile-nav-link ${isActive("/") ? "active" : ""}`} onClick={() => setMobileMenuOpen(false)}>
                Home
              </Link>
              <Link to="/menu" className={`mobile-nav-link ${isActive("/menu") ? "active" : ""}`} onClick={() => setMobileMenuOpen(false)}>
                Menu
              </Link>
              <Link to="/track" className={`mobile-nav-link ${isActive("/track") ? "active" : ""}`} onClick={() => setMobileMenuOpen(false)}>
                Track Order
              </Link>
              <Link to="/login/admin" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
                Sign In
              </Link>
            </div>
          </div>
        )}
      </nav>

      <main className="page-content">
        <Outlet />
      </main>

      <footer className="public-footer">
        <div className="footer-content">
          <div className="footer-section">
            <h4>Grand Table</h4>
            <p>Fine dining experience delivered straight to your door. Fresh ingredients, legendary taste.</p>
          </div>
          <div className="footer-section">
            <h4>Quick Links</h4>
            <Link to="/">Home</Link>
            <Link to="/menu">Our Menu</Link>
            <Link to="/cart">Cart</Link>
            <Link to="/login/admin">Staff Portal</Link>
            <Link to="/login/kitchen">Kitchen Display</Link>
          </div>
          <div className="footer-section">
            <h4>Contact Us</h4>
            <p>123 Gourmet Street, Lagos, Nigeria</p>
            <p>+234 800 123 4567</p>
            <p>hello@grandtable.com</p>
          </div>
          <div className="footer-section">
            <h4>Hours</h4>
            <p>Mon-Fri: 11am - 10pm</p>
            <p>Sat-Sun: 9am - 11pm</p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2026 Grand Table Restaurant. All rights reserved.</p>
          <div style={{ display: "flex", gap: "20px" }}>
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
