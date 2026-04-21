import React, { useState, useEffect } from 'react';
import { LayoutDashboard, TrendingUp, ShoppingCart, Package, Users, Search, Edit, Trash2, Star, Plus, X, Loader2, RotateCcw } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { CATEGORIES, BRANDS } from '../data/mockData';
import ImageUpload from '../components/ui/ImageUpload';
import { fetchProducts, createProduct, updateProduct, deleteProduct, assetUrl, adminFetchAllReturns, adminUpdateReturnStatus, adminFetchStats, adminFetchOrders, adminUpdateOrder } from '../services/api';

// Helper: get the primary image URL for a product (from DB structure or legacy mock)
const getProductImage = (product) => {
  if (!product) return '';
  // Normalized format: images is an array of strings (URLs)
  if (product.images && product.images.length > 0) {
    const primary = product.images[0];
    // If it's an object (Prisma structure), use .imageUrl, if string use directly
    const url = typeof primary === 'string' ? primary : primary.imageUrl;
    return assetUrl(url);
  }
  // Fallback
  if (product.image) return assetUrl(product.image);
  return `https://picsum.photos/seed/${product.id}/400/500`;
};

const EMPTY_FORM = {
  name: '',
  brand: BRANDS[0] || '',
  category: CATEGORIES[0] || 'Skincare',
  price: '',
  compareAtPrice: '',
  stock: '',
  description: '',
  ingredients: '',
  usage: '',
};

