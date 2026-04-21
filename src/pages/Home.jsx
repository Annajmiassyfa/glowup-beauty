import React, { useState } from 'react';
import { ChevronRight, Clock, Star, Gift, Coins, Sparkles, X, Ticket, CheckCircle, Loader2 } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { CATEGORIES, BRANDS } from '../data/mockData';
import ProductCard from '../components/ui/ProductCard';
import { activateMembership, fetchHomeReviews, assetUrl } from '../services/api';

const CATEGORY_IMAGES = {
  'Skincare': 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?q=80&w=400&h=400&auto=format&fit=crop',
  'Makeup': 'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?q=80&w=400&h=400&auto=format&fit=crop',
  'Body Care': 'https://images.unsplash.com/photo-1619451334792-150fd785ee74?q=80&w=400&h=400&auto=format&fit=crop',
  'Hair Care': 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?q=80&w=400&h=400&auto=format&fit=crop',
  'Fragrance': 'https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=400&h=400&auto=format&fit=crop',
  'Tools': 'https://images.unsplash.com/photo-1596704017254-9b121068fb31?q=80&w=400&h=400&auto=format&fit=crop'
};

export default function Home() {
  const { setView, setCategoryFilter, products, setSelectedProduct, showToast, setSelectedBrands, user, setUser, setProfileTab, isMember, setIsMember } = useAppContext();
  const [showBenefitsModal, setShowBenefitsModal] = useState(false);
  const [showActivationModal, setShowActivationModal] = useState(false);
  const [isActivating, setIsActivating] = useState(false);
  const [homeReviews, setHomeReviews] = useState([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);

  React.useEffect(() => {
    loadHomeReviews();
  }, []);

  const loadHomeReviews = async () => {
    setIsLoadingReviews(true);
    try {
      const data = await fetchHomeReviews();
      setHomeReviews(data);
    } catch (err) {
      console.error('Failed to load home reviews:', err);
    } finally {
      setIsLoadingReviews(false);
    }
  };

  // Handler: activate membership via backend
  const handleActivateMembership = async () => {
    if (!user) {
      // User not logged in — redirect to login
      showToast('Silakan login terlebih dahulu untuk mengaktifkan membership.');
      setShowActivationModal(false);
      return;
    }
    setIsActivating(true);
    try {
      const updatedUser = await activateMembership();
      // Sync AppContext with fresh data from backend
      setUser(updatedUser);
      setIsMember(true);
      setShowActivationModal(false);
      showToast('Selamat! Membership Glow Rewards berhasil diaktifkan. Poin bonus +100 ditambahkan!');
    } catch (err) {
      showToast(err.message || 'Gagal mengaktifkan membership');
    } finally {
      setIsActivating(false);
    }
  };

  // Get ALL_PRODUCTS logically if needed but products works fine if not heavily modified yet
  
  return (
    <div className="animate-in fade-in duration-500">
      <section className="relative h-[400px] md:h-[500px] overflow-hidden bg-pink-50">
        <div className="absolute inset-0 flex flex-col md:flex-row items-center">
          <div className="flex-1 p-8 md:p-20 z-10 text-center md:text-left">
            <span className="inline-block px-3 py-1 rounded-full bg-pink-100 text-pink-600 text-xs font-bold mb-4 tracking-widest uppercase">New Collection</span>
            <h2 className="text-4xl md:text-6xl font-serif font-bold text-gray-900 leading-tight mb-6">
              Radiate Your <br /> 
              <span className="italic text-pink-500 font-normal">Natural Glow</span>
            </h2>
            <p className="text-gray-600 text-sm md:text-lg mb-8 max-w-md">
              Temukan rahasia kecantikan kulit sehat dengan koleksi terkurasi dari brand dunia terbaik.
            </p>
            <button 
              onClick={() => setView('shop')}
              className="bg-gray-900 text-white px-8 py-3.5 rounded-full font-bold hover:bg-pink-600 transition-colors shadow-lg"
            >
              Shop Now
            </button>
          </div>
          <div className="flex-1 h-full w-full relative">
             <img src="https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=2087&auto=format&fit=crop" className="w-full h-full object-cover" alt="Hero" />
             <div className="absolute inset-0 bg-gradient-to-r from-pink-50 via-transparent to-transparent"></div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-serif font-bold text-gray-900">Explore Categories</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          {CATEGORIES.map((cat) => (
            <div 
              key={cat} 
              onClick={() => { setCategoryFilter(cat); setView('shop'); }}
              className="group cursor-pointer text-center"
            >
              <div className="aspect-square rounded-2xl overflow-hidden bg-gray-100 mb-3 border border-pink-50">
                <img 
                  src={CATEGORY_IMAGES[cat] || `https://picsum.photos/seed/${cat}/300/300`} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform" 
                  alt={cat} 
                />
              </div>
              <span className="text-sm font-bold text-gray-700">{cat}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-pink-600 py-12 text-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <h2 className="text-3xl font-serif font-bold">Penawaran Terbaik</h2>
              <div className="hidden md:flex items-center gap-2 bg-white/20 px-4 py-2 rounded-lg font-bold text-sm">
                <Sparkles size={18} /> Harga Spesial Hari Ini
              </div>
            </div>
            <button onClick={() => setView('shop')} className="mt-4 md:mt-0 text-white font-bold flex items-center gap-1 hover:gap-2 transition-all">
              Lihat Semua Promo <ChevronRight size={16} />
            </button>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {products.filter(p => p.compareAtPrice && p.compareAtPrice > p.price).slice(0, 4).map(p => {
              const discountPercent = Math.round(((p.compareAtPrice - p.price) / p.compareAtPrice) * 100);
              return (
                <div key={p.id} className="bg-white text-gray-900 rounded-2xl p-4 relative cursor-pointer hover:shadow-xl transition-all" onClick={() => { setSelectedProduct(p); setView('detail'); }}>
                  <div className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded z-10">-{discountPercent}%</div>
                  <img 
                    src={assetUrl(p.image) || `https://picsum.photos/seed/${p.id}/400/500`} 
                    className="w-full aspect-square object-cover rounded-xl mb-4" 
                    alt={p.name} 
                    onError={(e) => { e.target.src = `https://picsum.photos/seed/${p.id}/400/500`; }}
                  />
                  <p className="text-[10px] text-pink-500 font-bold mb-1 uppercase tracking-wider">{p.brand}</p>
                  <h3 className="text-sm font-medium line-clamp-1 mb-2">{p.name}</h3>
                  <div className="flex flex-col">
                    <span className="font-bold text-lg text-gray-900">Rp {p.price.toLocaleString()}</span>
                    <span className="text-xs text-gray-400 line-through">Rp {p.compareAtPrice.toLocaleString()}</span>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-1 rounded">Stok Tersedia</span>
                    <ChevronRight size={14} className="text-gray-300" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-pink-500 font-bold text-xs uppercase tracking-widest mb-2">Curated for you</p>
              <h2 className="text-3xl font-serif font-bold text-gray-900">Bestseller Items</h2>
            </div>
            <button onClick={() => setView('shop')} className="text-pink-600 font-bold text-sm flex items-center gap-1 hover:gap-2 transition-all">
              View All <ChevronRight size={16} />
            </button>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {products.slice(0, 4).map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-8">
        <div className="rounded-3xl bg-gray-900 p-8 md:p-12 text-white flex flex-col md:flex-row items-center gap-8 relative overflow-hidden shadow-2xl">
          {/* Decorative Background Elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl opacity-50 transform translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl opacity-50 transform -translate-x-1/2 translate-y-1/2 pointer-events-none"></div>
          
          <div className="z-10 relative w-full md:w-5/12">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-full text-pink-300 text-[10px] font-bold mb-4 uppercase tracking-widest backdrop-blur-sm border border-white/5">
              <Sparkles size={12} /> Membership Area
            </div>
            <h3 className="text-3xl lg:text-4xl font-serif font-bold mb-4">Glow Rewards Club</h3>
            <p className="text-gray-400 mb-8 text-sm leading-relaxed max-w-md">
              Bergabunglah dengan komunitas eksklusif kami. Kumpulkan poin dari setiap pembelian, akses promo lebih awal, dan nikmati berbagai keuntungan premium.
            </p>
            <div className="flex flex-wrap gap-4">
              <button 
                onClick={() => {
                  if (isMember) {
                    showToast('Membership Anda sudah aktif!');
                  } else {
                    setShowActivationModal(true);
                  }
                }} 
                className={`px-6 py-3 rounded-full font-bold text-sm transition-all shadow-[0_0_15px_rgba(236,72,153,0.4)] ${isMember ? 'bg-green-500 text-white hover:bg-green-600 shadow-[0_0_15px_rgba(34,197,94,0.4)]' : 'bg-pink-500 text-white hover:bg-pink-600 hover:shadow-[0_0_25px_rgba(236,72,153,0.6)]'}`}
              >
                {isMember ? 'Membership Aktif' : 'Member Sekarang'}
              </button>
              <button 
                onClick={() => setShowBenefitsModal(true)} 
                className="flex items-center gap-2 border border-white/20 bg-white/5 px-6 py-3 rounded-full font-bold text-sm hover:bg-white/10 transition-all backdrop-blur-sm"
              >
                Lihat Keuntungan
              </button>
            </div>
          </div>
          
          <div className="flex-1 w-full z-10 grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 md:mt-0">
            {[
              { icon: <Ticket className="text-pink-400 mb-3 group-hover:scale-110 transition-transform" size={28} strokeWidth={1.5}/>, title: 'Diskon 15%', desc: 'Potongan langsung untuk transaksi pertamamu.' },
              { icon: <Coins className="text-yellow-400 mb-3 group-hover:scale-110 transition-transform" size={28} strokeWidth={1.5}/>, title: 'Kumpulkan Poin', desc: 'Dapatkan 1 poin tiap belanja Rp10.000.' },
              { icon: <Gift className="text-purple-400 mb-3 group-hover:scale-110 transition-transform" size={28} strokeWidth={1.5}/>, title: 'Hadiah Ulang Tahun', desc: 'Kejutan ekstra poin di bulan ulang tahunmu.' }
            ].map((benefit, i) => (
              <div key={i} className="group bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all hover:-translate-y-1 backdrop-blur-sm cursor-default">
                {benefit.icon}
                <h4 className="text-white font-bold text-sm mb-2">{benefit.title}</h4>
                <p className="text-gray-400 text-xs leading-relaxed">{benefit.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Modal */}
      {showBenefitsModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setShowBenefitsModal(false)}>
          <div 
            className="bg-white rounded-[2rem] w-full max-w-lg overflow-hidden shadow-2xl scale-100 animate-in zoom-in-95 duration-200"
            onClick={e => e.stopPropagation()}
          >
            <div className="bg-gradient-to-br from-pink-50 to-white p-8 relative border-b border-pink-100/50">
              <button 
                onClick={() => setShowBenefitsModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-900 bg-white rounded-full p-2 shadow-sm transition-all hover:scale-110"
              >
                <X size={18} />
              </button>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-pink-100 rounded-full text-pink-600 text-[10px] font-bold mb-4 uppercase tracking-widest">
                <Star size={12} fill="currentColor" /> VIP Program Details
              </div>
              <h3 className="text-2xl font-serif font-bold text-gray-900 mb-2">Keuntungan Glow Rewards</h3>
              <p className="text-gray-500 text-sm">Tingkatkan terus level membership-mu untuk membuka kunci benefit yang lebih spektakuler.</p>
            </div>
            
            <div className="p-8">
              <div className="space-y-4">
                {[
                  { title: "Glow Starter (Member Baru)", benefits: ["Diskon 15% transaksi pertama", "Akses promo reguler"], icon: Sparkles, color: "text-pink-500", bg: "bg-pink-100" },
                  { title: "Glow Insider (Min. Belanja 1Jt)", benefits: ["Gratis ongkir tanpa batas", "Akses eksklusif Flash Sale lebih awal"], icon: Ticket, color: "text-purple-500", bg: "bg-purple-100" },
                  { title: "Glow VIP (Min. Belanja 5Jt)", benefits: ["GlowUp Girls Birthday Box eksklusif", "Dedicated Customer Service", "Undangan Private Event"], icon: Gift, color: "text-yellow-500", bg: "bg-yellow-100" }
                ].map((tier, idx) => (
                  <div key={idx} className="flex gap-4 items-start p-4 hover:bg-gray-50 rounded-2xl transition-colors border border-transparent hover:border-gray-100">
                    <div className={`w-10 h-10 rounded-full ${tier.bg} flex items-center justify-center shrink-0`}>
                      <tier.icon className={tier.color} size={18} />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm mb-2">{tier.title}</h4>
                      <ul className="text-xs text-gray-600 space-y-1.5">
                        {tier.benefits.map((b, bIdx) => (
                          <li key={bIdx} className="flex items-center gap-2">
                            <div className={`w-1.5 h-1.5 rounded-full ${tier.bg.replace('100', '400')}`}></div>
                            {b}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                <p className="text-xs text-gray-400 mb-4">Membership berlaku selama akun Anda aktif. Tier akan meningkat seiring total belanja kumulatif Anda.</p>
                <button 
                  onClick={() => setShowBenefitsModal(false)}
                  className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold hover:bg-pink-600 transition-colors shadow-lg hover:shadow-pink-500/25"
                >
                  Mengerti
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Activation Modal */}
      {showActivationModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setShowActivationModal(false)}>
          <div 
            className="bg-white rounded-[2rem] w-full max-w-md overflow-hidden shadow-2xl scale-100 animate-in zoom-in-95 duration-200"
            onClick={e => e.stopPropagation()}
          >
            <div className="bg-pink-50 p-6 relative flex flex-col items-center text-center border-b border-pink-100">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm">
                <Sparkles className="text-pink-500" size={32} />
              </div>
              <h3 className="text-2xl font-serif font-bold text-gray-900 mb-2">Aktivasi Membership</h3>
              <p className="text-gray-600 text-sm">Gabung Glow Rewards Club secara instan dan nikmati prioritas serta keuntungan berbelanja hari ini.</p>
            </div>
            
            <div className="p-6">
              <div className="space-y-3 mb-6">
                <div className="flex items-start gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100">
                  <CheckCircle className="text-green-500 shrink-0" size={20} />
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm">Diskon 15% Transaksi Pertama</h4>
                    <p className="text-xs text-gray-500">Berlaku untuk semua produk favoritmu tanpa minimal belanja.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100">
                  <CheckCircle className="text-green-500 shrink-0" size={20} />
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm">Gratis Aktivasi</h4>
                    <p className="text-xs text-gray-500">Aktivasi hari ini, nikmati selamanya tanpa biaya bulanan.</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <button 
                  onClick={handleActivateMembership}
                  disabled={isActivating}
                  className="w-full bg-pink-500 text-white py-3.5 rounded-xl font-bold hover:bg-pink-600 transition-colors shadow-[0_0_15px_rgba(236,72,153,0.4)] disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {isActivating && <Loader2 size={16} className="animate-spin" />}
                  {isActivating ? 'Mengaktifkan...' : 'Aktifkan Member'}
                </button>
                <button 
                  onClick={() => setShowActivationModal(false)}
                  className="w-full bg-transparent text-gray-500 py-3 rounded-xl font-bold hover:text-gray-900 hover:bg-gray-100 transition-colors"
                >
                  Batal / Kembali
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <section className="max-w-7xl mx-auto px-4 py-16 border-t border-gray-100">
        <h2 className="text-2xl font-serif font-bold text-gray-900 text-center mb-12">Popular Brands</h2>
        <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-60 mb-20">
          {BRANDS.map(brand => (
            <span key={brand} onClick={() => { setSelectedBrands([brand]); setView('shop'); window.scrollTo(0,0); }} className="text-xl md:text-2xl font-serif font-bold text-gray-400 uppercase tracking-widest hover:text-pink-500 transition-colors cursor-pointer">{brand}</span>
          ))}
        </div>

        <h2 className="text-2xl font-serif font-bold text-gray-900 text-center mb-12">What They Say</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {isLoadingReviews ? (
            <div className="col-span-3 text-center py-12 text-gray-400 italic">
              Memuat ulasan pelanggan...
            </div>
          ) : homeReviews.length > 0 ? (
            homeReviews.map((review, i) => (
              <div key={i} className="bg-pink-50/50 p-6 rounded-2xl border border-pink-100/30">
                <div className="flex text-yellow-400 mb-4">
                  {[...Array(5)].map((_, j) => <Star key={j} size={14} fill={j < review.rating ? "currentColor" : "none"} />)}
                </div>
                <p className="text-gray-600 text-sm italic mb-4 line-clamp-3">"{review.comment || 'Puas dengan produknya!'}"</p>
                <p className="text-sm font-bold text-gray-900">- {review.user?.name}</p>
                <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-tighter">{review.product?.name}</p>
              </div>
            ))
          ) : (
            <div className="col-span-3 text-center py-12 text-gray-400 italic">
              Belum ada ulasan terbaru.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
