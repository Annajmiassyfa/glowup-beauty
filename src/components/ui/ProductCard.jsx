import React from 'react';
import { Heart, Plus, Star } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { assetUrl } from '../../services/api';

export default function ProductCard({ product }) {
  const { wishlist, toggleWishlist, addToCart, setSelectedProduct, setView } = useAppContext();

  return (
    <div className="group bg-white rounded-2xl overflow-hidden border border-transparent hover:border-pink-100 hover:shadow-xl hover:shadow-pink-500/5 transition-all duration-300">
      <div className="relative aspect-[4/5] overflow-hidden bg-gray-100 cursor-pointer" onClick={() => { setSelectedProduct(product); setView('detail'); window.scrollTo(0,0); }}>
        <img 
          src={assetUrl(product.image) || `https://picsum.photos/seed/${product.id}/400/500`} 
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => { e.target.src = `https://picsum.photos/seed/${product.id}/400/500`; }}
        />
        <button 
          onClick={(e) => { e.stopPropagation(); toggleWishlist(product); }}
          className={`absolute top-3 right-3 p-2 rounded-full shadow-sm backdrop-blur-md transition-all ${wishlist.find(p => p.id === product.id) ? 'bg-pink-500 text-white' : 'bg-white/80 text-gray-400 hover:text-pink-500'}`}
        >
          <Heart size={18} fill={wishlist.find(p => p.id === product.id) ? "currentColor" : "none"} />
        </button>
        {product.compareAtPrice && product.compareAtPrice > product.price && (
          <span className="absolute top-3 left-3 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded">
            {Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)}% OFF
          </span>
        )}
        {product.badge && (
          <span className="absolute bottom-3 left-3 bg-pink-600 text-white text-[10px] font-bold px-2 py-1 rounded-sm uppercase tracking-wider">
            {product.badge}
          </span>
        )}
        <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform">
          <button 
            onClick={(e) => { e.stopPropagation(); addToCart(product); }}
            className="w-full bg-white text-gray-900 font-bold py-2.5 rounded-xl shadow-lg flex items-center justify-center gap-2 text-sm hover:bg-pink-50"
          >
            <Plus size={16} /> Add to Cart
          </button>
        </div>
      </div>
      <div className="p-4 cursor-pointer" onClick={() => { setSelectedProduct(product); setView('detail'); window.scrollTo(0,0); }}>
        <p className="text-[10px] text-pink-500 font-bold uppercase tracking-widest mb-1">{product.brand}</p>
        <h3 className="text-sm font-medium text-gray-800 line-clamp-2 mb-2 min-h-[40px]">{product.name}</h3>
        <div className="flex items-center gap-1 mb-2">
          <div className="flex text-yellow-400">
            {[...Array(5)].map((_, i) => <Star key={i} size={12} fill={i < Math.floor(product.rating || 0) ? "currentColor" : "none"} />)}
          </div>
          <span className="text-[11px] text-gray-400">({product.reviews || 0})</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-gray-900">Rp {product.price.toLocaleString()}</span>
          {product.compareAtPrice && product.compareAtPrice > product.price && (
            <span className="text-[11px] text-gray-400 line-through">Rp {product.compareAtPrice.toLocaleString()}</span>
          )}
        </div>
      </div>
    </div>
  );
}
