import React, { useState, useEffect } from 'react';
import { Store, Package, Truck, ChevronRight, X, Loader2, MapPin, CreditCard, Hash, AlertCircle, CheckCircle2, Star, Clock } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { fetchOrders, completeOrder, submitReturn, fetchReturnsByOrder, submitReview } from '../../services/api';
import { assetUrl } from '../../services/api';

// ── Status helpers ──────────────────────────────────────────────────────────
const STATUS_LABEL = {
  Created: 'Menunggu Verifikasi',
  Processed: 'Diproses',
  Paid: 'Diproses',
  Shipped: 'Dikirim',
  Completed: 'Selesai',
  Cancelled: 'Dibatalkan',
};

const getStatusColor = (status) => {
  switch (status) {
    case 'Selesai':   return 'text-green-600 bg-green-50';
    case 'Dikirim':   return 'text-blue-600 bg-blue-50';
    case 'Dibatalkan': return 'text-red-600 bg-red-50';
    default:           return 'text-orange-600 bg-orange-50';
  }
};

// Build timeline steps from a single DB order
const buildTimeline = (order) => {
  const steps = [
    { key: 'Created',   label: 'Pesanan Dibuat',   time: order.createdAt },
    { key: 'Processed', label: 'Sedang Diproses',  time: null },
    { key: 'Shipped',   label: 'Dalam Pengiriman', time: null },
    { key: 'Completed', label: 'Pesanan Diterima', time: null },
  ];

  const ORDER = ['Created', 'Processed', 'Shipped', 'Completed'];
  const currentIdx = ORDER.indexOf(order.orderStatus);

  return steps.map((step, idx) => ({
    ...step,
    active: idx <= currentIdx,
    isCurrent: idx === currentIdx,
    time: idx === 0 ? new Date(order.createdAt).toLocaleString('id-ID') : (idx <= currentIdx ? 'Selesai' : '-'),
  }));
};

// ── Item image helper ───────────────────────────────────────────────────────
const itemImage = (item) => {
  const img = item.product?.images?.[0]?.imageUrl;
  return assetUrl(img) || `https://picsum.photos/seed/${item.productId}/100/100`;
};

