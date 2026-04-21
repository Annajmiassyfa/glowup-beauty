import React from 'react';
import { Search, LayoutDashboard, ShoppingBag, User } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { CATEGORIES } from '../../data/mockData';

export default function Navbar() {
  const { view, setView, categoryFilter, setCategoryFilter, searchQuery, setSearchQuery, user, cart } = useAppContext();

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-pink-100">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        <div className="flex items-center gap-8">
          <h1 
            className="text-2xl font-serif font-bold text-pink-600 cursor-pointer tracking-tighter"
            onClick={() => setView('home')}
          >
            GLOWUP GIRLS
          </h1>
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
            {CATEGORIES.map(cat => (
              <button 
                key={cat} 
                onClick={() => { setCategoryFilter(cat); setView('shop'); }}
                className={`hover:text-pink-500 transition-colors ${categoryFilter === cat && view === 'shop' ? 'text-pink-600 font-bold' : ''}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 max-w-md relative hidden sm:block">
          <input 
            type="text" 
            placeholder="Cari produk, brand, atau kategori..." 
            className="w-full bg-gray-50 border-none rounded-full py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-pink-200 outline-none transition-all"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setView('shop'); }}
          />
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        </div>

        <div className="flex items-center gap-4 text-gray-600">
          {user?.role === 'Admin' && (
            <button onClick={() => setView('admin')} className="hover:text-pink-500 p-2 relative group">
              <LayoutDashboard size={22} />
              <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">Admin</span>
            </button>
          )}
          <button onClick={() => {
            const q = window.prompt("Cari produk, brand, atau kategori (kosongkan untuk melihat semua):");
            if (q !== null) {
              setSearchQuery(q);
              setView('shop');
              window.scrollTo(0,0);
            }
          }} className="hover:text-pink-500 p-2 md:hidden">
            <Search size={22} />
          </button>
          <div className="relative cursor-pointer" onClick={() => setView('cart')}>
            <ShoppingBag size={22} className="hover:text-pink-500" />
            {cart.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                {cart.reduce((a, b) => a + b.qty, 0)}
              </span>
            )}
          </div>
          <button onClick={() => user ? setView('profile') : setView('login')} className="hover:text-pink-500 p-2">
            <User size={22} />
          </button>
        </div>
      </div>
    </nav>
  );
}