export default function Admin() {
  const { user, setView, showToast, products, setProducts } = useAppContext();

  // Internal Guard: Only 'Admin' role can access the dashboard
  if (!user || user.role !== 'Admin') {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-8">
        <div className="w-20 h-20 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-6">
          <X size={40} />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Akses Ditolak</h2>
        <p className="text-gray-500 max-w-md mb-8">
          Anda tidak memiliki izin untuk mengakses halaman dashboard admin. 
          Silakan hubungi administrator sistem atau masuk dengan akun yang sesuai.
        </p>
        <button 
          onClick={() => setView('home')}
          className="bg-gray-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-pink-600 transition-all shadow-lg"
        >
          Kembali ke Beranda
        </button>
      </div>
    );
  }

  const [isLoadingProducts, setIsLoadingProducts] = useState(true);

  // ── Modal state ──
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState(EMPTY_FORM);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // ── Delete confirm state ──
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // ── Returns state ──
  const [returns, setReturns] = useState([]);
  const [isLoadingReturns, setIsLoadingReturns] = useState(true);
  const [returnStatusFilter, setReturnStatusFilter] = useState(''); // '' = all
  const [updatingReturnId, setUpdatingReturnId] = useState(null);

  // ── Stats and Orders state ──
  const [stats, setStats] = useState({ totalSales: 0, activeOrders: 0, totalProducts: 0, totalCustomers: 0 });
  const [orders, setOrders] = useState([]);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const [updatingOrderId, setUpdatingOrderId] = useState(null);

  // ── Load data from backend on mount ──
  useEffect(() => {
    loadProducts();
    loadReturns();
    loadStats();
    loadOrders();
  }, []);

  useEffect(() => { loadReturns(); }, [returnStatusFilter]);

  const loadReturns = async () => {
    setIsLoadingReturns(true);
    try {
      const data = await adminFetchAllReturns(returnStatusFilter);
      setReturns(data);
    } catch (err) {
      // Silently handle
    } finally {
      setIsLoadingReturns(false);
    }
  };

  const loadStats = async () => {
    setIsLoadingStats(true);
    try {
      const data = await adminFetchStats();
      setStats(data);
    } catch (err) {}
    finally { setIsLoadingStats(false); }
  };

  const loadOrders = async () => {
    setIsLoadingOrders(true);
    try {
      const data = await adminFetchOrders();
      setOrders(data);
    } catch (err) {}
    finally { setIsLoadingOrders(false); }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    let payload = { orderStatus: newStatus };
    
    // Payment verification flow: when moving from Created to Processed, or if marked as Processed, ensure paymentStatus is Paid
    if (newStatus === 'Processed') {
      payload.paymentStatus = 'Paid';
    }

    if (newStatus === 'Shipped') {
      const tracking = prompt('Masukkan nomor resi pengiriman:', `REG-${Date.now().toString().slice(-6)}`);
      if (tracking === null) return; // cancelled
      payload.trackingNumber = tracking;
    }

    setUpdatingOrderId(orderId);
    try {
      const updated = await adminUpdateOrder(orderId, payload);
      // 'updated' is already 'json.order' from api.js's adminUpdateOrder
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, ...updated } : o));
      showToast(`Pesanan #${orderId} diperbarui ke "${newStatus}"`);
      
      // Refresh related data immediately
      loadStats();
      loadProducts();
    } catch (err) {
      showToast(err.message || 'Gagal memperbarui pesanan');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handleUpdateReturnStatus = async (returnId, newStatus) => {
    setUpdatingReturnId(returnId);
    try {
      const updated = await adminUpdateReturnStatus(returnId, newStatus);
      setReturns(prev => prev.map(r => r.id === returnId ? { ...r, status: updated.status } : r));
      showToast(`Status retur #${returnId} diubah ke "${newStatus}"`);
    } catch (err) {
      showToast(err.message || 'Gagal mengubah status retur');
    } finally {
      setUpdatingReturnId(null);
    }
  };

  const loadProducts = async () => {
    setIsLoadingProducts(true);
    try {
      const data = await fetchProducts();
      setProducts(data);
    } catch (err) {
      showToast('Gagal memuat produk: ' + err.message);
    } finally {
      setIsLoadingProducts(false);
    }
  };

  // ── Modal helpers ──
  const openAddModal = () => {
    setEditingProduct(null);
    setProductForm(EMPTY_FORM);
    setImageFile(null);
    setImagePreview('');
    setIsModalOpen(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name || '',
      brand: product.brand || BRANDS[0],
      category: product.category || CATEGORIES[0],
      price: product.price?.toString() || '',
      compareAtPrice: product.compareAtPrice?.toString() || '',
      stock: product.stock?.toString() || '',
      description: product.description || '',
      ingredients: product.ingredients || '',
      usage: product.usage || '',
    });
    setImageFile(null);
    // Show existing product image as preview
    setImagePreview(getProductImage(product));
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
    setImageFile(null);
    setImagePreview('');
  };

  // ── Image picker handler from ImageUpload component ──
  const handleImageChange = (previewUrl, file) => {
    setImagePreview(previewUrl);
    setImageFile(file || null);
  };

  const handleImageRemove = () => {
    setImagePreview('');
    setImageFile(null);
  };

  // ── Save product (create or update) ──
  const handleSaveProduct = async () => {
    if (!productForm.name.trim()) {
      showToast('Nama produk wajib diisi!');
      return;
    }
    if (!productForm.price) {
      showToast('Harga produk wajib diisi!');
      return;
    }

    setIsSaving(true);
    try {
      const fields = {
        name: productForm.name,
        category: productForm.category,
        brand: productForm.brand,
        price: productForm.price,
        compareAtPrice: productForm.compareAtPrice || null,
        stock: productForm.stock || '0',
        description: productForm.description,
        ingredients: productForm.ingredients,
        usage: productForm.usage,
      };

      let savedProduct;
      if (editingProduct) {
        savedProduct = await updateProduct(editingProduct.id, fields, imageFile);
        // Replace in local state
        setProducts(prev => prev.map(p => p.id === savedProduct.id ? savedProduct : p));
        showToast('Produk berhasil diperbarui!');
      } else {
        savedProduct = await createProduct(fields, imageFile);
        // Prepend to local state
        setProducts(prev => [savedProduct, ...prev]);
        showToast('Produk baru berhasil ditambahkan!');
      }

      closeModal();
    } catch (err) {
      showToast(err.message || 'Terjadi kesalahan saat menyimpan produk');
    } finally {
      setIsSaving(false);
    }
  };

  // ── Delete product ──
  const handleConfirmDelete = async () => {
    if (!deleteConfirmId) return;
    setIsDeleting(true);
    try {
      await deleteProduct(deleteConfirmId);
      setProducts(prev => prev.filter(p => p.id !== deleteConfirmId));
      showToast('Produk berhasil dihapus!');
      setDeleteConfirmId(null);
    } catch (err) {
      showToast(err.message || 'Gagal menghapus produk');
    } finally {
      setIsDeleting(false);
    }
  };

  const topSelling = [...products].sort((a, b) => (b.sold || 0) - (a.sold || 0)).slice(0, 5);

  return (
    <div className="bg-gray-50 min-h-screen relative">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <LayoutDashboard /> Admin Dashboard
          </h2>
          <button onClick={openAddModal} className="bg-pink-600 text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2 text-sm shadow-lg shadow-pink-100 hover:bg-pink-700 transition-colors">
            <Plus size={18} /> Produk Baru
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          {[
            { label: 'Total Sales', value: `Rp ${stats.totalSales.toLocaleString()}`, icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
            { label: 'Active Orders', value: stats.activeOrders.toString(), icon: ShoppingCart, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Total Products', value: (stats.totalProducts || products.length).toString(), icon: Package, color: 'text-purple-600', bg: 'bg-purple-50' },
            { label: 'Customers', value: stats.totalCustomers.toString(), icon: Users, color: 'text-orange-600', bg: 'bg-orange-50' }
          ].map((stat, i) => (
            <div key={i} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
              <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center mb-4`}>
                <stat.icon size={24} />
              </div>
              <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
              {isLoadingStats ? (
                <div className="h-8 w-24 bg-gray-100 animate-pulse rounded"></div>
              ) : (
                <h4 className="text-2xl font-bold text-gray-900">{stat.value}</h4>
              )}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Product table */}
          <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-[600px]">
            <div className="p-6 border-b border-gray-50 flex items-center justify-between">
              <h3 className="font-bold text-gray-900">Kelola Produk</h3>
              <div className="flex gap-2">
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input placeholder="Cari..." className="bg-gray-50 border-none rounded-lg py-2 pl-9 pr-4 text-xs outline-none focus:ring-2 focus:ring-pink-100" />
                </div>
              </div>
            </div>

            <div className="overflow-y-auto flex-1 p-0">
              {isLoadingProducts ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <Loader2 className="w-8 h-8 text-pink-400 animate-spin mx-auto mb-2" />
                    <p className="text-sm text-gray-400">Memuat produk...</p>
                  </div>
                </div>
              ) : products.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-8">
                  <Package size={48} className="text-gray-200 mb-3" />
                  <p className="text-gray-400 text-sm">Belum ada produk. Tambahkan produk pertama Anda!</p>
                </div>
              ) : (
                <table className="w-full text-left relative">
                  <thead className="sticky top-0 bg-gray-50/90 backdrop-blur-md text-xs font-bold text-gray-400 uppercase tracking-widest z-10 shadow-sm">
                    <tr>
                      <th className="px-6 py-4">Produk</th>
                      <th className="px-6 py-4">Kategori</th>
                      <th className="px-6 py-4">Harga</th>
                      <th className="px-6 py-4">Stok</th>
                      <th className="px-6 py-4 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {products.slice(0, 20).map(p => (
                      <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={getProductImage(p)}
                              className="w-10 h-10 rounded-lg object-cover bg-gray-100"
                              alt=""
                              onError={(e) => { e.target.src = `https://picsum.photos/seed/${p.id}/100/100`; }}
                            />
                            <div className="max-w-[150px] sm:max-w-[200px]">
                              <p className="text-sm font-bold text-gray-900 truncate">{p.name}</p>
                              <p className="text-[10px] text-pink-500 font-bold truncate">{p.brand || p.Brand?.name || '-'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-xs font-medium text-gray-600">
                            {p.category || '-'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-gray-900">Rp {p.price?.toLocaleString()}</span>
                            {p.compareAtPrice && p.compareAtPrice > p.price && (
                              <span className="text-[10px] text-gray-400 line-through">Rp {p.compareAtPrice.toLocaleString()}</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${p.stock > 10 ? 'bg-green-500' : p.stock > 0 ? 'bg-yellow-500' : 'bg-red-500'}`} />
                            <span className="text-sm font-medium">{p.stock}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <button onClick={() => openEditModal(p)} className="p-2 hover:bg-pink-50 text-pink-500 rounded-lg transition-colors" title="Edit">
                              <Edit size={16} />
                            </button>
                            <button onClick={() => setDeleteConfirmId(p.id)} className="p-2 hover:bg-red-50 text-red-500 rounded-lg transition-colors" title="Hapus">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Top selling sidebar */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-[600px]">
            <div className="p-6 border-b border-gray-50 flex items-center justify-between">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <Star size={18} className="text-yellow-400" fill="currentColor" /> Top Selling
              </h3>
            </div>
            <div className="overflow-y-auto flex-1 p-6 space-y-6">
              {topSelling.length === 0 ? (
                <p className="text-gray-400 text-sm text-center pt-8">Belum ada data penjualan.</p>
              ) : (
                topSelling.map((p, index) => (
                  <div key={p.id} className="flex items-center gap-4">
                    <span className={`text-lg font-bold w-6 text-center ${index === 0 ? 'text-yellow-500' : index === 1 ? 'text-gray-400' : index === 2 ? 'text-amber-700' : 'text-gray-300'}`}>
                      #{index + 1}
                    </span>
                    <img
                      src={getProductImage(p)}
                      className="w-14 h-14 rounded-xl object-cover bg-gray-100"
                      alt=""
                      onError={(e) => { e.target.src = `https://picsum.photos/seed/${p.id}/100/100`; }}
                    />
                    <div className="flex-1">
                      <p className="text-sm font-bold text-gray-900 line-clamp-1">{p.name}</p>
                      <p className="text-xs text-gray-500 mb-1">{p.brand || '-'}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] bg-green-100 text-green-700 font-bold px-2 py-0.5 rounded-full">
                          {p.sold || 0} Terjual
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>


        {/* ── Orders Management Panel ── */}
        <div className="mt-8 bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-50 flex items-center justify-between">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <ShoppingCart size={18} className="text-blue-500" /> Manajemen Pesanan Masuk
              <span className="text-xs bg-blue-100 text-blue-600 font-bold px-2 py-0.5 rounded-full ml-1">
                {orders.length}
              </span>
            </h3>
            <button 
              onClick={loadOrders} 
              disabled={isLoadingOrders}
              className="text-xs text-blue-500 font-bold hover:underline disabled:opacity-50"
            >
              Refresh
            </button>
          </div>

          <div className="overflow-x-auto">
            {isLoadingOrders ? (
              <div className="py-20 text-center">
                <Loader2 className="animate-spin mx-auto text-blue-400 mb-2" />
                <p className="text-sm text-gray-400">Memuat pesanan...</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="py-20 text-center">
                <ShoppingCart className="mx-auto text-gray-200 mb-4" size={48} />
                <p className="text-gray-400 text-sm">Belum ada pesanan masuk.</p>
              </div>
            ) : (
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  <tr>
                    <th className="px-5 py-4">ID / Tanggal</th>
                    <th className="px-5 py-4">Pelanggan</th>
                    <th className="px-5 py-4">Total Belanja</th>
                    <th className="px-5 py-4">Status Order</th>
                    <th className="px-5 py-4">Update Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-sm">
                  {orders.map(o => (
                    <tr key={o.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-5 py-4">
                        <p className="font-bold text-gray-900">#{o.id}</p>
                        <p className="text-[10px] text-gray-400">{new Date(o.createdAt).toLocaleDateString()}</p>
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-medium text-gray-700">{o.user?.name || 'Guest'}</p>
                        <p className="text-[10px] text-gray-400">{o.user?.email}</p>
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-bold text-gray-900">Rp {o.grandTotal.toLocaleString()}</p>
                        <p className={`text-[10px] font-bold ${o.paymentStatus === 'Paid' ? 'text-green-500' : 'text-orange-500'}`}>
                          {o.paymentStatus === 'Paid' ? 'Lunas' : 'Belum Bayar'}
                        </p>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${
                          o.orderStatus === 'Completed' ? 'bg-green-100 text-green-700' :
                          o.orderStatus === 'Shipped' ? 'bg-blue-100 text-blue-700' :
                          o.orderStatus === 'Processed' ? 'bg-purple-100 text-purple-700' :
                          'bg-orange-100 text-orange-700'
                        }`}>
                          {o.orderStatus === 'Created' ? 'Menunggu Verifikasi' : 
                           o.orderStatus === 'Processed' ? 'Sedang Diproses' :
                           o.orderStatus === 'Shipped' ? 'Dalam Pengiriman' :
                           o.orderStatus === 'Completed' ? 'Selesai' : o.orderStatus}
                        </span>
                        {o.trackingNumber && <p className="text-[10px] text-gray-400 mt-1">Resi: {o.trackingNumber}</p>}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex gap-1 flex-wrap max-w-[200px]">
                          {/* Created -> Processed (Verification) */}
                          {o.orderStatus === 'Created' && (
                            <button 
                              onClick={() => handleUpdateOrderStatus(o.id, 'Processed')}
                              disabled={updatingOrderId === o.id}
                              className="text-[10px] bg-purple-100 text-purple-700 px-2 py-1 rounded-lg font-bold hover:bg-purple-200 disabled:opacity-40"
                            >Verifikasi & Proses</button>
                          )}
                          
                          {/* Processed -> Shipped */}
                          {o.orderStatus === 'Processed' && (
                            <button 
                              onClick={() => handleUpdateOrderStatus(o.id, 'Shipped')}
                              disabled={updatingOrderId === o.id}
                              className="text-[10px] bg-blue-100 text-blue-700 px-2 py-1 rounded-lg font-bold hover:bg-blue-200 disabled:opacity-40"
                            >Kirim (Isi Resi)</button>
                          )}

                          {/* Shipped -> Completed (Note: Normally done by customer, but admin can force) */}
                          {o.orderStatus === 'Shipped' && (
                            <button 
                              onClick={() => handleUpdateOrderStatus(o.id, 'Completed')}
                              disabled={updatingOrderId === o.id}
                              className="text-[10px] bg-green-100 text-green-700 px-2 py-1 rounded-lg font-bold hover:bg-green-200 disabled:opacity-40"
                            >Selesaikan</button>
                          )}

                          {updatingOrderId === o.id && <Loader2 size={12} className="animate-spin text-gray-300" />}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* ── Returns Management Panel ── */}
        <div className="mt-8 bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <RotateCcw size={18} className="text-orange-500" /> Manajemen Retur
              <span className="text-xs bg-orange-100 text-orange-600 font-bold px-2 py-0.5 rounded-full ml-1">
                {returns.length}
              </span>
            </h3>
            <div className="flex gap-1 flex-wrap">
              {['', 'Pending', 'Approved', 'Rejected', 'Completed'].map(s => (
                <button
                  key={s}
                  onClick={() => setReturnStatusFilter(s)}
                  className={`text-xs px-3 py-1.5 rounded-lg font-bold transition-colors ${
                    returnStatusFilter === s
                      ? 'bg-gray-900 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {s || 'Semua'}
                </button>
              ))}
            </div>
          </div>

          {isLoadingReturns ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 text-pink-400 animate-spin" />
            </div>
          ) : returns.length === 0 ? (
            <div className="py-12 text-center">
              <RotateCcw size={36} className="mx-auto text-gray-200 mb-3" />
              <p className="text-sm text-gray-400">Tidak ada pengajuan retur{returnStatusFilter ? ` dengan status "${returnStatusFilter}"` : ''}.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-gray-50/60 text-xs text-gray-500 uppercase tracking-wide">
                    <th className="px-5 py-3 font-bold">ID</th>
                    <th className="px-5 py-3 font-bold">User</th>
                    <th className="px-5 py-3 font-bold">Produk</th>
                    <th className="px-5 py-3 font-bold">Alasan</th>
                    <th className="px-5 py-3 font-bold">Order</th>
                    <th className="px-5 py-3 font-bold">Tanggal</th>
                    <th className="px-5 py-3 font-bold">Status</th>
                    <th className="px-5 py-3 font-bold">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {returns.map(r => (
                    <tr key={r.id} className="hover:bg-gray-50/40 transition-colors">
                      <td className="px-5 py-3 font-mono text-xs text-gray-400">#{r.id}</td>
                      <td className="px-5 py-3">
                        <p className="font-bold text-gray-900 text-xs">{r.user?.name || '-'}</p>
                        <p className="text-[10px] text-gray-400">{r.user?.email || ''}</p>
                      </td>
                      <td className="px-5 py-3">
                        <p className="font-medium text-gray-800 text-xs max-w-[130px] line-clamp-2">{r.productName}</p>
                      </td>
                      <td className="px-5 py-3">
                        <span className="text-[10px] bg-orange-50 text-orange-700 px-2 py-0.5 rounded capitalize font-bold">{r.reason}</span>
                      </td>
                      <td className="px-5 py-3 font-mono text-xs text-blue-600 font-bold">#{r.orderId}</td>
                      <td className="px-5 py-3 text-xs text-gray-500">
                        {new Date(r.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: '2-digit' })}
                      </td>
                      <td className="px-5 py-3">
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
                          r.status === 'Approved'  ? 'bg-green-100 text-green-700' :
                          r.status === 'Rejected'  ? 'bg-red-100 text-red-700'   :
                          r.status === 'Completed' ? 'bg-blue-100 text-blue-700'  :
                          'bg-orange-100 text-orange-700'
                        }`}>{r.status}</span>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex gap-1 flex-wrap">
                          {['Approved', 'Rejected', 'Completed'].filter(s => s !== r.status).map(action => (
                            <button
                              key={action}
                              onClick={() => handleUpdateReturnStatus(r.id, action)}
                              disabled={updatingReturnId === r.id}
                              className={`text-[10px] px-2 py-1 rounded-lg font-bold transition-colors disabled:opacity-40 ${
                                action === 'Approved'  ? 'bg-green-100 text-green-700 hover:bg-green-200' :
                                action === 'Rejected'  ? 'bg-red-100 text-red-700 hover:bg-red-200'       :
                                'bg-blue-100 text-blue-700 hover:bg-blue-200'
                              }`}
                            >
                              {updatingReturnId === r.id
                                ? <Loader2 size={10} className="animate-spin inline" />
                                : action}
                            </button>
                          ))}
                          {r.status !== 'Pending' && (
                            <button
                              onClick={() => handleUpdateReturnStatus(r.id, 'Pending')}
                              disabled={updatingReturnId === r.id}
                              className="text-[10px] px-2 py-1 rounded-lg font-bold bg-gray-100 text-gray-500 hover:bg-gray-200 disabled:opacity-40"
                            >Reset</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ── Product Modal ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/40 backdrop-blur-sm px-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">
                {editingProduct ? 'Edit Produk' : 'Tambah Produk Baru'}
              </h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-900">
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4 mb-8">
              {/* Name */}
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">Nama Produk *</label>
                <input
                  type="text"
                  value={productForm.name}
                  onChange={e => setProductForm({ ...productForm, name: e.target.value })}
                  className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 outline-none focus:ring-2 focus:ring-pink-200 text-sm"
                  placeholder="Contoh: Super Serum 30ml"
                />
              </div>

              {/* Brand / Category */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">Brand</label>
                  <select
                    value={productForm.brand}
                    onChange={e => setProductForm({ ...productForm, brand: e.target.value })}
                    className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 outline-none focus:ring-2 focus:ring-pink-200 text-sm"
                  >
                    {BRANDS.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">Kategori</label>
                  <select
                    value={productForm.category}
                    onChange={e => setProductForm({ ...productForm, category: e.target.value })}
                    className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 outline-none focus:ring-2 focus:ring-pink-200 text-sm"
                  >
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              {/* Price / Stock */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">Harga Jual Saat Ini (Rp) *</label>
                  <input
                    type="number"
                    value={productForm.price}
                    onChange={e => setProductForm({ ...productForm, price: e.target.value })}
                    className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 outline-none focus:ring-2 focus:ring-pink-200 text-sm"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">Harga Coret (Opsional)</label>
                  <input
                    type="number"
                    value={productForm.compareAtPrice}
                    onChange={e => setProductForm({ ...productForm, compareAtPrice: e.target.value })}
                    className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 outline-none focus:ring-2 focus:ring-pink-200 text-sm"
                    placeholder="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">Stok Produk</label>
                <input
                  type="number"
                  value={productForm.stock}
                  onChange={e => setProductForm({ ...productForm, stock: e.target.value })}
                  className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 outline-none focus:ring-2 focus:ring-pink-200 text-sm"
                  placeholder="0"
                />
              </div>

              {/* Image Upload */}
              <div className="py-2">
                <ImageUpload
                  label="Gambar Produk"
                  value={imagePreview}
                  onChange={handleImageChange}
                  onRemove={handleImageRemove}
                />
                {imageFile && (
                  <p className="text-xs text-amber-600 mt-2 font-medium">
                    ⚠ Gambar baru dipilih. Klik "Simpan Produk" untuk mengunggah.
                  </p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">Deskripsi Produk</label>
                <textarea
                  rows="3"
                  value={productForm.description}
                  onChange={e => setProductForm({ ...productForm, description: e.target.value })}
                  className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 outline-none focus:ring-2 focus:ring-pink-200 text-sm resize-none"
                  placeholder="Tuliskan deskripsi produk di sini..."
                />
              </div>

              {/* Ingredients */}
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">Kandungan (Ingredients)</label>
                <textarea
                  rows="2"
                  value={productForm.ingredients}
                  onChange={e => setProductForm({ ...productForm, ingredients: e.target.value })}
                  className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 outline-none focus:ring-2 focus:ring-pink-200 text-sm resize-none"
                  placeholder="Tuliskan kandungan utama produk..."
                />
              </div>

              {/* Usage */}
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">Cara Pakai (Usage)</label>
                <textarea
                  rows="2"
                  value={productForm.usage}
                  onChange={e => setProductForm({ ...productForm, usage: e.target.value })}
                  className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 outline-none focus:ring-2 focus:ring-pink-200 text-sm resize-none"
                  placeholder="Tuliskan cara dan anjuran pemakaian..."
                />
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={closeModal}
                className="flex-1 py-3.5 rounded-xl font-bold text-gray-500 border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleSaveProduct}
                disabled={isSaving}
                className="flex-1 bg-gray-900 text-white py-3.5 rounded-xl font-bold hover:bg-pink-600 transition-colors shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSaving && <Loader2 size={16} className="animate-spin" />}
                {isSaving ? 'Menyimpan...' : 'Simpan Produk'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirm Modal ── */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-gray-900/40 backdrop-blur-sm px-4">
          <div className="bg-white rounded-3xl p-8 w-full max-w-sm shadow-2xl text-center animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Hapus Produk?</h3>
            <p className="text-gray-500 text-sm mb-8">Apakah Anda yakin ingin menghapus produk ini? Tindakan ini tidak dapat dibatalkan.</p>
            <div className="flex gap-4">
              <button
                onClick={() => setDeleteConfirmId(null)}
                disabled={isDeleting}
                className="flex-1 py-3 rounded-xl font-bold border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="flex-1 bg-red-500 text-white py-3 rounded-xl font-bold hover:bg-red-600 transition-colors shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isDeleting && <Loader2 size={16} className="animate-spin" />}
                {isDeleting ? 'Menghapus...' : 'Ya, Hapus'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
