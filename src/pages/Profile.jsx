import React from 'react';
import { LogOut, Truck } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { assetUrl } from '../services/api';

import ProductCard from '../components/ui/ProductCard';
import ProfileSettings from './account/ProfileSettings';
import SavedAddresses from './account/SavedAddresses';
import OrderHistory from './account/OrderHistory';

export default function Profile() {
  const { user, setUser, setView, orders, showToast, wishlist, profileTab, setProfileTab, logout } = useAppContext();

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 flex flex-col md:flex-row gap-12">
      <aside className="w-full md:w-64 space-y-2">
        <div className="p-6 bg-pink-50 rounded-3xl mb-8">
          <div className="w-16 h-16 bg-pink-200 rounded-full mb-4 overflow-hidden">
            <img src={assetUrl(user?.avatar) || 'https://i.pravatar.cc/150?u=glowup'} alt="User" className="w-full h-full object-cover" />
          </div>
          <h4 className="font-bold text-gray-900">{user?.name || 'Pengguna'}</h4>
          <p className="text-xs text-gray-500">
            {user?.role === 'Admin' 
              ? 'Administrator' 
              : user?.isMember 
                ? `Glow ${user.memberTier || 'Member'}` 
                : 'Belum jadi member'}
          </p>
          {user?.isMember && user?.rewardPoints > 0 && (
            <p className="text-xs text-pink-500 font-bold mt-1">{user.rewardPoints} Poin</p>
          )}
        </div>
        {['Riwayat Pesanan', 'Wishlist Saya', 'Alamat Tersimpan', 'Pengaturan Profil', 'Pusat Bantuan'].map(item => (
          <button key={item} onClick={() => setProfileTab(item)} className={`w-full text-left p-3 rounded-xl text-sm transition-all ${profileTab === item ? 'bg-white shadow-md text-pink-600 font-bold' : 'text-gray-500 hover:bg-gray-50'}`}>
            {item}
          </button>
        ))}
        <button 
          onClick={logout}
          className="w-full text-left p-3 rounded-xl text-sm text-red-500 font-medium mt-8 flex items-center gap-2"
        >
          <LogOut size={18} /> Logout
        </button>
      </aside>

      <main className="flex-1">
        <h2 className="text-2xl font-serif font-bold text-gray-900 mb-8">{profileTab}</h2>
        {profileTab === 'Riwayat Pesanan' && (
          <OrderHistory orders={orders} showToast={showToast} />
        )}

        {profileTab === 'Wishlist Saya' && (
          wishlist.length > 0 ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-300">
              {wishlist.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          ) : (
            <div className="py-12 text-center bg-white rounded-3xl border border-gray-100 animate-in fade-in duration-300">
              <p className="text-gray-500 mb-4">Wishlist Anda masih kosong.</p>
              <button onClick={() => setView('shop')} className="text-pink-600 font-bold px-6 py-2 border border-pink-600 rounded-full hover:bg-pink-50 transition-colors">Belanja Sekarang</button>
            </div>
          )
        )}

        {profileTab === 'Pengaturan Profil' && (
          <ProfileSettings user={user} setUser={setUser} showToast={showToast} />
        )}

        {profileTab === 'Alamat Tersimpan' && (
          <SavedAddresses showToast={showToast} />
        )}

        {profileTab === 'Pusat Bantuan' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <h3 className="text-xl font-bold font-serif mb-4">Pertanyaan yang Sering Diajukan (FAQ)</h3>
            <div className="space-y-4">
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <h4 className="font-bold text-gray-900">Apa saja metode pembayaran yang tersedia?</h4>
                <p className="text-gray-500 text-sm mt-2">
                   Kami mendukung transfer manual ke Bank Mandiri (1730013032272), SeaBank (901836025765), serta E-Wallet (Dana/GoPay/ShopeePay). Semua atas nama <strong>AN NAJMI AS SYFA</strong>, kecuali QRIS atas nama <strong>Anggita Tri Sundari</strong>.
                </p>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <h4 className="font-bold text-gray-900">Bagaimana cara melacak pesanan saya?</h4>
                <p className="text-gray-500 text-sm mt-2">Anda dapat melacak pesanan Anda melalui menu "Riwayat Pesanan" di profil Anda, lalu klik tautan lacak pengiriman yang tersedia pada setiap pesanan.</p>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <h4 className="font-bold text-gray-900">Berapa lama waktu pengiriman?</h4>
                <p className="text-gray-500 text-sm mt-2">Waktu pengiriman standar adalah 2-3 hari kerja untuk wilayah Jabodetabek, dan 3-5 hari kerja untuk di luar Jabodetabek setelah pembayaran dikonfirmasi.</p>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <h4 className="font-bold text-gray-900">Apakah produk GlowUp Girls aman untuk kulit sensitif?</h4>
                <p className="text-gray-500 text-sm mt-2">Ya, semua produk kami telah melalui uji klinis dan diformulasikan dengan bahan-bahan yang aman. Namun kami tetap menyarankan untuk melakukan patch test terlebih dahulu.</p>
              </div>
            </div>

            <div className="mt-8 p-8 bg-pink-50/80 border border-pink-100 rounded-3xl text-center">
              <h3 className="font-bold text-gray-900 text-lg mb-2">Punya pertanyaan lain?</h3>
              <p className="text-sm text-gray-600 mb-8 max-w-md mx-auto">Kami siap membantu Anda. Hubungi kami melalui sosial media GlowUp Girls untuk mendapatkan respons lebih cepat.</p>
              <div className="flex justify-center gap-6">
                <a href="https://instagram.com/glowupgirls" target="_blank" rel="noopener noreferrer" className="p-4 bg-white text-pink-600 rounded-full hover:bg-gradient-to-tr hover:from-yellow-400 hover:via-pink-500 hover:to-purple-500 hover:text-white transition-all shadow-sm hover:shadow-md transform hover:-translate-y-1">
                  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
                </a>
                <a href="https://wa.me/6282110737267" target="_blank" rel="noopener noreferrer" className="p-4 bg-white text-green-500 rounded-full hover:bg-green-500 hover:text-white transition-all shadow-sm hover:shadow-md transform hover:-translate-y-1">
                  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
                </a>
                <a href="https://twitter.com/glowupgirls" target="_blank" rel="noopener noreferrer" className="p-4 bg-white text-blue-400 rounded-full hover:bg-blue-400 hover:text-white transition-all shadow-sm hover:shadow-md transform hover:-translate-y-1">
                  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
                </a>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
