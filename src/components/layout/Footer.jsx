import React from 'react';
import { Camera, Share2, MessageCircle, Video, ChevronRight, Mail } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

export default function Footer() {
  const { setView, user, showToast, setProfileTab, setSortOption, setCategoryFilter, setSelectedBrands } = useAppContext();

  const handleShopLink = (sort, category = 'All') => {
    setSortOption(sort);
    setCategoryFilter(category);
    setSelectedBrands([]);
    setView('shop');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStaticLink = (view, tab = null) => {
    if (tab) setProfileTab(tab);
    setView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-gradient-to-b from-white to-pink-50/50 border-t border-gray-100 pt-24 pb-12 mt-20 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4/5 h-px bg-gradient-to-r from-transparent via-pink-200 to-transparent"></div>
      
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8 hover:cursor-default">
        {/* Brand Column */}
        <div className="md:col-span-5 space-y-6 pr-0 md:pr-12">
          <h1 className="text-3xl font-serif font-bold text-pink-600 tracking-tighter cursor-pointer hover:opacity-80 transition-opacity" onClick={() => handleStaticLink('home')}>GLOWUP GIRLS</h1>
          <p className="text-gray-500 text-sm leading-relaxed max-w-md">
            Destinasi kecantikan nomor satu di Indonesia untuk semua kebutuhan skincare, makeup, dan perawatan tubuh premium Anda. Merayakan kecantikan setiap perempuan bersama GlowUp Girls.
          </p>
          <div className="flex gap-4 pt-2">
            <a 
              href="https://instagram.com/glowupgirls" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="w-11 h-11 rounded-full bg-white text-gray-400 hover:bg-gradient-to-tr hover:from-yellow-400 hover:via-pink-500 hover:to-purple-500 hover:text-white hover:border-transparent hover:shadow-md flex items-center justify-center transition-all border border-gray-100 transform hover:-translate-y-1 focus:ring-2 focus:ring-pink-300 outline-none"
              aria-label="Instagram"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
            </a>
            <a 
              href="https://wa.me/6282110737267?text=Halo%20GlowUp%20Girls" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="w-11 h-11 rounded-full bg-white text-gray-400 hover:bg-green-500 hover:text-white hover:border-transparent hover:shadow-md flex items-center justify-center transition-all border border-gray-100 transform hover:-translate-y-1 focus:ring-2 focus:ring-green-300 outline-none"
              aria-label="WhatsApp"
            >
              <MessageCircle size={18} />
            </a>
            <a 
              href="https://twitter.com/glowupgirls" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="w-11 h-11 rounded-full bg-white text-gray-400 hover:bg-gray-900 hover:text-white hover:border-transparent hover:shadow-md flex items-center justify-center transition-all border border-gray-100 transform hover:-translate-y-1 focus:ring-2 focus:ring-gray-300 outline-none"
              aria-label="Twitter / X"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
            </a>
            <a 
              href="mailto:hello@glowupgirls.id" 
              className="w-11 h-11 rounded-full bg-white text-gray-400 hover:bg-blue-500 hover:text-white hover:border-transparent hover:shadow-md flex items-center justify-center transition-all border border-gray-100 transform hover:-translate-y-1 focus:ring-2 focus:ring-blue-300 outline-none"
              aria-label="Email"
            >
              <Mail size={18} />
            </a>
          </div>
        </div>

        {/* Belanja Column */}
        <div className="md:col-span-2">
          <h4 className="font-bold text-gray-900 mb-6 text-sm uppercase tracking-wider">Belanja</h4>
          <ul className="space-y-4">
            <li>
              <button onClick={() => handleShopLink('promo')} className="group flex items-center text-sm text-gray-500 hover:text-pink-600 transition-colors w-full text-left">
                 <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transform -translate-x-2 group-hover:translate-x-0 transition-all mr-1 text-pink-500" />
                 Promo Terbaru
              </button>
            </li>
            <li>
              <button onClick={() => handleShopLink('popular')} className="group flex items-center text-sm text-gray-500 hover:text-pink-600 transition-colors w-full text-left">
                 <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transform -translate-x-2 group-hover:translate-x-0 transition-all mr-1 text-pink-500" />
                 Brand Populer
              </button>
            </li>
            <li>
              <button onClick={() => handleShopLink('newest')} className="group flex items-center text-sm text-gray-500 hover:text-pink-600 transition-colors w-full text-left">
                 <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transform -translate-x-2 group-hover:translate-x-0 transition-all mr-1 text-pink-500" />
                 Produk Baru
              </button>
            </li>
            <li>
              <button onClick={() => handleShopLink('newest')} className="group flex items-center text-sm text-gray-500 hover:text-pink-600 transition-colors w-full text-left">
                 <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transform -translate-x-2 group-hover:translate-x-0 transition-all mr-1 text-pink-500" />
                 Kategori
              </button>
            </li>
            <li>
              <button onClick={() => handleStaticLink('cart')} className="group flex items-center text-sm text-gray-500 hover:text-pink-600 transition-colors w-full text-left">
                 <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transform -translate-x-2 group-hover:translate-x-0 transition-all mr-1 text-pink-500" />
                 Voucher Belanja
              </button>
            </li>
          </ul>
        </div>

        {/* Layanan Column */}
        <div className="md:col-span-2">
          <h4 className="font-bold text-gray-900 mb-6 text-sm uppercase tracking-wider">Layanan</h4>
          <ul className="space-y-4">
            <li>
              <button onClick={() => user ? handleStaticLink('profile', 'Riwayat Pesanan') : handleStaticLink('login')} className="group flex items-center text-sm text-gray-500 hover:text-pink-600 transition-colors w-full text-left">
                 <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transform -translate-x-2 group-hover:translate-x-0 transition-all mr-1 text-pink-500" />
                 Lacak Pengiriman
              </button>
            </li>
            <li>
              <button onClick={() => handleStaticLink('policy')} className="group flex items-center text-sm text-gray-500 hover:text-pink-600 transition-colors w-full text-left">
                 <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transform -translate-x-2 group-hover:translate-x-0 transition-all mr-1 text-pink-500" />
                 Kebijakan Pengembalian
              </button>
            </li>
            <li>
              <button onClick={() => handleStaticLink('profile', 'Pusat Bantuan')} className="group flex items-center text-sm text-gray-500 hover:text-pink-600 transition-colors w-full text-left">
                 <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transform -translate-x-2 group-hover:translate-x-0 transition-all mr-1 text-pink-500" />
                 Pertanyaan Umum (FAQ)
              </button>
            </li>
            <li>
              <button onClick={() => handleStaticLink('payment')} className="group flex items-center text-sm text-gray-500 hover:text-pink-600 transition-colors w-full text-left">
                 <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transform -translate-x-2 group-hover:translate-x-0 transition-all mr-1 text-pink-500" />
                 Metode Pembayaran
              </button>
            </li>
            <li>
              <button onClick={() => handleStaticLink('contact')} className="group flex items-center text-sm text-gray-500 hover:text-pink-600 transition-colors w-full text-left">
                 <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transform -translate-x-2 group-hover:translate-x-0 transition-all mr-1 text-pink-500" />
                 Hubungi Kami
              </button>
            </li>
          </ul>
        </div>

        {/* Newsletter Column */}
        <div className="md:col-span-3">
          <h4 className="font-bold text-gray-900 mb-6 text-sm uppercase tracking-wider">Newsletter</h4>
          <p className="text-sm text-gray-500 mb-4 leading-relaxed">Berlangganan untuk tips kecantikan, informasi produk baru, dan promo eksklusif mingguan.</p>
          <div className="flex bg-white border border-gray-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-pink-100 transition-all shadow-sm">
            <input type="email" placeholder="Alamat Email" className="px-4 py-3 text-sm flex-1 outline-none bg-transparent" />
            <button 
              onClick={() => showToast('Terima kasih telah berlangganan newsletter kami!')}
              className="bg-gray-900 text-white px-6 text-xs font-bold uppercase tracking-wider hover:bg-pink-600 transition-colors"
            >
              Join
            </button>
          </div>
        </div>
      </div>
      
      {/* Bottom Bar */}
      <div className="max-w-7xl mx-auto px-4 mt-20 pt-8 border-t border-gray-200/50 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-xs text-gray-400 font-medium tracking-wide">
          &copy; {new Date().getFullYear()} GlowUp Girls Marketplace. All rights reserved. Built with ❤️ 
        </p>
        <div className="flex gap-6 text-xs text-gray-400 font-medium">
          <button onClick={() => handleStaticLink('policy')} className="hover:text-pink-600 transition-colors">Privacy Policy</button>
          <button className="hover:text-pink-600 transition-colors">Terms of Service</button>
        </div>
      </div>
    </footer>
  );
}
