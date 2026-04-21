import React, { createContext, useContext, useState, useMemo, useEffect, useCallback } from 'react';
import { BRANDS, CATEGORIES } from '../data/mockData'; // BRANDS/CATEGORIES still used by Shop & Admin filters
import { fetchMyProfile, fetchProducts, assetUrl } from '../services/api';

// ── localStorage helpers ────────────────────────────────────────────────────
const CART_KEY = 'glowup_cart';

const readCart = () => {
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const writeCart = (items) => {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  } catch {
    // quota exceeded or private mode — fail silently
  }
};

const AppContext = createContext();

export function AppProvider({ children }) {
  const [viewHistory, setViewHistory] = useState(['home']); // home, shop, detail, cart, checkout, profile, admin, login
  const view = viewHistory[viewHistory.length - 1];
  
  const setView = (newView) => {
    if (newView === view) return;
    setViewHistory(prev => [...prev, newView]);
  };

  const goBack = () => {
    setViewHistory(prev => prev.length > 1 ? prev.slice(0, -1) : prev);
  };

  const [selectedProduct, setSelectedProduct] = useState(null);
  // Products: start empty, load from backend on mount
  const [products, setProducts] = useState([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);

  // ── Cart: hydrated from localStorage, synced on every change ──
  const [cart, setCartRaw] = useState(() => readCart());

  // Wrap setCart so every mutation is immediately persisted
  const setCart = useCallback((updater) => {
    setCartRaw(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      writeCart(next);
      return next;
    });
  }, []);

  const [wishlist, setWishlist] = useState([]);
  // orders: managed inside OrderHistory.jsx (self-contained via API)
  // Checkout.jsx creates orders directly via createOrder() in api.js

  
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [sortOption, setSortOption] = useState("newest");
  const [user, setUser] = useState(null); 
  const [isLoadingUser, setIsLoadingUser] = useState(true); // true until first auth check settles
  const [isMember, setIsMember] = useState(false);

  // ── Bootstrap: restore session + load products in parallel on app mount ──
  useEffect(() => {
    // Check both localStorage (Remember Me: ON) and sessionStorage (Remember Me: OFF)
    const token = localStorage.getItem('glowup_token') || sessionStorage.getItem('glowup_token');

    // Auth restore
    const authPromise = token
      ? fetchMyProfile()
          .then(profileUser => {
            setUser(profileUser);
            setIsMember(profileUser.isMember || false);
          })
          .catch(() => {
            // Token expired / invalid — clear it silently
            localStorage.removeItem('glowup_token');
            sessionStorage.removeItem('glowup_token');
          })
          .finally(() => setIsLoadingUser(false))
      : Promise.resolve(setIsLoadingUser(false));

    // Products fetch (runs regardless of auth — public endpoint)
    const productsPromise = fetchProducts()
      .then(data => setProducts(data))
      .catch(() => {
        // Backend unreachable: keep empty list; UI shows empty state
      })
      .finally(() => setIsLoadingProducts(false));

    // Fire both in parallel; no need to await here 
    void authPromise;
    void productsPromise;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [profileTab, setProfileTab] = useState('Riwayat Pesanan');
  // addresses are now managed inside SavedAddresses.jsx (self-contained via API)
  const [priceRange, setPriceRange] = useState(1000000);
  const [selectedBrands, setSelectedBrands] = useState([]);


  // Notifications
  const [toast, setToast] = useState(null);
  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const logout = useCallback(() => {
    localStorage.removeItem('glowup_token');
    sessionStorage.removeItem('glowup_token');
    setUser(null);
    setIsMember(false);
    setView('login');
    showToast('Berhasil keluar!');
  }, []);

  const addToCart = useCallback((product) => {
    setCart(prev => {
      const exists = prev.find(item => item.id === product.id);
      if (exists) {
        return prev.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item);
      }
      return [...prev, { ...product, qty: 1 }];
    });
    showToast("Berhasil ditambahkan ke keranjang!");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setCart]);

  const toggleWishlist = (product) => {
    if (wishlist.find(p => p.id === product.id)) {
      setWishlist(wishlist.filter(p => p.id !== product.id));
    } else {
      setWishlist([...wishlist, product]);
    }
  };

  const filteredProducts = useMemo(() => {
    let result = products.filter(p => {
      // Handle both backend (p.Brand.name) and legacy/mock (p.brand) structures
      const pBrand = p.brand || p.Brand?.name || '';
      
      const productName = (p.name || '').toLowerCase();
      const productBrandSearch = pBrand.toLowerCase();
      
      const matchSearch = productName.includes(searchQuery.toLowerCase()) || productBrandSearch.includes(searchQuery.toLowerCase());
      // Robust category matching (trim + check both legacy and backend fields)
      const pCategory = (p.category || p.Category?.name || '').toString().trim();
      const matchCat = categoryFilter === "All" || pCategory.toLowerCase().trim() === categoryFilter.toLowerCase().trim();
      const matchPrice = p.price <= priceRange;
      const matchBrand = selectedBrands.length === 0 || selectedBrands.includes(pBrand);
      
      return matchSearch && matchCat && matchPrice && matchBrand;
    });

    if (sortOption === "price-asc") result.sort((a, b) => a.price - b.price);
    if (sortOption === "price-desc") result.sort((a, b) => b.price - a.price);
    if (sortOption === "newest") result.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    if (sortOption === "promo") result.sort((a, b) => {
      const discA = a.compareAtPrice && a.compareAtPrice > a.price ? (a.compareAtPrice - a.price) / a.compareAtPrice : 0;
      const discB = b.compareAtPrice && b.compareAtPrice > b.price ? (b.compareAtPrice - b.price) / b.compareAtPrice : 0;
      return discB - discA;
    });
    if (sortOption === "popular") result.sort((a, b) => (b.sold || 0) - (a.sold || 0));
    
    return result;
  }, [searchQuery, categoryFilter, sortOption, products, priceRange, selectedBrands]);


  return (
    <AppContext.Provider value={{
      view, setView, viewHistory, goBack,
      selectedProduct, setSelectedProduct,
      products, setProducts, filteredProducts,
      isLoadingProducts, isLoadingUser,
      cart, setCart, addToCart,
      wishlist, setWishlist, toggleWishlist,
      searchQuery, setSearchQuery,
      categoryFilter, setCategoryFilter,
      sortOption, setSortOption,
      user, setUser,
      isMember, setIsMember,
      profileTab, setProfileTab,
      priceRange, setPriceRange,
      selectedBrands, setSelectedBrands,
      toast, showToast, logout
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useAppContext = () => useContext(AppContext);
