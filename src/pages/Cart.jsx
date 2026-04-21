import React from 'react';
import { ShoppingBag, Trash2, Gift } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { assetUrl } from '../services/api';

export default function Cart() {
  const { cart, setCart, setView, showToast } = useAppContext();
  const [promoCode, setPromoCode] = React.useState('');

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h2 className="text-3xl font-serif font-bold text-gray-900 mb-8">Keranjang Belanja</h2>
      
      {cart.length > 0 ? (
        <div className="flex flex-col lg:flex-row gap-12">
          <div className="flex-1 space-y-6">
            {cart.map(item => (
              <div key={item.id} className="flex gap-4 p-4 bg-white rounded-2xl border border-gray-100">
                <img
                  src={assetUrl(item.image) || `https://picsum.photos/seed/${item.id}/96/128`}
                  className="w-24 h-32 object-cover rounded-xl"
                  alt={item.name}
                  onError={e => { e.target.src = `https://picsum.photos/seed/${item.id}/96/128`; }}
                />
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <p className="text-[10px] text-pink-500 font-bold uppercase">{item.brand}</p>
                    <button onClick={() => setCart(cart.filter(i => i.id !== item.id))} className="text-gray-400 hover:text-red-500"><Trash2 size={18} /></button>
                  </div>
                  <h4 className="font-bold text-gray-800 text-sm mb-2">{item.name}</h4>
                  <p className="font-bold text-gray-900 mb-4 text-sm">Rp {item.price.toLocaleString()}</p>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center border border-gray-200 rounded-lg">
                      <button onClick={() => setCart(cart.map(i => i.id === item.id ? {...i, qty: Math.max(1, i.qty - 1)} : i))} className="px-3 py-1 hover:bg-gray-50">-</button>
                      <span className="px-3 py-1 text-sm font-bold">{item.qty}</span>
                      <button onClick={() => setCart(cart.map(i => i.id === item.id ? {...i, qty: i.qty + 1} : i))} className="px-3 py-1 hover:bg-gray-50">+</button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="w-full lg:w-96">
            <div className="bg-gray-50 p-8 rounded-3xl sticky top-24">
              <h3 className="font-bold text-gray-900 mb-6 text-lg">Ringkasan Pesanan</h3>
              <div className="space-y-4 mb-6 pb-6 border-b border-gray-200">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal ({cart.length} Produk)</span>
                  <span className="font-bold text-gray-900">Rp {cart.reduce((a, b) => a + (b.price * b.qty), 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Estimasi Pengiriman</span>
                  <span className="text-gray-900 font-bold">Rp 15.000</span>
                </div>
                <div className="flex items-center gap-2 p-3 bg-white rounded-xl border border-dashed border-pink-200">
                  <Gift size={18} className="text-pink-500" />
                  <input type="text" value={promoCode} onChange={(e) => setPromoCode(e.target.value)} placeholder="Masukkan kode promo" className="flex-1 bg-transparent text-xs outline-none" />
                  <button onClick={() => { if(promoCode) showToast('Kode promo berhasil diterapkan!'); else showToast('Masukkan kode promo terlebih dahulu!'); }} className="text-pink-500 text-xs font-bold uppercase hover:text-pink-600 transition-colors">Apply</button>
                </div>
              </div>
              <div className="flex justify-between items-center mb-8">
                <span className="text-lg font-bold text-gray-900">Total</span>
                <span className="text-2xl font-bold text-pink-600">Rp {(cart.reduce((a, b) => a + (b.price * b.qty), 0) + 15000).toLocaleString()}</span>
              </div>
              <button 
                onClick={() => setView('checkout')}
                className="w-full bg-gray-900 text-white font-bold py-4 rounded-2xl hover:bg-pink-600 transition-all shadow-xl shadow-gray-200"
              >
                Checkout Sekarang
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="py-32 text-center">
          <div className="w-20 h-20 bg-pink-50 rounded-full flex items-center justify-center mx-auto mb-6 text-pink-300">
            <ShoppingBag size={40} />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Keranjang Kosong</h3>
          <p className="text-gray-500 mb-8">Oops! Sepertinya Anda belum menambahkan produk apapun.</p>
          <button onClick={() => setView('shop')} className="bg-pink-600 text-white px-8 py-3 rounded-full font-bold">Mulai Belanja</button>
        </div>
      )}
    </div>
  );
}
