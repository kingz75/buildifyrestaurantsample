import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { subscribeToMenu, subscribeToCategories } from "../../utils/storage";
import { useCart } from "../../context/CartContext";

export default function PublicMenu() {
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");
  const { addToCart, cart, cartTotal } = useCart();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubMenu = subscribeToMenu((items) => {
      setMenuItems(items);
      setLoading(false);
    });
    const unsubCats = subscribeToCategories((cats) => {
      setCategories(cats);
    });
    return () => {
      unsubMenu();
      unsubCats();
    };
  }, []);

  const categoryList = useMemo(() => {
    const fromMenu = Array.from(
      new Set(menuItems.map((i) => i.category).filter(Boolean)),
    );
    const merged = Array.from(new Set([...categories, ...fromMenu]));
    return merged.includes("All") ? merged : ["All", ...merged];
  }, [menuItems, categories]);

  const filteredItems = menuItems.filter((item) => {
    const matchesCategory =
      activeCategory === "All" || item.category === activeCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.desc?.toLowerCase().includes(search.toLowerCase());
    return item.available && matchesCategory && matchesSearch;
  });

  const getItemQty = (id) => {
    const item = cart.find((i) => i.id === id);
    return item ? item.qty : 0;
  };

  return (
    <div className="menu-page">
      <header className="menu-header">
        <h1>Our Menu</h1>
        <p>Explore our curated selection of fine dishes</p>

        <div className="search-bar">
          <input
            type="text"
            placeholder="Search for dishes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </header>

      <div className="menu-container">
        <aside className="menu-sidebar">
          <h3>Categories</h3>
          <div className="category-list">
            {categoryList.map((cat) => (
              <button
                key={cat}
                className={`category-btn ${activeCategory === cat ? "active" : ""}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </aside>

        <main className="menu-main">
          {loading ? (
            <div className="menu-loading">Loading delicious items...</div>
          ) : filteredItems.length > 0 ? (
            <div className="items-grid">
              {filteredItems.map((item) => (
                <div key={item.id} className="menu-item-card">
                  <div className="item-image">
                    {item.image &&
                    (item.image.startsWith("http") ||
                      item.image.startsWith("data:")) ? (
                      <img src={item.image} alt={item.name} />
                    ) : (
                      <div className="emoji-placeholder">
                        {item.image || "🍴"}
                      </div>
                    )}
                  </div>
                  <div className="item-info">
                    <div className="item-top">
                      <h4>{item.name}</h4>
                      <span className="item-price">
                        ₦{item.price?.toLocaleString()}
                      </span>
                    </div>
                    <p className="item-desc">{item.desc}</p>
                    <div className="item-bottom">
                      <div className="item-tags">
                        {item.tags?.map((tag) => (
                          <span key={tag} className="tag">
                            {tag}
                          </span>
                        ))}
                      </div>
                      <div className="item-actions">
                        {getItemQty(item.id) > 0 && (
                          <span className="qty-badge">
                            {getItemQty(item.id)} in cart
                          </span>
                        )}
                        <button
                          className="add-to-cart-btn"
                          onClick={() => addToCart(item)}
                        >
                          Add to Cart
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-items">
              <h3>No items found</h3>
              <p>Try adjusting your search or category filter.</p>
            </div>
          )}
        </main>
      </div>

      {/* Sticky Cart Bar — appears when items are in cart */}
      {cart.length > 0 && (
        <Link to="/cart" className="sticky-cart-bar">
          <div className="sticky-cart-info">
            <span className="sticky-cart-count">
              {cart.reduce((s, i) => s + i.qty, 0)} items
            </span>
            <span className="sticky-cart-total">
              ₦{cartTotal.toLocaleString()}
            </span>
          </div>
          <span className="sticky-cart-action">View Cart →</span>
        </Link>
      )}

      <style>{`
        .menu-page {
          padding: 60px 24px;
          max-width: 1400px;
          margin: 0 auto;
          padding-bottom: ${cart.length > 0 ? '100px' : '60px'};
        }
        .menu-header {
          text-align: center;
          margin-bottom: 60px;
        }
        .menu-header h1 {
          font-family: var(--font-display);
          font-size: 48px;
          margin-bottom: 12px;
          color: var(--white);
        }
        .menu-header p {
          color: var(--text-muted);
          font-size: 18px;
          margin-bottom: 32px;
        }
        .search-bar {
          max-width: 600px;
          margin: 0 auto;
        }
        .search-bar input {
          width: 100%;
          background: var(--bg-card);
          border: 1px solid rgba(255,255,255,0.1);
          color: white;
          padding: 16px 24px;
          border-radius: 30px;
          font-size: 16px;
          outline: none;
          transition: border-color 0.3s;
        }
        .search-bar input:focus {
          border-color: var(--primary);
        }

        .menu-container {
          display: grid;
          grid-template-columns: 240px 1fr;
          gap: 40px;
        }
        
        .menu-sidebar h3 {
          font-family: var(--font-display);
          font-size: 20px;
          margin-bottom: 24px;
          color: var(--white);
        }
        .category-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .category-btn {
          text-align: left;
          background: transparent;
          border: none;
          color: var(--text-muted);
          padding: 12px 16px;
          border-radius: 12px;
          cursor: pointer;
          font-size: 15px;
          transition: all 0.2s;
        }
        .category-btn:hover {
          background: rgba(255,255,255,0.05);
          color: var(--white);
        }
        .category-btn.active {
          background: var(--primary);
          color: white;
          font-weight: 600;
        }

        .items-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 24px;
        }
        .menu-item-card {
          background: var(--bg-card);
          border-radius: 20px;
          overflow: hidden;
          border: 1px solid rgba(255,255,255,0.05);
          display: flex;
          flex-direction: column;
        }
        .item-image {
          height: 200px;
          background: #222;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .item-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .item-info {
          padding: 20px;
          flex: 1;
          display: flex;
          flex-direction: column;
        }
        .item-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 12px;
        }
        .item-top h4 {
          font-size: 18px;
          color: var(--white);
        }
        .item-price {
          color: var(--primary);
          font-weight: 700;
        }
        .item-desc {
          font-size: 14px;
          color: var(--text-muted);
          line-height: 1.5;
          margin-bottom: 16px;
          flex: 1;
        }
        .item-bottom {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .item-tags {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }
        .tag {
          font-size: 10px;
          background: rgba(255,255,255,0.05);
          color: var(--text-muted);
          padding: 4px 10px;
          border-radius: 10px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .item-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .qty-badge {
          font-size: 12px;
          color: var(--primary);
          font-weight: 600;
        }
        .add-to-cart-btn {
          background: var(--primary);
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 12px;
          font-weight: 600;
          font-family: inherit;
          cursor: pointer;
          transition: background 0.2s;
        }
        .add-to-cart-btn:hover {
          background: var(--primary-hover);
        }

        .menu-loading, .no-items {
          text-align: center;
          padding: 80px 0;
          color: var(--text-muted);
        }

        @media (max-width: 900px) {
          .menu-container {
            grid-template-columns: 1fr;
          }
          .menu-sidebar {
            display: none;
          }
        }

        /* Sticky Cart Bar — CustomerApp style */
        .sticky-cart-bar {
          position: fixed;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 100%;
          max-width: 520px;
          background: var(--primary, #c17f2a);
          padding: 16px 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          z-index: 999;
          text-decoration: none;
          box-shadow: 0 -4px 20px rgba(0,0,0,0.3);
          animation: slideUpCart 0.35s cubic-bezier(0.16, 1, 0.3, 1);
          border-radius: 16px 16px 0 0;
        }
        @keyframes slideUpCart {
          from { transform: translateX(-50%) translateY(100%); opacity: 0; }
          to   { transform: translateX(-50%) translateY(0);    opacity: 1; }
        }
        .sticky-cart-info {
          color: #fff;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .sticky-cart-count {
          font-weight: 700;
          font-size: 15px;
        }
        .sticky-cart-total {
          opacity: 0.9;
          font-size: 15px;
        }
        .sticky-cart-action {
          background: #fff;
          color: var(--primary, #c17f2a);
          border: none;
          padding: 10px 22px;
          border-radius: 24px;
          font-weight: 700;
          font-size: 14px;
          cursor: pointer;
          font-family: inherit;
          transition: transform 0.2s, box-shadow 0.2s;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .sticky-cart-bar:hover .sticky-cart-action {
          transform: scale(1.04);
          box-shadow: 0 4px 14px rgba(0,0,0,0.15);
        }

        @media (max-width: 520px) {
          .sticky-cart-bar {
            max-width: 100%;
            border-radius: 0;
          }
        }
      `}</style>
    </div>
  );
}
