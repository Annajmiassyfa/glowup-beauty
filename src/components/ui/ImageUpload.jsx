import React, { useRef, useState } from 'react';
import { UploadCloud, Image as ImageIcon, X } from 'lucide-react';

export default function ImageUpload({ 
  value, 
  onChange, 
  onRemove,
  label, 
  className = '', 
  isAvatar = false,
  placeholderImage = '' 
}) {
  const fileInputRef = useRef(null);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Format file tidak didukung. Harap pilih gambar.');
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      setError('Ukuran file maksimal 5MB.');
      return;
    }

    setError('');
    
    // Pass file object back to parent form
    const previewUrl = URL.createObjectURL(file);
    onChange(previewUrl, file);
    
    // Reset file input agar user bisa pilih file yang sama lagi setelah dihapus
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };

  const handleRemove = () => {
    if (onRemove) {
      onRemove();
    } else {
      onChange('');
    }
    setError('');
  };

  const currentImage = value || placeholderImage;
  const roundedClass = isAvatar ? 'rounded-full' : 'rounded-xl';

  return (
    <div className={`space-y-3 ${className}`}>
      {label && <label className="text-sm font-bold text-gray-700 block">{label}</label>}
      
      <div className="flex items-center gap-6">
        {/* Kolom Preview */}
        <div className={`relative ${isAvatar ? 'w-24 h-24' : 'w-24 h-24'} ${roundedClass} border-2 border-dashed border-gray-300 bg-gray-50 flex items-center justify-center overflow-hidden shrink-0 group`}>
          {currentImage ? (
            <>
              <img src={currentImage} alt="Preview" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={handleRemove}
                className={`absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity ${roundedClass}`}
                title="Hapus gambar"
              >
                <X size={20} />
              </button>
            </>
          ) : (
             <ImageIcon className="text-gray-300" size={32} />
          )}
        </div>
        
        {/* Kolom Aksi */}
        <div className="flex-1">
          <input 
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 text-sm font-bold px-4 py-2.5 rounded-lg transition-colors flex items-center gap-2 mb-2 shadow-sm focus:ring-2 focus:ring-pink-200 outline-none"
          >
            <UploadCloud size={16} /> {value ? 'Ganti Foto' : 'Upload Foto'}
          </button>
          <p className="text-xs text-gray-500 leading-relaxed">Maks. ukuran 5MB.<br/>Hanya menerima format JPG, PNG, atau WEBP.</p>
          {error && <p className="text-xs text-red-500 font-medium mt-1">{error}</p>}
        </div>
      </div>
    </div>
  );
}
