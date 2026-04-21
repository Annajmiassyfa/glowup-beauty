import React, { useState } from 'react';
import { ChevronRight, Star, ShoppingBag, Heart, Truck, ShieldCheck } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import ProductCard from '../components/ui/ProductCard';
import { assetUrl, fetchProductReviews } from '../services/api';

export default function ProductDetail() {
  const { selectedProduct: p, setView, addToCart, toggleWishlist, wishlist, products } = useAppContext();
  const [tab, setTab] = useState('description');
  const [mainImage, setMainImage] = useState(p ? assetUrl(p.image) : '');
  const [productReviews, setProductReviews] = useState([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);

  React.useEffect(() => {
    if (p) {
      setMainImage(assetUrl(p.image));
      window.scrollTo(0, 0);
      loadReviews();
    }
  }, [p]);

  const loadReviews = async () => {
    if (!p?.id) return;
    setIsLoadingReviews(true);
    try {
      const data = await fetchProductReviews(p.id);
      setProductReviews(data);
    } catch (err) {
      console.error('Failed to load reviews:', err);
    } finally {
      setIsLoadingReviews(false);
    }
  };

  if (!p) {
    setView('shop');
    return null;
  }
  
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-2 text-xs text-gray-400 mb-8">
        <button onClick={() => setView('home')}>Home</button>
        <ChevronRight size={12} />
        <button onClick={() => setView('shop')}>Shop</button>
        <ChevronRight size={12} />
        <span className="text-gray-600 font-medium">{p.name}</span>
      </div>

      <div className="flex flex-col md:flex-row gap-12 mb-16">
        <div className="flex-1 space-y-4">
          <div className="aspect-[4/5] rounded-3xl overflow-hidden bg-gray-100">
            <img 
              src={mainImage || (p ? assetUrl(p.image) : '')} 
              className="w-full h-full object-cover transition-opacity duration-300" 
              alt={p.name}
              onError={(e) => { e.target.src = `https://picsum.photos/seed/${p.id}/800/1000`; }}
            />
          </div>
          
          {p.images && p.images.length > 1 && (
            <div className="grid grid-cols-4 gap-4">
              {p.images.map((imgSrc, i) => {
                const fullSrc = assetUrl(imgSrc);
                return (
                  <div 
                    key={i} 
                    onClick={() => setMainImage(fullSrc)} 
                    className={`aspect-square rounded-xl overflow-hidden bg-gray-100 border cursor-pointer transition-all ${mainImage === fullSrc ? 'border-pink-500 ring-2 ring-pink-100' : 'border-transparent hover:border-pink-300'}`}
                  >
                    <img 
                      src={fullSrc} 
                      className={`w-full h-full object-cover ${mainImage === fullSrc ? 'opacity-100' : 'opacity-60 hover:opacity-100'}`} 
                      alt={`thumbnail ${i}`}
                      onError={(e) => { e.target.src = `https://picsum.photos/seed/${p.id}${i}/400/500`; }}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex-1">
          <div className="mb-6">
            <p className="text-pink-600 font-bold text-sm tracking-widest uppercase mb-2">{p.brand}</p>
            <h1 className="text-3xl font-serif font-bold text-gray-900 mb-4">{p.name}</h1>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => <Star key={i} size={16} fill={i < Math.floor(p.rating) ? "currentColor" : "none"} />)}
                </div>
                <span className="font-bold text-gray-900">{p.rating}</span>
              </div>
              <span className="text-gray-400">|</span>
              <span className="text-gray-500 text-sm">{p.reviews} Verified Reviews</span>
              <span className="text-gray-400">|</span>
              <span className={`text-xs font-bold ${p.stock > 10 ? 'text-green-600' : 'text-red-500'}`}>
                {p.stock > 10 ? 'In Stock' : `Low Stock: ${p.stock} left`}
              </span>
            </div>
          </div>

          <div className="bg-pink-50/50 p-6 rounded-2xl mb-8">
            <div className="flex items-center gap-3 mb-1">
              <span className="text-3xl font-bold text-gray-900">Rp {p.price.toLocaleString()}</span>
              {p.compareAtPrice && p.compareAtPrice > p.price && (
                <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-1 rounded">
                  Save {Math.round(((p.compareAtPrice - p.price) / p.compareAtPrice) * 100)}%
                </span>
              )}
            </div>
            {p.compareAtPrice && p.compareAtPrice > p.price && (
              <p className="text-gray-400 text-sm line-through mb-4">Rp {p.compareAtPrice.toLocaleString()}</p>
            )}
            
            <div className="flex gap-4">
              <button 
                onClick={() => addToCart(p)}
                className="flex-1 bg-pink-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-pink-200 hover:bg-pink-700 transition-all flex items-center justify-center gap-2"
              >
                <ShoppingBag size={20} /> Tambah ke Keranjang
              </button>
              <button 
                onClick={() => toggleWishlist(p)}
                className={`p-4 rounded-xl border transition-all ${wishlist.find(item => item.id === p.id) ? 'bg-pink-50 border-pink-200 text-pink-500' : 'border-gray-200 text-gray-400 hover:border-pink-500 hover:text-pink-500'}`}
              >
                <Heart size={24} fill={wishlist.find(item => item.id === p.id) ? "currentColor" : "none"} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="flex items-start gap-3 p-3 rounded-xl border border-gray-100">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Truck size={18} /></div>
              <div>
                <p className="text-xs font-bold text-gray-900">Free Shipping</p>
                <p className="text-[10px] text-gray-500">Orders over Rp 250k</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-xl border border-gray-100">
              <div className="p-2 bg-green-50 text-green-600 rounded-lg"><ShieldCheck size={18} /></div>
              <div>
                <p className="text-xs font-bold text-gray-900">100% Authentic</p>
                <p className="text-[10px] text-gray-500">Verified by GlowUp Girls</p>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-8">
            <div className="flex gap-8 border-b border-gray-100 mb-6">
              {['description', 'ingredients', 'usage', 'reviews'].map(t => (
                <button 
                  key={t}
                  onClick={() => setTab(t)}
                  className={`pb-4 text-sm font-bold capitalize transition-all border-b-2 ${tab === t ? 'text-pink-600 border-pink-600' : 'text-gray-400 border-transparent'}`}
                >
                  {t === 'reviews' ? `Reviews (${p.reviews || 0})` : t}
                </button>
              ))}
            </div>
            <div className="text-gray-600 text-sm leading-relaxed min-h-[100px]">
              {tab === 'description' && p.description}
              {tab === 'ingredients' && p.ingredients}
              {tab === 'usage' && p.usage}
              {tab === 'reviews' && (
                <div className="space-y-6">
                  {isLoadingReviews ? (
                    <div className="flex items-center gap-2 py-4 text-gray-400 italic">
                      <Star size={16} className="animate-pulse" /> Memuat ulasan...
                    </div>
                  ) : productReviews.length > 0 ? (
                    productReviews.map((rev, i) => (
                      <div key={i} className="border-b border-gray-50 pb-6 last:border-0">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                            <div className="flex text-yellow-400">
                              {[...Array(5)].map((_, j) => (
                                <Star key={j} size={12} fill={j < rev.rating ? "currentColor" : "none"} />
                              ))}
                            </div>
                            <span className="text-xs font-bold text-gray-900">{rev.user?.name}</span>
                            <span className="text-[10px] text-green-600 bg-green-50 px-1.5 py-0.5 rounded flex items-center gap-1">
                              <ShieldCheck size={10} /> Verified Purchase
                            </span>
                          </div>
                          <span className="text-[10px] text-gray-400">{new Date(rev.createdAt).toLocaleDateString('id-ID')}</span>
                        </div>
                        <p className="text-gray-600 text-sm leading-relaxed">{rev.comment || 'Tidak ada komentar.'}</p>
                      </div>
                    ))
                  ) : (
                    <div className="py-8 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                      <p className="text-gray-400 text-sm italic">Belum ada ulasan untuk produk ini.</p>
                      <p className="text-[10px] text-gray-400 mt-1">Jadilah yang pertama memberikan ulasan setelah membeli!</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-xl font-serif font-bold text-gray-900 mb-8">Anda Mungkin Juga Suka</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {products.filter(item => item.category === p.category && item.id !== p.id).slice(0, 4).map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      </div>
    </div>
  );
}
