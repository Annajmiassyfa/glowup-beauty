import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { BASE_URL } from '../services/api.js';

export default function Auth() {
  const [isLoginView, setIsLoginView] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { setUser, setView, showToast, setIsMember } = useAppContext();

  const handleAuth = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const endpoint = isLoginView ? '/api/auth/login' : '/api/auth/register';
      const payload = isLoginView 
        ? { email: formData.email, password: formData.password }
        : { name: formData.name, email: formData.email, password: formData.password };
        
      const res = await fetch(`${BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        showToast(data.message || 'Terjadi kesalahan');
        return;
      }
      
      // Persistence Logic
      if (rememberMe) {
        localStorage.setItem('glowup_token', data.token);
        sessionStorage.removeItem('glowup_token'); // Clean up session storage
      } else {
        sessionStorage.setItem('glowup_token', data.token);
        localStorage.removeItem('glowup_token'); // Clean up local storage
      }
      
      setUser(data.user);
      setIsMember(data.user.isMember);
      
      if (data.user.role === 'Admin') {
        setView('admin');
        showToast('Selamat datang Admin Dashboard!');
      } else {
        setView('home');
        showToast(isLoginView ? 'Berhasil login!' : 'Registrasi berhasil!');
      }
    } catch (err) {
      console.error(err);
      showToast('Gagal terhubung ke server');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-20 animate-in fade-in zoom-in-95 duration-300">
      <div className="bg-white p-8 rounded-3xl shadow-xl border border-pink-50 text-center">
        <h2 className="text-2xl font-serif font-bold text-gray-900 mb-2">
          {isLoginView ? 'Welcome to GlowUp Girls' : 'Mulai Bersama GlowUp Girls'}
        </h2>
        <p className="text-gray-500 text-sm mb-8">
          {isLoginView ? 'Silakan masuk ke akun Anda' : 'Daftarkan akun baru Anda hari ini'}
        </p>
        
        <form onSubmit={handleAuth} className="space-y-4 mb-6 text-left">
          {!isLoginView && (
            <input 
              type="text" placeholder="Nama Lengkap" value={formData.name} required
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:bg-white outline-none focus:ring-2 focus:ring-pink-200" 
            />
          )}

          <input 
            type="email" placeholder="Email" value={formData.email} required
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:bg-white outline-none focus:ring-2 focus:ring-pink-200" 
          />

          <input 
            type="password" placeholder="Password" value={formData.password} required
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:bg-white outline-none focus:ring-2 focus:ring-pink-200" 
          />
          
          {isLoginView && (
            <div className="flex justify-between items-center mb-8 text-sm pt-2">
              <label className="flex items-center gap-2 text-gray-600 cursor-pointer">
                <input 
                  type="checkbox" checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded text-pink-500 focus:ring-pink-500" 
                /> Ingat saya
              </label>
              <a 
                href="https://wa.me/6282110737267?text=Halo%20Admin%20GlowUp%20Girls%2C%20saya%20butuh%20bantuan%20reset%20password" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-pink-600 font-medium hover:underline"
              >
                Lupa Password?
              </a>
            </div>
          )}
          
          <button 
            type="submit" disabled={isLoading}
            className="w-full bg-gray-900 text-white font-bold py-3.5 rounded-xl hover:bg-pink-600 transition-all shadow-lg disabled:opacity-50"
          >
            {isLoading ? 'Memproses...' : (isLoginView ? 'Masuk' : 'Daftar Sekarang')}
          </button>
        </form>
        
        <p className="mt-6 text-sm text-gray-500">
          {isLoginView ? 'Belum punya akun? ' : 'Sudah punya akun? '} 
          <button 
            type="button" onClick={() => setIsLoginView(!isLoginView)} 
            className="text-pink-600 font-bold hover:underline"
          >
            {isLoginView ? 'Daftar Sekarang' : 'Masuk di sini'}
          </button>
        </p>
      </div>
    </div>
  );
}
