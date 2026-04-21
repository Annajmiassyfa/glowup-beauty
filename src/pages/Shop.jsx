import React from 'react';
import { Filter, Search, Loader2 } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { CATEGORIES, BRANDS } from '../data/mockData';
import ProductCard from '../components/ui/ProductCard';

export default function Shop() {
  const { 
    categoryFilter, setCategoryFilter,
    priceRange, setPriceRange,
    selectedBrands, setSelectedBrands,
    filteredProducts,
    sortOption, setSortOption,
    isLoadingProducts
  } = useAppContext();

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        <aside className="w-full md:w-64 space-y-8">
          <div>
            <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Filter size={18} /> Categories
            </h4>
            <div className="space-y-2">
              <button 
                onClick={() => setCategoryFilter("All")}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${categoryFilter === "All" ? 'bg-pink-50 text-pink-600 font-bold' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                All Products
              </button>
              {CATEGORIES.map(cat => (
                <button 
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${categoryFilter === cat ? 'bg-pink-50 text-pink-600 font-bold' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-bold text-gray-900 mb-4">Price Range</h4>
            <div className="space-y-4">
              <input 
                type="range" 
                className="w-full accent-pink-500" 
                min="0" 
                max="1000000" 
                step="50000"
                value={priceRange}
                onChange={(e) => setPriceRange(Number(e.target.value))}
              />
              <div className="flex justify-between text-xs text-gray-500 font-medium">
                <span>Rp 0</span>
                <span>Max: Rp {priceRange.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-gray-900 mb-4">Brands</h4>
            <div className="grid grid-cols-1 gap-2">
              {BRANDS.map(brand => (
                <label key={brand} className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="rounded text-pink-500 focus:ring-pink-500" 
                    checked={selectedBrands.includes(brand)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedBrands([...selectedBrands, brand]);
                      } else {
                        setSelectedBrands(selectedBrands.filter(b => b !== brand));
                      }
                    }}
                  /> {brand}
                </label>
              ))}
            </div>
          </div>
        </aside>

        <div className="flex-1">
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-100">
            <p className="text-sm text-gray-500">Showing <span className="font-bold text-gray-900">{filteredProducts.length}</span> products</p>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Sort by:</span>
              <select 
                className="text-sm font-bold bg-transparent outline-none cursor-pointer"
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
              >
                <option value="newest">Newest Arrivals</option>
                <option value="popular">Most Popular</option>
                <option value="promo">Biggest Discounts</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
            </div>
          </div>

          {isLoadingProducts ? (
            <div className="py-20 text-center">
              <Loader2 className="w-10 h-10 text-pink-400 animate-spin mx-auto mb-4" />
              <p className="text-gray-400 text-sm">Memuat produk...</p>
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          ) : (
            <div className="py-20 text-center">
              <div className="inline-flex p-4 rounded-full bg-gray-50 mb-4"><Search size={32} className="text-gray-300" /></div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">No products found</h3>
              <p className="text-gray-500">Coba kata kunci lain atau ubah filter pencarian Anda.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