// ── Main component ──────────────────────────────────────────────────────────
export default function OrderHistory() {
  const { cart, setCart, setView, showToast, user, setUser, setIsMember } = useAppContext();

  const [orders, setOrders]               = useState([]);
  const [isLoading, setIsLoading]         = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [modalType, setModalType]         = useState(null); // 'detail' | 'track' | 'return'
  const [returnReason, setReturnReason]   = useState('');
  const [returnDetail, setReturnDetail]   = useState('');
  const [returnItem, setReturnItem]       = useState('');     // product name (display)
  const [returnItemId, setReturnItemId]   = useState(null);   // orderItemId (for DB)
  const [isSubmittingReturn, setIsSubmittingReturn] = useState(false);
  const [completingId, setCompletingId]   = useState(null);
  const [orderReturns, setOrderReturns]   = useState([]);     // returns for current selected order
  const [isLoadingReturns, setIsLoadingReturns] = useState(false);

  // Review states
  const [reviewRating, setReviewRating]   = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewItemId, setReviewItemId]   = useState(null);   // orderItemId being reviewed
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Load orders from backend on mount
  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    setIsLoading(true);
    try {
      const data = await fetchOrders();
      setOrders(data);
    } catch (err) {
      showToast('Gagal memuat pesanan: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // ── Helpers ──────────────────────────────────────────────────────────────
  const displayStatus = (order) =>
    order.statusLabel || STATUS_LABEL[order.orderStatus] || order.orderStatus;

  const openModal = (order, type) => {
    setSelectedOrder(order);
    setModalType(type);
    setReturnReason('');
    setReturnDetail('');
    setOrderReturns([]);
    // Default select first item
    const firstItem = order.items?.[0];
    setReturnItem(firstItem?.product?.name || '');
    setReturnItemId(firstItem?.id || null);
    // If opening return modal, preload existing returns for this order
    if (type === 'return') {
      setIsLoadingReturns(true);
      fetchReturnsByOrder(order.id)
        .then(data => setOrderReturns(data))
        .catch(() => {})
        .finally(() => setIsLoadingReturns(false));
    }
    // If opening review modal
    if (type === 'review') {
      const firstItem = order.items?.[0];
      setReviewItemId(firstItem?.id || null);
      setReviewRating(5);
      setReviewComment('');
    }
  };

  // ── Reorder — add items back to cart ─────────────────────────────────────
  const handleReorder = (order) => {
    let currentCart = [...cart];
    order.items.forEach(orderItem => {
      const productData = {
        id: orderItem.productId,
        name: orderItem.product?.name || 'Produk',
        price: orderItem.price,
        image: itemImage(orderItem),
        brand: orderItem.product?.brand?.name || '',
      };
      const exists = currentCart.find(c => c.id === productData.id);
      if (exists) {
        currentCart = currentCart.map(c =>
          c.id === productData.id ? { ...c, qty: c.qty + orderItem.qty } : c
        );
      } else {
        currentCart.push({ ...productData, qty: orderItem.qty });
      }
    });
    setCart(currentCart);
    setView('cart');
    showToast(`${order.items.length} item berhasil ditambahkan ke keranjang!`);
  };

  // ── Mark as received + award points ──────────────────────────────────
  const handleMarkReceived = async (orderId) => {
    setCompletingId(orderId);
    try {
      const result = await completeOrder(orderId);
      // Update local order list
      setOrders(prev =>
        prev.map(o =>
          o.id === orderId
            ? { ...o, orderStatus: 'Completed', statusLabel: 'Selesai', shippingStatus: 'Delivered' }
            : o
        )
      );
      // Sync user context with updated points + tier from backend
      if (result.user) {
        setUser(result.user);
        setIsMember(result.user.isMember);
      }
      // Toast with points info if earned
      const pts = result.pointsEarned;
      showToast(pts > 0
        ? `Pesanan selesai! +${pts} poin ditambahkan ke akun kamu 🎉`
        : 'Pesanan berhasil diselesaikan!'
      );
    } catch (err) {
      showToast(err.message || 'Gagal menyelesaikan pesanan');
    } finally {
      setCompletingId(null);
    }
  };

  // ── Submit return request to backend ────────────────────────────────────
  const handleSubmitReturn = async (e) => {
    e.preventDefault();
    if (!returnReason || !returnDetail.trim() || !returnItem) {
      showToast('Mohon lengkapi semua field pengajuan retur');
      return;
    }
    if (returnDetail.trim().length < 10) {
      showToast('Detail kendala harus diisi minimal 10 karakter');
      return;
    }
    setIsSubmittingReturn(true);
    try {
      const newReturn = await submitReturn({
        orderId: selectedOrder.id,
        orderItemId: returnItemId || undefined,
        productName: returnItem,
        reason: returnReason,
        detail: returnDetail.trim(),
      });
      // Update local returns list so the badge appears immediately
      setOrderReturns(prev => [newReturn, ...prev]);
      setModalType(null);
      showToast('Pengajuan pengembalian berhasil dikirim! Tim kami akan menghubungi Anda dalam 1x24 jam.');
    } catch (err) {
      showToast(err.message || 'Gagal mengirim pengajuan retur');
    } finally {
      setIsSubmittingReturn(false);
    }
  };

  // ── Submit Review ─────────────────────────────────────────────────────────
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!reviewItemId) return;

    setIsSubmittingReview(true);
    try {
      const item = selectedOrder.items.find(i => i.id === reviewItemId);
      await submitReview({
        productId: item.productId,
        orderItemId: reviewItemId,
        rating: reviewRating,
        comment: reviewComment.trim()
      });

      // Update local state to reflect the item is now reviewed
      setOrders(prev => prev.map(o => {
        if (o.id === selectedOrder.id) {
          return {
            ...o,
            items: o.items.map(i => i.id === reviewItemId ? { ...i, review: { rating: reviewRating } } : i)
          };
        }
        return o;
      }));

      setModalType(null);
      showToast('Terima kasih! Ulasan kamu sangat berharga bagi kami.');
    } catch (err) {
      showToast(err.message || 'Gagal mengirim ulasan');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // ── Shipping snapshot helper ──────────────────────────────────────────────
  const parseSnapshot = (snapshotStr) => {
    if (!snapshotStr) return null;
    try {
      return typeof snapshotStr === 'string' ? JSON.parse(snapshotStr) : snapshotStr;
    } catch {
      return null;
    }
  };

  // ── Modal renderer ─────────────────────────────────────────────────────────
  const renderModal = () => {
    if (!selectedOrder || !modalType) return null;

    const snapshot = parseSnapshot(selectedOrder.shippingSnapshot);
    const status   = displayStatus(selectedOrder);
    const timeline = buildTimeline(selectedOrder);

    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm animate-in fade-in"
        onClick={() => setModalType(null)}
      >
        <div
          className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          onClick={e => e.stopPropagation()}
        >
          {/* Modal header */}
          <div className="flex justify-between items-center p-6 border-b border-gray-100 shrink-0">
            <h3 className="font-bold text-lg text-gray-900">
              {modalType === 'detail' && `Detail Pesanan #${selectedOrder.id}`}
              {modalType === 'track'  && 'Lacak Pengiriman'}
              {modalType === 'return' && 'Ajukan Pengembalian'}
            </h3>
            <button onClick={() => setModalType(null)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <X size={20} />
            </button>
          </div>

          <div className="p-6 overflow-y-auto space-y-5">
            {/* ── DETAIL VIEW ── */}
            {modalType === 'detail' && (
              <div className="space-y-5 text-sm text-gray-600">
                {/* Order meta */}
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 grid grid-cols-2 gap-4">
                  <div>
                    <span className="block text-xs text-gray-400 font-bold uppercase mb-1">Tanggal</span>
                    <span className="font-medium text-gray-900">{new Date(selectedOrder.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                  </div>
                  <div>
                    <span className="block text-xs text-gray-400 font-bold uppercase mb-1">Status</span>
                    <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold uppercase ${getStatusColor(status)}`}>{status}</span>
                  </div>
                  <div>
                    <span className="block text-xs text-gray-400 font-bold uppercase mb-1">No. Resi</span>
                    <span className="font-mono text-gray-900 text-xs">{selectedOrder.trackingNumber || '-'}</span>
                  </div>
                  <div>
                    <span className="block text-xs text-gray-400 font-bold uppercase mb-1">Pembayaran</span>
                    <span className="font-medium text-gray-900">{selectedOrder.paymentMethod || '-'}</span>
                  </div>
                </div>

                {/* Shipping snapshot */}
                {snapshot && (
                  <div className="bg-blue-50/40 p-4 rounded-xl border border-blue-100">
                    <p className="text-xs text-blue-600 font-bold uppercase mb-2 flex items-center gap-1"><MapPin size={12} /> Alamat Pengiriman</p>
                    <p className="font-bold text-gray-900 text-sm">{snapshot.recipientName} — {snapshot.phone}</p>
                    <p className="text-gray-600 text-xs mt-1">{snapshot.detailAddress}</p>
                    <p className="text-gray-500 text-xs">{[snapshot.district, snapshot.city, snapshot.province, snapshot.postalCode].filter(Boolean).join(', ')}</p>
                  </div>
                )}

                {/* Items */}
                <div>
                  <h4 className="font-bold text-gray-900 mb-3 border-b pb-2">Daftar Produk</h4>
                  <div className="space-y-4 mt-3">
                    {selectedOrder.items.map((item, i) => (
                      <div key={i} className="flex gap-4">
                        <img
                          src={itemImage(item)}
                          alt={item.product?.name}
                          className="w-16 h-16 rounded-xl bg-gray-100 object-cover border border-gray-100"
                          onError={e => { e.target.src = `https://picsum.photos/seed/${item.productId}/64/64`; }}
                        />
                        <div className="flex-1">
                          <p className="font-bold text-gray-900 line-clamp-1">{item.product?.name || 'Produk'}</p>
                          <p className="text-xs text-gray-500 mt-0.5">x{item.qty}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-pink-600">Rp {item.price.toLocaleString()}</p>
                          <p className="text-xs text-gray-400">@{item.qty}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Payment summary */}
                <div className="border-t pt-4">
                  <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-1"><CreditCard size={14} /> Ringkasan Pembayaran</h4>
                  
                  {/* MANUAL PAYMENT INSTRUCTIONS - Shown only if status is Created */}
                  {selectedOrder.orderStatus === 'Created' && (
                    <div className="mb-6 space-y-4">
                      <div className="bg-orange-50 border border-orange-100 p-4 rounded-2xl flex gap-3">
                        <Clock size={20} className="text-orange-500 shrink-0" />
                        <div>
                          <p className="text-sm font-bold text-orange-800">Menunggu Verifikasi</p>
                          <p className="text-[10px] text-orange-700 leading-relaxed font-medium">
                            Admin akan memverifikasi pembayaran Anda secara manual. Jika dalam <span className="font-bold">15 menit</span> pembayaran belum dikonfirmasi, pesanan akan dibatalkan otomatis.
                          </p>
                        </div>
                      </div>

                      <div className="bg-white border-2 border-dashed border-gray-200 rounded-2xl p-4 flex flex-col items-center">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Scan QRIS / Transfer</p>
                        <img 
                          src="/qris.jpg" 
                          alt="QRIS Payment" 
                          className="w-40 h-40 rounded-lg shadow-sm mb-4"
                          onError={(e) => { e.target.src = "https://placehold.co/400?text=QRIS"; }}
                        />
                        <div className="w-full space-y-2">
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-500">Bank Mandiri</span>
                            <span className="font-mono font-bold">1730013032272</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-500">SeaBank</span>
                            <span className="font-mono font-bold">901836025765</span>
                          </div>
                          <div className="flex justify-between text-xs border-t border-gray-50 pt-2">
                            <span className="text-gray-500">A/N Penerima</span>
                            <span className="font-bold text-pink-600">AN NAJMI AS SYFA</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 mb-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-3 opacity-10">
                      <CreditCard size={48} />
                    </div>
                    
                    <div className="relative z-10 space-y-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Total Transfer</p>
                          <p className="font-bold text-pink-600 text-lg">
                             Rp {selectedOrder.grandTotal.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs px-1">
                    <div className="flex justify-between"><span className="text-gray-500">Subtotal Produk</span><span>Rp {selectedOrder.subtotal.toLocaleString()}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Ongkos Kirim</span><span>Rp {selectedOrder.shippingCost.toLocaleString()}</span></div>
                    {selectedOrder.discountAmount > 0 && (
                      <div className="flex justify-between text-green-600"><span>Diskon</span><span>-Rp {selectedOrder.discountAmount.toLocaleString()}</span></div>
                    )}
                    <div className="flex justify-between font-bold text-sm text-gray-900 pt-2 border-t mt-2">
                      <span>Total Belanja</span>
                      <span className="text-pink-600">Rp {selectedOrder.grandTotal.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
}
                    </div>
                  </div>
                  <div className="space-y-2 text-xs px-1">
                    <div className="flex justify-between"><span className="text-gray-500">Subtotal Produk</span><span>Rp {selectedOrder.subtotal.toLocaleString()}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Ongkos Kirim</span><span>Rp {selectedOrder.shippingCost.toLocaleString()}</span></div>
                    {selectedOrder.discountAmount > 0 && (
                      <div className="flex justify-between text-green-600"><span>Diskon</span><span>-Rp {selectedOrder.discountAmount.toLocaleString()}</span></div>
                    )}
                    <div className="flex justify-between font-bold text-sm text-gray-900 pt-2 border-t mt-2">
                      <span>Total Belanja</span>
                      <span className="text-pink-600">Rp {selectedOrder.grandTotal.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── TRACKING VIEW ── */}
            {modalType === 'track' && (
              <div>
                <div className="bg-blue-50/50 text-blue-900 p-4 rounded-xl border border-blue-100 mb-6 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-blue-600 font-bold uppercase mb-1">Kurir Pengiriman</p>
                    <p className="font-bold text-sm flex items-center gap-2">
                      <Hash size={14} /> {selectedOrder.trackingNumber || 'Belum ada resi'}
                    </p>
                  </div>
                  <Truck className="text-blue-500" size={24} />
                </div>

                <div className="relative pl-6 space-y-6 before:content-[''] before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-pink-100">
                  {timeline.map((step, i) => (
                    <div key={i} className="relative flex items-center gap-4">
                      <div className={`absolute left-[-24px] w-4 h-4 rounded-full border-4 border-white z-10 ${
                        step.isCurrent ? 'bg-pink-500 ring-4 ring-pink-50'
                        : step.active ? 'bg-green-400'
                        : 'bg-gray-200'
                      }`} />
                      <div className={step.active ? 'text-gray-900' : 'text-gray-400'}>
                        <p className={`text-sm font-bold ${step.isCurrent ? 'text-pink-600' : ''}`}>{step.label}</p>
                        <p className="text-xs mt-0.5">{step.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── RETURN VIEW ── */}
            {modalType === 'return' && (
              <form onSubmit={handleSubmitReturn} className="space-y-4">
                {/* Existing returns status */}
                {isLoadingReturns ? (
                  <div className="flex items-center gap-2 text-sm text-gray-400 py-2">
                    <Loader2 size={14} className="animate-spin" /> Memuat status retur...
                  </div>
                ) : orderReturns.length > 0 ? (
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Pengajuan Retur Sebelumnya</p>
                    {orderReturns.map(r => (
                      <div key={r.id} className="flex items-center justify-between bg-gray-50 border border-gray-100 rounded-xl px-4 py-3">
                        <div>
                          <p className="text-sm font-bold text-gray-800">{r.productName}</p>
                          <p className="text-xs text-gray-500 mt-0.5 capitalize">{r.reason} · {new Date(r.createdAt).toLocaleDateString('id-ID')}</p>
                        </div>
                        <span className={`text-xs font-bold px-2 py-1 rounded-lg ${
                          r.status === 'Approved'   ? 'bg-green-100 text-green-700' :
                          r.status === 'Rejected'   ? 'bg-red-100 text-red-700' :
                          r.status === 'Completed'  ? 'bg-blue-100 text-blue-700' :
                          'bg-orange-100 text-orange-700' // Pending
                        }`}>{r.status}</span>
                      </div>
                    ))}
                    <div className="border-t border-gray-100 pt-3 mt-1" />
                  </div>
                ) : null}

                <div className="bg-orange-50 p-4 rounded-xl border border-orange-100 text-xs text-orange-800 leading-relaxed font-medium">
                  Sertakan video unboxing tanpa cut agar proses retur dapat tervalidasi dan diproses lebih cepat!
                </div>

                <div>
                  <label className="text-sm font-bold text-gray-700 block mb-1.5">Produk yang Bermasalah</label>
                  <select
                    value={returnItemId || ''}
                    onChange={e => {
                      const selectedId = parseInt(e.target.value);
                      const found = selectedOrder.items.find(i => i.id === selectedId);
                      setReturnItemId(selectedId);
                      setReturnItem(found?.product?.name || '');
                    }}
                    required
                    className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 outline-none focus:border-pink-300 focus:bg-white transition-colors text-sm"
                  >
                    {selectedOrder.items.map((item, i) => (
                      <option key={i} value={item.id}>{item.product?.name || 'Produk'} (x{item.qty})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-bold text-gray-700 block mb-1.5">Alasan Pengembalian</label>
                  <select
                    value={returnReason}
                    onChange={e => setReturnReason(e.target.value)}
                    required
                    className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 outline-none focus:border-pink-300 focus:bg-white transition-colors text-sm"
                  >
                    <option value="">-- Pilih alasan utama --</option>
                    <option value="rusak">Barang mengalami kerusakan/cacat fisik</option>
                    <option value="salah">Barang yang dikirim tidak sesuai pesanan</option>
                    <option value="kurang">Jumlah kemasan kurang dari deskripsi produk</option>
                    <option value="kedaluwarsa">Produk mendekati atau sudah kedaluwarsa</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-bold text-gray-700 block mb-1.5">Detail Kendala</label>
                  <textarea
                    rows="3"
                    required
                    value={returnDetail}
                    onChange={e => setReturnDetail(e.target.value)}
                    className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 outline-none focus:border-pink-300 focus:bg-white transition-colors text-sm resize-none"
                    placeholder="Jelaskan kondisi box, segel, dan masalah produk saat diterima..."
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmittingReturn}
                    className="w-full p-3.5 bg-gray-900 hover:bg-pink-600 shadow-md text-white font-bold rounded-xl transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {isSubmittingReturn && <Loader2 size={16} className="animate-spin" />}
                    {isSubmittingReturn ? 'Mengirim...' : 'Kirim Pengajuan Retur'}
                  </button>
                </div>
              </form>
            )}

            {/* ── REVIEW VIEW ── */}
            {modalType === 'review' && (
              <form onSubmit={handleSubmitReview} className="space-y-6">
                <div className="bg-pink-50 p-4 rounded-xl border border-pink-100 flex items-center gap-4">
                  <div className="w-16 h-16 rounded-lg overflow-hidden border border-white shrink-0">
                    <img
                      src={itemImage(selectedOrder.items.find(i => i.id === reviewItemId))}
                      alt="Product"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-bold text-pink-600 uppercase mb-1">Beri Ulasan Untuk</p>
                    <p className="text-sm font-bold text-gray-900 line-clamp-1">
                      {selectedOrder.items.find(i => i.id === reviewItemId)?.product?.name || 'Produk'}
                    </p>
                  </div>
                </div>

                <div className="text-center">
                  <p className="text-sm font-bold text-gray-700 mb-3">Bagaimana kualitas produk ini?</p>
                  <div className="flex justify-center gap-2">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewRating(star)}
                        className="p-1 transition-transform hover:scale-110"
                      >
                        <Star
                          size={32}
                          className={star <= reviewRating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}
                        />
                      </button>
                    ))}
                  </div>
                  <p className="text-xs font-medium text-gray-400 mt-2">
                    {['Sangat Buruk', 'Buruk', 'Cukup', 'Bagus', 'Sangat Bagus'][reviewRating - 1]}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-bold text-gray-700 block mb-1.5">Tulis Ulasan (Opsional)</label>
                  <textarea
                    rows="4"
                    value={reviewComment}
                    onChange={e => setReviewComment(e.target.value)}
                    className="w-full p-4 rounded-2xl border border-gray-200 bg-gray-50 outline-none focus:border-pink-300 focus:bg-white transition-all text-sm resize-none"
                    placeholder="Ceritakan pengalamanmu menggunakan produk ini..."
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmittingReview}
                    className="w-full p-4 bg-gray-900 hover:bg-pink-600 shadow-xl text-white font-bold rounded-2xl transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {isSubmittingReview && <Loader2 size={18} className="animate-spin" />}
                    {isSubmittingReview ? 'Mengirim...' : 'Kirim Ulasan'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    );
  };

  // ── Loading state ───────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="py-16 text-center animate-in fade-in duration-300">
        <Loader2 className="w-8 h-8 text-pink-400 animate-spin mx-auto mb-3" />
        <p className="text-sm text-gray-400">Memuat riwayat pesanan...</p>
      </div>
    );
  }

  // ── Empty state ─────────────────────────────────────────────────────────────
  if (orders.length === 0) {
    return (
      <div className="py-12 bg-white text-center rounded-3xl border border-gray-100 shadow-sm animate-in fade-in duration-300">
        <Package size={48} className="mx-auto text-gray-300 mb-4" />
        <p className="text-gray-500 mb-4">Kamu belum memiliki riwayat pesanan.</p>
        <button onClick={() => setView('shop')} className="text-pink-600 font-bold hover:underline">
          Mulai Belanja Sekarang
        </button>
      </div>
    );
  }

  // ── Order list ──────────────────────────────────────────────────────────────
  return (
    <>
      <div className="space-y-6 animate-in fade-in duration-300">
        {orders.map(order => {
          const status = displayStatus(order);
          return (
            <div key={order.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">

              {/* Header */}
              <div className="px-6 py-4 border-b border-gray-50 flex flex-wrap justify-between items-center gap-4 bg-gray-50/30">
                <div className="flex items-center gap-3">
                  <Store size={18} className="text-gray-500" />
                  <span className="font-bold text-gray-900 text-sm">GlowUp Girls</span>
                  <button onClick={() => setView('shop')} className="flex items-center text-xs text-gray-500 hover:text-pink-600 bg-white px-2 py-1 rounded border border-gray-200 transition-colors">
                    Kunjungi Toko <ChevronRight size={14} />
                  </button>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-400 font-medium hidden md:inline">
                    {new Date(order.createdAt).toLocaleDateString('id-ID')} | #{order.id}
                  </span>
                  <span className={`px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wide ${getStatusColor(status)}`}>
                    {status}
                  </span>
                </div>
              </div>

              {/* Items */}
              <div className="px-6">
                {order.items.map((item, idx) => (
                  <div key={idx} className={`flex gap-4 py-5 ${idx > 0 ? 'border-t border-gray-50' : ''}`}>
                    <div className="w-20 h-20 rounded-xl overflow-hidden border border-gray-100 bg-gray-50 flex-shrink-0">
                      <img
                        src={itemImage(item)}
                        alt={item.product?.name}
                        className="w-full h-full object-cover"
                        onError={e => { e.target.src = `https://picsum.photos/seed/${item.productId}/80/80`; }}
                      />
                    </div>
                    <div className="flex-1 flex flex-col justify-between">
                      <h4 className="font-bold text-gray-900 text-sm line-clamp-2">{item.product?.name || 'Produk'}</h4>
                      <p className="text-gray-500 text-sm font-medium">x{item.qty}</p>
                    </div>
                    <div className="text-right flex flex-col justify-center gap-2">
                      <span className="font-bold text-pink-600 text-sm">Rp {item.price.toLocaleString()}</span>
                      {status === 'Selesai' && (
                        item.review ? (
                          <div className="flex items-center justify-end gap-1 text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded">
                            <Star size={10} fill="currentColor" /> Sudah Diulas
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setSelectedOrder(order);
                              setReviewItemId(item.id);
                              setModalType('review');
                            }}
                            className="text-[10px] font-bold text-pink-600 border border-pink-200 bg-pink-50 px-2 py-1 rounded hover:bg-pink-100 transition-colors"
                          >
                            Beri Ulasan
                          </button>
                        )
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="px-6 py-5 bg-orange-50/30 border-t border-gray-50 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="text-gray-500 text-xs flex items-center gap-2">
                  {status === 'Dikirim' && <Truck size={16} className="text-blue-500" />}
                  {status === 'Dikirim'
                    ? `Resi: ${order.trackingNumber || '-'}`
                    : status === 'Selesai'
                    ? 'Pesanan telah diselesaikan. Terima kasih!'
                    : 'Pesanan sedang diproses oleh tim kami.'
                  }
                </div>

                <div className="flex flex-col items-end gap-4 w-full md:w-auto">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600 text-sm">Total Pesanan:</span>
                    <span className="text-xl font-bold text-pink-600">Rp {order.grandTotal.toLocaleString()}</span>
                  </div>

                  <div className="flex flex-wrap gap-2 justify-end w-full">
                    {status === 'Selesai' && (
                      <button
                        onClick={() => handleReorder(order)}
                        className="px-5 py-2.5 bg-pink-600 text-white rounded-xl hover:bg-pink-700 text-sm font-bold shadow-sm transition-colors"
                      >
                        Beli Lagi
                      </button>
                    )}
                    {status === 'Selesai' && (
                      <button
                        onClick={() => openModal(order, 'return')}
                        className="px-5 py-2.5 border border-gray-200 bg-white text-gray-700 rounded-xl hover:bg-gray-50 text-sm font-bold shadow-sm transition-colors"
                      >
                        Ajukan Pengembalian
                      </button>
                    )}
                    {status === 'Dikirim' && (
                      <button
                        onClick={() => handleMarkReceived(order.id)}
                        disabled={completingId === order.id}
                        className="px-5 py-2.5 bg-pink-600 text-white rounded-xl hover:bg-pink-700 text-sm font-bold shadow-sm transition-colors disabled:opacity-60 flex items-center gap-2"
                      >
                        {completingId === order.id && <Loader2 size={14} className="animate-spin" />}
                        Pesanan Diterima
                      </button>
                    )}
                    {status === 'Dikirim' && (
                      <button
                        onClick={() => openModal(order, 'track')}
                        className="px-5 py-2.5 border border-pink-200 bg-pink-50 text-pink-600 rounded-xl hover:bg-pink-100 text-sm font-bold transition-colors"
                      >
                        Lacak Pengiriman
                      </button>
                    )}
                    <button
                      onClick={() => openModal(order, 'detail')}
                      className="px-5 py-2.5 border border-gray-200 bg-white text-gray-700 rounded-xl hover:bg-gray-50 text-sm font-bold shadow-sm transition-colors"
                    >
                      Lihat Detail
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {renderModal()}
    </>
  );
}
