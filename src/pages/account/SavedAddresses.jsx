import React, { useState, useEffect } from 'react';
import { MapPin, Plus, Edit2, Trash2, Loader2, Star } from 'lucide-react';
import {
  fetchAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  setPrimaryAddress,
} from '../../services/api';

const EMPTY_FORM = {
  label: 'Rumah',
  recipientName: '',
  phone: '',
  province: '',
  city: '',
  district: '',
  postalCode: '',
  detailAddress: '',
  notes: '',
};

export default function SavedAddresses({ showToast }) {
  // ── Local state (sourced from backend) ──
  const [addresses, setAddresses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // ── Form state ──
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [isSaving, setIsSaving] = useState(false);

  // ── Deleting state ──
  const [deletingId, setDeletingId] = useState(null);
  const [settingPrimaryId, setSettingPrimaryId] = useState(null);

  // ── Load addresses from backend on mount ──
  useEffect(() => {
    loadAddresses();
  }, []);

  const loadAddresses = async () => {
    setIsLoading(true);
    try {
      const data = await fetchAddresses();
      setAddresses(data);
    } catch (err) {
      showToast('Gagal memuat alamat: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // ── Form helpers ──
  const handleOpenForm = (addr = null) => {
    if (addr) {
      setForm({
        label: addr.label || 'Rumah',
        recipientName: addr.recipientName || '',
        phone: addr.phone || '',
        province: addr.province || '',
        city: addr.city || '',
        district: addr.district || '',
        postalCode: addr.postalCode || '',
        detailAddress: addr.detailAddress || '',
        notes: addr.notes || '',
      });
      setEditingId(addr.id);
    } else {
      setForm(EMPTY_FORM);
      setEditingId(null);
    }
    setIsEditing(true);
  };

  const handleCloseForm = () => {
    setIsEditing(false);
    setEditingId(null);
  };

  // ── Save (Create or Update) ──
  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.recipientName || !form.phone || !form.detailAddress) {
      showToast('Nama Penerima, Telepon, dan Detail Alamat wajib diisi!');
      return;
    }

    setIsSaving(true);
    try {
      if (editingId) {
        const updated = await updateAddress(editingId, form);
        setAddresses(prev => prev.map(a => a.id === editingId ? updated : a));
        showToast('Alamat berhasil diperbarui!');
      } else {
        const created = await createAddress(form);
        // If this is the first address, it's auto-set as primary by backend
        setAddresses(prev => [...prev, created]);
        showToast('Alamat baru berhasil ditambahkan!');
      }
      handleCloseForm();
    } catch (err) {
      showToast(err.message || 'Terjadi kesalahan saat menyimpan alamat');
    } finally {
      setIsSaving(false);
    }
  };

  // ── Delete ──
  const handleDelete = async (id) => {
    setDeletingId(id);
    try {
      await deleteAddress(id);
      setAddresses(prev => prev.filter(a => a.id !== id));
      showToast('Alamat berhasil dihapus!');
    } catch (err) {
      showToast(err.message || 'Gagal menghapus alamat');
    } finally {
      setDeletingId(null);
    }
  };

  // ── Set Primary ──
  const handleSetPrimary = async (id) => {
    setSettingPrimaryId(id);
    try {
      const updatedList = await setPrimaryAddress(id);
      setAddresses(updatedList); // backend returns the sorted full list
      showToast('Alamat utama berhasil diubah!');
    } catch (err) {
      showToast(err.message || 'Gagal mengubah alamat utama');
    } finally {
      setSettingPrimaryId(null);
    }
  };

  // ── Form View ──
  if (isEditing) {
    return (
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 animate-in fade-in duration-300">
        <h3 className="text-xl font-serif font-bold text-gray-900 mb-6">
          {editingId ? 'Edit Alamat' : 'Tambah Alamat Baru'}
        </h3>
        <form onSubmit={handleSave} className="space-y-4 max-w-2xl">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">Label (Rumah/Kantor) *</label>
              <input
                required
                value={form.label}
                onChange={e => setForm({ ...form, label: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white outline-none focus:ring-2 focus:ring-pink-200 text-sm"
                placeholder="Rumah / Kantor / Lainnya"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">Nama Penerima *</label>
              <input
                required
                value={form.recipientName}
                onChange={e => setForm({ ...form, recipientName: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white outline-none focus:ring-2 focus:ring-pink-200 text-sm"
                placeholder="Nama lengkap penerima"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">Nomor Telepon *</label>
              <input
                required
                type="tel"
                value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white outline-none focus:ring-2 focus:ring-pink-200 text-sm"
                placeholder="08xxxxxxxxxx"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">Provinsi</label>
              <input
                value={form.province}
                onChange={e => setForm({ ...form, province: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white outline-none focus:ring-2 focus:ring-pink-200 text-sm"
                placeholder="Contoh: DKI Jakarta"
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">Kota/Kabupaten</label>
              <input
                value={form.city}
                onChange={e => setForm({ ...form, city: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white outline-none focus:ring-2 focus:ring-pink-200 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">Kecamatan</label>
              <input
                value={form.district}
                onChange={e => setForm({ ...form, district: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white outline-none focus:ring-2 focus:ring-pink-200 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">Kode Pos</label>
              <input
                value={form.postalCode}
                onChange={e => setForm({ ...form, postalCode: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white outline-none focus:ring-2 focus:ring-pink-200 text-sm"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-gray-700 block mb-1">Detail Alamat Lengkap *</label>
            <textarea
              required
              value={form.detailAddress}
              onChange={e => setForm({ ...form, detailAddress: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white outline-none focus:ring-2 focus:ring-pink-200 text-sm min-h-[80px] resize-none"
              placeholder="Nama jalan, nomor, RT/RW, nama gedung/apartemen..."
            />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-700 block mb-1">Catatan Tambahan (Opsional)</label>
            <input
              value={form.notes}
              onChange={e => setForm({ ...form, notes: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white outline-none focus:ring-2 focus:ring-pink-200 text-sm"
              placeholder="Contoh: Titip di resepsionis / warna pintu hijau"
            />
          </div>

          <div className="pt-4 flex gap-4">
            <button
              type="submit"
              disabled={isSaving}
              className="bg-gray-900 text-white font-bold px-6 py-2.5 rounded-xl hover:bg-pink-600 transition-all text-sm disabled:opacity-50 flex items-center gap-2"
            >
              {isSaving && <Loader2 size={14} className="animate-spin" />}
              {isSaving ? 'Menyimpan...' : 'Simpan Alamat'}
            </button>
            <button
              type="button"
              onClick={handleCloseForm}
              className="text-gray-500 font-bold px-6 py-2.5 rounded-xl hover:bg-gray-100 transition-all text-sm border border-gray-200"
            >
              Batal
            </button>
          </div>
        </form>
      </div>
    );
  }

  // ── List View ──
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex justify-between items-center bg-white p-4 rounded-3xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center">
            <MapPin size={20} />
          </div>
          <p className="font-bold text-gray-900">Alamat Pengiriman</p>
        </div>
        <button
          onClick={() => handleOpenForm()}
          className="flex items-center gap-2 text-sm font-bold text-pink-600 hover:bg-pink-50 px-4 py-2 rounded-xl transition-all"
        >
          <Plus size={16} /> Tambah Alamat
        </button>
      </div>

      {/* Loading state */}
      {isLoading ? (
        <div className="py-12 bg-white text-center rounded-3xl border border-gray-100">
          <Loader2 className="w-8 h-8 text-pink-400 animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-400">Memuat alamat...</p>
        </div>
      ) : addresses.length === 0 ? (
        <div className="py-12 bg-white text-center rounded-3xl border border-gray-100">
          <MapPin size={40} className="text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500 mb-4">Belum ada alamat tersimpan.</p>
          <button
            onClick={() => handleOpenForm()}
            className="text-pink-600 font-bold hover:underline"
          >
            Tambah Alamat Baru
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {addresses.map(addr => (
            <div
              key={addr.id}
              className={`p-6 bg-white rounded-3xl border transition-all relative ${
                addr.isPrimary
                  ? 'border-pink-500 shadow-md'
                  : 'border-gray-100 shadow-sm hover:border-pink-300'
              }`}
            >
              {addr.isPrimary && (
                <span className="absolute -top-3 -right-2 bg-pink-500 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-sm uppercase tracking-wider border-2 border-white flex items-center gap-1">
                  <Star size={10} fill="currentColor" /> Utama
                </span>
              )}

              <div className="flex justify-between items-start gap-4">
                {/* Address info */}
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="font-bold text-gray-900">{addr.recipientName}</span>
                    <span className="text-gray-300">|</span>
                    <span className="text-sm text-gray-500">{addr.phone}</span>
                    {addr.label && (
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-lg">
                        {addr.label}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">{addr.detailAddress}</p>
                  {(addr.district || addr.city) && (
                    <p className="text-sm text-gray-500">
                      {[addr.district, addr.city].filter(Boolean).join(', ')}
                    </p>
                  )}
                  {(addr.province || addr.postalCode) && (
                    <p className="text-sm text-gray-500">
                      {[addr.province, addr.postalCode].filter(Boolean).join(', ')}
                    </p>
                  )}
                  {addr.notes && (
                    <p className="text-xs text-gray-400 mt-2 bg-gray-50 p-2 rounded-lg inline-block">
                      Catatan: {addr.notes}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 min-w-[120px] shrink-0">
                  <button
                    onClick={() => handleOpenForm(addr)}
                    className="text-xs font-bold text-gray-600 hover:text-pink-600 flex items-center justify-center gap-2 p-2 border border-gray-200 rounded-xl hover:bg-pink-50 hover:border-pink-200 transition-all"
                  >
                    <Edit2 size={14} /> Edit
                  </button>

                  {!addr.isPrimary && (
                    <>
                      <button
                        onClick={() => handleSetPrimary(addr.id)}
                        disabled={settingPrimaryId === addr.id}
                        className="text-xs font-bold text-pink-600 hover:text-white flex items-center justify-center gap-2 p-2 border border-pink-600 rounded-xl hover:bg-pink-600 transition-all disabled:opacity-60"
                      >
                        {settingPrimaryId === addr.id
                          ? <Loader2 size={12} className="animate-spin" />
                          : 'Jadikan Utama'
                        }
                      </button>
                      <button
                        onClick={() => handleDelete(addr.id)}
                        disabled={deletingId === addr.id}
                        className="text-xs font-bold text-red-500 hover:text-red-600 flex items-center justify-center gap-2 p-2 border border-red-100 rounded-xl hover:bg-red-50 transition-all disabled:opacity-60"
                      >
                        {deletingId === addr.id
                          ? <Loader2 size={12} className="animate-spin" />
                          : <><Trash2 size={14} /> Hapus</>
                        }
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
