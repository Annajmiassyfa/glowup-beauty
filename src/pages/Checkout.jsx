import React, { useState, useEffect } from 'react';
import { CheckCircle, MapPin, CreditCard, Loader2, AlertCircle, Clock } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { createOrder, fetchAddresses } from '../services/api';

const PAYMENT_METHODS = [
  { id: 'QRIS', name: 'QRIS (Semua Pembayaran)', type: 'qris', number: '-', icon: '📱', desc: 'Scan barcode menggunakan m-banking atau aplikasi e-wallet apa saja.' },
  { id: 'Mandiri', name: 'Transfer Bank Mandiri', type: 'bank', number: '1730013032272', icon: '🏦', desc: 'Transfer antar bank atau sesama bank ke rekening Mandiri pusat.' },
  { id: 'SeaBank', name: 'Transfer SeaBank', type: 'bank', number: '901836025765', icon: '🏧', desc: 'Transfer tanpa biaya admin (gratis) ke rekening SeaBank.' },
  { id: 'Dana', name: 'Saldo Dana', type: 'ewallet', number: '082110737267', icon: '🟢', desc: 'Kirim saldo Dana langsung ke nomor agen GlowUp.' },
  { id: 'GoPay', name: 'Saldo GoPay', type: 'ewallet', number: '082110737267', icon: '🔵', desc: 'Kirim saldo GoPay langsung ke nomor agen GlowUp.' },
  { id: 'ShopeePay', name: 'Saldo ShopeePay', type: 'ewallet', number: '082110737267', icon: '🟠', desc: 'Kirim saldo ShopeePay langsung ke nomor agen GlowUp.' },
];

