import React, { useState, useEffect } from 'react';
import ImageUpload from '../../components/ui/ImageUpload';
import { fetchMyProfile, updateMyProfile, uploadMyAvatar, assetUrl } from '../../services/api';

export default function ProfileSettings({ user, setUser, showToast }) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
  });

  // Tracks the pending File object for avatar (before submit)
  const [avatarFile, setAvatarFile] = useState(null);
  // Tracks the local blob URL used only for preview before submit
  const [avatarPreview, setAvatarPreview] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);

  // On mount, fetch the latest profile data directly from backend
  useEffect(() => {
    const loadProfile = async () => {
      setIsLoadingProfile(true);
      try {
        const latestUser = await fetchMyProfile();
        // Sync AppContext user state with the fresh DB data
        setUser(latestUser);
        setFormData({
          name: latestUser.name || '',
          phone: latestUser.phone || '',
        });
        setAvatarPreview(assetUrl(latestUser.avatar));
      } catch (err) {
        // If token is invalid or server is down, fall back to whatever is in context
        if (user) {
          setFormData({ name: user.name || '', phone: user.phone || '' });
          setAvatarPreview(assetUrl(user.avatar));
        }
      } finally {
        setIsLoadingProfile(false);
      }
    };

    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Called by ImageUpload when user picks a file
  // previewUrl = blob: URL for instant preview; file = raw File object for upload
  const handleAvatarChange = (previewUrl, file) => {
    setAvatarPreview(previewUrl);
    setAvatarFile(file || null);
  };

  // Clears avatar selection (does NOT delete from server yet)
  const handleAvatarRemove = () => {
    setAvatarPreview('');
    setAvatarFile(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name) {
      showToast('Nama lengkap tidak boleh kosong!');
      return;
    }

    setIsLoading(true);
    try {
      let updatedUser = user;

      // Step 1: If there's a pending avatar file, upload it first
      if (avatarFile) {
        try {
          updatedUser = await uploadMyAvatar(avatarFile);
          // Clear pending file state - source of truth is now the DB URL
          setAvatarFile(null);
          setAvatarPreview(assetUrl(updatedUser.avatar));
        } catch (avatarErr) {
          showToast('Gagal mengunggah foto: ' + avatarErr.message);
          setIsLoading(false);
          return;
        }
      }

      // Step 2: Update name and phone
      updatedUser = await updateMyProfile({
        name: formData.name,
        phone: formData.phone,
      });

      // Step 3: Sync AppContext with the final backend response
      setUser({ ...user, ...updatedUser, avatar: updatedUser.avatar });
      showToast('Profil berhasil diperbarui!');
    } catch (err) {
      showToast(err.message || 'Terjadi kesalahan saat menyimpan profil');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingProfile) {
    return (
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 flex items-center justify-center min-h-48">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-400">Memuat profil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 animate-in fade-in duration-300">
      <h3 className="text-xl font-serif font-bold text-gray-900 mb-6">Ubah Profil</h3>
      <form onSubmit={handleSubmit} className="space-y-6 max-w-lg">
        <div className="mb-8">
          <ImageUpload
            label="Foto Profil"
            value={avatarPreview}
            onChange={handleAvatarChange}
            onRemove={handleAvatarRemove}
            isAvatar={true}
            placeholderImage="https://i.pravatar.cc/150?u=glowup"
          />
          {avatarFile && (
            <p className="text-xs text-amber-600 mt-2 font-medium">
              ⚠ Foto baru dipilih. Klik "Simpan Perubahan" untuk mengunggah.
            </p>
          )}
        </div>

        <div>
          <label className="text-sm font-bold text-gray-700 block mb-2">Nama Lengkap *</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white outline-none focus:ring-2 focus:ring-pink-200 transition-all text-sm"
            required
          />
        </div>

        <div>
          <label className="text-sm font-bold text-gray-700 block mb-2">Email</label>
          <input
            type="email"
            value={user?.email || ''}
            disabled
            className="w-full p-3 rounded-xl border border-gray-100 bg-gray-100 text-gray-400 text-sm cursor-not-allowed"
          />
          <p className="text-xs text-gray-400 mt-1">Email tidak dapat diubah.</p>
        </div>

        <div>
          <label className="text-sm font-bold text-gray-700 block mb-2">Nomor Telepon</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white outline-none focus:ring-2 focus:ring-pink-200 transition-all text-sm"
            placeholder="Contoh: 081234567890"
          />
        </div>

        <div className="pt-4 flex gap-4">
          <button
            type="submit"
            disabled={isLoading}
            className="bg-gray-900 text-white font-bold px-8 py-3 rounded-xl hover:bg-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isLoading && (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
            {isLoading ? 'Menyimpan...' : 'Simpan Perubahan'}
          </button>
        </div>
      </form>
    </div>
  );
}
