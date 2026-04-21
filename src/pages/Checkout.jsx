import React, { useState, useEffect } from 'react';
import { CheckCircle, MapPin, CreditCard, Loader2, AlertCircle } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { createOrder, fetchAddresses } from '../services/api';

const PAYMENT_METHODS = [
  'Transfer Bank Mandiri (1730013032272)',
  'Transfer SeaBank (901836025765)',
  'Dana (082110737267)',
  'GoPay (082110737267)',
  'ShopeePay (082110737267)',
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
        paymentMethod: selectedMethod,
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
            {[
              { id: 'Mandiri', name: 'Transfer Bank Mandiri', number: '1730013032272', icon: '🏦' },
              { id: 'SeaBank', name: 'Transfer SeaBank', number: '901836025765', icon: '🏧' },
              { id: 'Dana', name: 'Dana', number: '082110737267', icon: '📱' },
              { id: 'GoPay', name: 'GoPay', number: '082110737267', icon: '💳' },
              { id: 'ShopeePay', name: 'ShopeePay', number: '082110737267', icon: '🛍️' },
            ].map(method => {
              const methodValue = `${method.name} (${method.number})`;
              const isSelected = selectedMethod === methodValue;
              
              return (
                <div 
                  key={method.id}
                  onClick={() => setSelectedMethod(methodValue)}
                  className={`group relative p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                    isSelected
                      ? 'border-pink-500 bg-pink-50/30'
                      : 'border-gray-100 hover:border-pink-200 bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex gap-4">
                      <span className="text-2xl mt-1">{method.icon}</span>
                      <div>
                        <h4 className="font-bold text-gray-900 group-hover:text-pink-600 transition-colors">{method.name}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <code className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-sm font-mono font-bold tracking-tight">
                            {method.number}
                          </code>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigator.clipboard.writeText(method.number);
                              showToast('Nomor berhasil disalin!');
                            }}
                            className="p-1.5 hover:bg-white rounded-lg border border-transparent hover:border-gray-200 text-gray-400 hover:text-pink-500 transition-all"
                            title="Salin Nomor"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                          </button>
                        </div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase mt-2 tracking-widest">A/N AN NAJMI AS SYFA</p>
                      </div>
                    </div>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                      isSelected ? 'bg-pink-500 border-pink-500' : 'border-gray-200'
                    }`}>
                      {isSelected && <CheckCircle size={14} className="text-white" />}
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
              {/* QRIS Image */}
              <div className="w-full md:w-1/2 flex flex-col items-center">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Scan QRIS di Bawah</p>
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 w-full max-w-[240px]">
                  <img 
                    src="/qris.jpg" 
                    alt="QRIS Payment" 
                    className="w-full h-auto rounded-lg"
                    onError={(e) => { e.target.src = "https://placehold.co/400?text=QRIS+GlowUp"; }}
                  />
                </div>
                <p className="text-[10px] text-gray-400 mt-3 text-center">A/N AN NAJMI AS SYFA</p>
              </div>

              {/* Instructions Detail */}
              <div className="w-full md:w-1/2 space-y-4">
                <div className="bg-gray-50 p-4 rounded-2xl">
                  <p className="text-xs text-gray-400 font-bold uppercase mb-1">Total yang Harus Dibayar</p>
                  <p className="text-2xl font-bold text-pink-600">Rp {placedOrder?.grandTotal?.toLocaleString()}</p>
                </div>

                <div className="space-y-3">
                  <p className="text-xs font-bold text-gray-900">Metode Alternatif:</p>
                  <div className="text-xs text-gray-600 space-y-1">
                    <p>• Bank Mandiri: <span className="font-mono font-bold text-gray-900">1730013032272</span></p>
                    <p>• SeaBank: <span className="font-mono font-bold text-gray-900">901836025765</span></p>
                    <p>• Dana/GoPay: <span className="font-mono font-bold text-gray-900">082110737267</span></p>
                  </div>
                </div>

                <div className="p-3 bg-red-50 rounded-xl border border-red-100 flex gap-3">
                  <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
                  <p className="text-[10px] text-red-700 leading-relaxed font-medium">
                    Batas waktu pembayaran adalah <span className="font-bold text-red-600">15 menit</span>. 
                    Jika pembayaran tidak diverifikasi oleh admin dalam waktu tersebut, pesanan akan dibatalkan otomatis.
                  </p>
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