export default function Checkout() {
  const { cart, setCart, user, setView, showToast } = useAppContext();

  const [step, setStep]                   = useState(1);
  const [selectedMethod, setSelectedMethod] = useState(PAYMENT_METHODS[0]);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [placedOrder, setPlacedOrder]      = useState(null);

  // Shipping address from backend
  const [addresses, setAddresses]         = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(true);

  const subtotal    = cart.reduce((a, b) => a + (b.price * b.qty), 0);
  const shippingFee = 15000;
  const total       = subtotal + shippingFee;

  // Load saved addresses on mount
  useEffect(() => {
    if (!user) return;
    fetchAddresses()
      .then(data => {
        setAddresses(data);
        const primary = data.find(a => a.isPrimary);
        if (primary) setSelectedAddressId(primary.id);
      })
      .catch(() => {})
      .finally(() => setIsLoadingAddresses(false));
  }, [user]);

  const selectedAddress = addresses.find(a => a.id === selectedAddressId);

  const handlePlaceOrder = async () => {
    if (!user) {
      showToast('Silakan login terlebih dahulu.');
      setView('login');
      return;
    }
    if (!selectedAddress) {
      showToast('Pilih alamat pengiriman terlebih dahulu.');
      return;
    }

    setIsPlacingOrder(true);
    try {
      const payload = {
        items: cart.map(item => ({
          productId: item.id,
          qty: item.qty,
          price: item.price,
          discount: item.discount || 0,
        })),
        subtotal,
        shippingCost: shippingFee,
        discountAmount: 0,
        grandTotal: total,
        paymentMethod: selectedMethod.type === 'qris' ? 'QRIS' : `${selectedMethod.name} (${selectedMethod.number})`,
        shippingSnapshot: {
          recipientName: selectedAddress.recipientName,
          phone: selectedAddress.phone,
          detailAddress: selectedAddress.detailAddress,
          district: selectedAddress.district,
          city: selectedAddress.city,
          province: selectedAddress.province,
          postalCode: selectedAddress.postalCode,
          notes: selectedAddress.notes,
        },
      };

      const order = await createOrder(payload);
      setPlacedOrder(order);
      setCart([]);
      setStep(3);
    } catch (err) {
      showToast(err.message || 'Gagal membuat pesanan');
    } finally {
      setIsPlacingOrder(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {/* Progress Steps */}
      <div className="flex justify-between mb-12 relative">
        <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-gray-100 -translate-y-1/2 z-0" />
        {[1, 2, 3].map(s => (
          <div
            key={s}
            className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
              step >= s ? 'bg-pink-500 text-white' : 'bg-white border-2 border-gray-100 text-gray-300'
            }`}
          >
            {step > s ? <CheckCircle size={20} /> : s}
          </div>
        ))}
      </div>

      {/* Step 1 — Shipping Address */}
      {step === 1 && (
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-50 animate-in fade-in duration-300">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <MapPin size={22} className="text-pink-500" /> Informasi Pengiriman
          </h3>

          {!user ? (
            <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 flex items-start gap-3 mb-6">
              <AlertCircle className="text-orange-500 shrink-0 mt-0.5" size={18} />
              <div>
                <p className="font-bold text-orange-800 text-sm">Belum login</p>
                <p className="text-xs text-orange-600 mt-1">Silakan login untuk melanjutkan checkout dan melihat alamat tersimpan.</p>
                <button onClick={() => setView('login')} className="mt-2 text-xs font-bold text-pink-600 hover:underline">Login Sekarang →</button>
              </div>
            </div>
          ) : isLoadingAddresses ? (
            <div className="py-8 flex items-center justify-center gap-2 text-gray-400">
              <Loader2 size={18} className="animate-spin" />
              <span className="text-sm">Memuat alamat tersimpan...</span>
            </div>
          ) : addresses.length === 0 ? (
            <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 flex items-start gap-3 mb-6">
              <AlertCircle className="text-orange-500 shrink-0 mt-0.5" size={18} />
              <div>
                <p className="font-bold text-orange-800 text-sm">Belum ada alamat tersimpan</p>
                <p className="text-xs text-orange-600 mt-1">Tambahkan alamat pengiriman di halaman Profil terlebih dahulu.</p>
                <button onClick={() => { setView('profile'); }} className="mt-2 text-xs font-bold text-pink-600 hover:underline">Ke Halaman Profil →</button>
              </div>
            </div>
          ) : (
            <div className="space-y-3 mb-6">
              {addresses.map(addr => (
                <label
                  key={addr.id}
                  className={`flex items-start gap-4 p-4 rounded-2xl border cursor-pointer transition-all ${
                    selectedAddressId === addr.id
                      ? 'border-pink-400 bg-pink-50/50'
                      : 'border-gray-100 hover:border-pink-200'
                  }`}
                >
                  <input
                    type="radio"
                    name="address"
                    className="mt-1 text-pink-500 accent-pink-500"
                    checked={selectedAddressId === addr.id}
                    onChange={() => setSelectedAddressId(addr.id)}
                  />
                  <div className="flex-1">
                    <p className="font-bold text-gray-900 text-sm">
                      {addr.recipientName}
                      <span className="ml-2 text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-lg font-normal">{addr.label}</span>
                      {addr.isPrimary && <span className="ml-1 text-xs bg-pink-100 text-pink-600 px-2 py-0.5 rounded-lg font-bold">Utama</span>}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">{addr.phone}</p>
                    <p className="text-xs text-gray-600 mt-1">{addr.detailAddress}</p>
                    <p className="text-xs text-gray-500">{[addr.district, addr.city, addr.province, addr.postalCode].filter(Boolean).join(', ')}</p>
                  </div>
                </label>
              ))}
            </div>
          )}

          {/* Order summary */}
          {cart.length > 0 && (
            <div className="bg-gray-50 rounded-2xl p-4 mb-6 text-sm space-y-2">
              <p className="font-bold text-gray-900 mb-3">Ringkasan ({cart.length} produk)</p>
              {cart.map((item, i) => (
                <div key={i} className="flex justify-between text-gray-600 text-xs">
                  <span>{item.name} x{item.qty}</span>
                  <span>Rp {(item.price * item.qty).toLocaleString()}</span>
                </div>
              ))}
              <div className="flex justify-between text-gray-500 text-xs pt-1 border-t border-gray-100">
                <span>Ongkir</span><span>Rp {shippingFee.toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-bold text-gray-900 pt-1">
                <span>Total</span><span className="text-pink-600">Rp {total.toLocaleString()}</span>
              </div>
            </div>
          )}

          <button
            onClick={() => setStep(2)}
            disabled={!selectedAddress}
            className="mt-2 w-full bg-gray-900 text-white font-bold py-4 rounded-xl hover:bg-pink-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Lanjutkan ke Pembayaran
          </button>
        </div>
      )}

      {/* Step 2 — Payment */}
      {step === 2 && (
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-50 animate-in fade-in duration-300">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <CreditCard size={22} className="text-pink-500" /> Metode Pembayaran
            </h3>
            <button 
              onClick={() => setStep(1)} 
              className="text-xs font-bold text-gray-400 hover:text-pink-600 uppercase tracking-wider"
            >
              ← Ubah Alamat
            </button>
          </div>

          <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4 mb-8">
            <h4 className="text-sm font-bold text-orange-800 mb-1 flex items-center gap-2">
              <AlertCircle size={16} /> Instruksi Pembayaran
            </h4>
            <ul className="text-xs text-orange-700 space-y-1 list-disc pl-4 font-medium">
              <li>Silakan transfer tepat <span className="font-bold underline">Rp {total.toLocaleString()}</span> ke rekening pilihan Anda.</li>
              <li>Pastikan nama penerima adalah <span className="font-bold">AN NAJMI AS SYFA</span>.</li>
              <li>Simpan bukti transfer untuk verifikasi jika diperlukan.</li>
            </ul>
          </div>

          <div className="space-y-4 mb-8">
            {PAYMENT_METHODS.map(method => {
              const isSelected = selectedMethod.id === method.id;
              
              return (
                <div 
                  key={method.id}
                  onClick={() => setSelectedMethod(method)}
                  className={`group relative p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                    isSelected
                      ? 'border-pink-500 bg-pink-50/40 shadow-sm'
                      : 'border-gray-100 hover:border-pink-200 bg-white shadow-sm hover:shadow-md'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex gap-4 w-full pr-8">
                      <div className={`w-12 h-12 flex items-center justify-center rounded-[14px] text-2xl transition-colors ${isSelected ? 'bg-pink-100/80 shadow-inner' : 'bg-gray-50 border border-gray-100 group-hover:bg-pink-50'}`}>
                        {method.icon}
                      </div>
                      <div className="flex-1 mt-0.5">
                        <h4 className={`font-bold transition-colors text-sm lg:text-base ${isSelected ? 'text-pink-600' : 'text-gray-900 group-hover:text-pink-500'}`}>{method.name}</h4>
                        <p className="text-xs text-gray-500 leading-relaxed mt-1 font-medium">{method.desc}</p>
                        
                        {isSelected && method.type !== 'qris' && (
                          <div className="flex flex-wrap items-center gap-2 mt-3 animate-in slide-in-from-top-1 fade-in duration-300">
                            <code className="bg-white text-gray-800 px-3 py-1.5 rounded-lg text-sm font-mono font-bold tracking-tight border border-pink-200 shadow-sm">
                              {method.number}
                            </code>
                            <span className="text-[10px] bg-pink-100 text-pink-700 px-2 py-1 rounded-md font-bold uppercase tracking-wider">A/N AN NAJMI AS SYFA</span>
                          </div>
                        )}

                        {isSelected && method.type === 'qris' && (
                          <div className="mt-4 p-4 bg-white rounded-2xl border border-pink-100 shadow-sm flex flex-col items-center animate-in slide-in-from-top-1 fade-in duration-300">
                            <img 
                              src="/qris.jpg" 
                              alt="QRIS Payment" 
                              className="w-40 h-auto rounded-xl border border-gray-100"
                              onError={(e) => { e.target.src = "https://placehold.co/400?text=QRIS+GlowUp"; }}
                            />
                            <p className="text-[10px] font-bold text-gray-400 mt-3 px-3 py-1 bg-gray-50 rounded-full">A/N Anggita Tri Sundari</p>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="absolute top-5 right-5">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                        isSelected ? 'bg-pink-500 border-pink-500' : 'border-gray-300'
                      }`}>
                        {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <button
            onClick={handlePlaceOrder}
            disabled={isPlacingOrder}
            className="w-full bg-pink-600 text-white font-bold py-5 rounded-2xl shadow-xl hover:bg-pink-700 transition-all transform hover:-translate-y-1 active:translate-y-0 disabled:opacity-60 flex items-center justify-center gap-3"
          >
            {isPlacingOrder && <Loader2 size={20} className="animate-spin" />}
            {isPlacingOrder ? 'Memproses Pesanan...' : `Bayar Sekarang — Rp ${total.toLocaleString()}`}
          </button>
        </div>
      )}

      {/* Step 3 — Awaiting Payment (Manual Verification Flow) */}
      {step === 3 && (
        <div className="animate-in zoom-in duration-500 max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Clock size={40} className="animate-pulse" />
            </div>
            <h2 className="text-3xl font-serif font-bold text-gray-900 mb-2">Menunggu Pembayaran</h2>
            <p className="text-gray-500">Pesanan Anda telah kami terima dan menunggu verifikasi pembayaran.</p>
          </div>

          <div className="bg-white border-2 border-dashed border-gray-200 rounded-3xl p-6 mb-8">
            <div className="flex flex-col md:flex-row gap-8 items-center">
              
              {/* Conditional Method Visual (QRIS vs Bank Detail) */}
              <div className="w-full md:w-1/2 flex flex-col items-center justify-center min-h-[260px]">
                {selectedMethod.type === 'qris' ? (
                  <div className="animate-in fade-in zoom-in-95 duration-500 text-center flex flex-col items-center">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Scan QRIS di Bawah</p>
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 w-full max-w-[240px] transform hover:scale-105 transition-transform">
                      <img 
                        src="/qris.jpg" 
                        alt="QRIS Payment" 
                        className="w-full h-auto rounded-lg"
                        onError={(e) => { e.target.src = "https://placehold.co/400?text=QRIS+GlowUp"; }}
                      />
                    </div>
                    <p className="text-[10px] font-bold text-gray-400 mt-4 px-3 py-1 bg-gray-50 rounded-full">A/N Anggita Tri Sundari</p>
                  </div>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50/50 border border-gray-100 rounded-3xl p-6 animate-in fade-in duration-500">
                    <div className="w-16 h-16 bg-white shadow-sm border border-gray-100 rounded-[14px] flex items-center justify-center text-3xl mb-4">
                      {selectedMethod.icon}
                    </div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">{selectedMethod.name}</p>
                    <p className="text-2xl md:text-3xl font-mono font-bold text-gray-900 tracking-tight my-2">
                      {selectedMethod.number}
                    </p>
                    <p className="text-xs text-gray-500 mt-1 mb-6 font-medium">
                      A/N <span className="text-pink-600 font-bold">AN NAJMI AS SYFA</span>
                    </p>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(selectedMethod.number);
                        showToast('Nomor berhasil disalin!');
                      }}
                      className="flex items-center gap-2 px-5 py-2.5 bg-white border-2 border-gray-200 rounded-xl text-xs font-bold text-gray-700 hover:border-pink-400 hover:text-pink-600 transition-colors shadow-sm"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                      Salin Instan
                    </button>
                  </div>
                )}
              </div>

              {/* Order Summary & Final Instructions */}
              <div className="w-full md:w-1/2 space-y-4">
                <div className="bg-pink-50/60 border border-pink-100/80 p-5 rounded-2xl text-center md:text-left transition-all">
                  <p className="text-[10px] text-pink-500 font-bold uppercase tracking-widest mb-1.5">Total yang Harus Dibayar</p>
                  <p className="text-3xl font-bold text-pink-600">Rp {placedOrder?.grandTotal?.toLocaleString()}</p>
                </div>

                <div className="p-5 bg-red-50 rounded-2xl border border-red-100 flex gap-4 mt-2">
                  <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0 border border-red-200">
                    <AlertCircle size={20} className="text-red-500" />
                  </div>
                  <div>
                    <p className="font-bold text-red-800 text-sm mb-1.5">Batas Waktu Pembayaran</p>
                    <p className="text-xs text-red-700/80 leading-relaxed font-medium">
                      Anda memiliki waktu <span className="font-bold text-red-600">15 menit</span> untuk melakukan transfer/scan dan menunggu verifikasi admin. 
                      Lewat dari batas tersebut, sistem akan membatalkan pesanan secara otomatis.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl mb-8 flex gap-4 items-start">
            <div className="bg-blue-500 text-white p-1.5 rounded-lg">
              <CheckCircle size={16} />
            </div>
            <div>
              <p className="font-bold text-blue-900 text-sm">Apa langkah selanjutnya?</p>
              <p className="text-xs text-blue-700 mt-1">
                Admin akan mengecek mutasi rekening secara berkala. Setelah pembayaran Anda diverifikasi, 
                status pesanan akan berubah menjadi <span className="font-bold">"Sedang Diproses"</span>.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => { setView('profile'); }}
              className="bg-gray-900 text-white px-8 py-4 rounded-2xl font-bold hover:bg-pink-600 transition-all shadow-xl shadow-gray-200"
            >
              Cek Status & Riwayat Pesanan
            </button>
            <button
              onClick={() => setView('home')}
              className="bg-white border border-gray-200 text-gray-600 px-8 py-4 rounded-2xl font-bold hover:bg-gray-50 transition-all"
            >
              Kembali ke Beranda
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
