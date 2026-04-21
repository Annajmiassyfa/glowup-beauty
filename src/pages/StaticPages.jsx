import React from 'react';
import { useAppContext } from '../context/AppContext';

export function Policy() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl p-8 md:p-12 border border-gray-100 shadow-sm">
        <h1 className="text-3xl font-serif font-bold text-gray-900 mb-8 border-b border-gray-100 pb-4">Kebijakan Pengembalian</h1>
        <div className="space-y-6 text-gray-600 leading-relaxed text-sm">
          <p>
            Di GlowUp Girls, kepuasan pelanggan adalah prioritas kami. Jika Anda tidak sepenuhnya puas dengan pembelian Anda, kami siap membantu dengan kebijakan pengembalian yang mudah dan transparan.
          </p>
          <h3 className="text-lg font-bold text-gray-900 mt-8 mb-2">1. Syarat dan Ketentuan Pengembalian</h3>
          <ul className="list-disc pl-5 space-y-2">
            <li>Produk harus dikembalikan dalam waktu 7 hari sejak produk diterima.</li>
            <li>Produk harus dalam kondisi baru, belum digunakan, dan masih dalam kemasan aslinya. Segel produk tidak boleh rusak.</li>
            <li>Harus menyertakan bukti pembelian atau nomor pesanan.</li>
          </ul>
          
          <h3 className="text-lg font-bold text-gray-900 mt-8 mb-2">2. Proses Pengembalian</h3>
          <p>
            Silakan hubungi tim layanan pelanggan kami melalui email di hello@glowupgirls.id atau melalui halaman Hubungi Kami untuk memulai proses pengembalian. Tim kami akan memberikan instruksi lebih lanjut mengenai cara mengirimkan kembali produk.
          </p>
          
          <h3 className="text-lg font-bold text-gray-900 mt-8 mb-2">3. Pengembalian Dana</h3>
          <p>
            Setelah kami menerima dan memeriksa produk yang dikembalikan, kami akan memberitahukan status pengembalian dana Anda. Jika disetujui, pengembalian dana akan diproses dan dikreditkan secara otomatis ke metode pembayaran awal Anda dalam waktu 5-7 hari kerja.
          </p>
        </div>
      </div>
    </div>
  );
}

export function PaymentInfo() {
  const { showToast } = useAppContext();

  const handleCopy = (num) => {
    navigator.clipboard.writeText(num);
    showToast('Nomor berhasil disalin!');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-16 animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl p-8 md:p-12 border border-gray-100 shadow-sm">
        <h1 className="text-3xl font-serif font-bold text-gray-900 mb-8 border-b border-gray-100 pb-4">Metode Pembayaran</h1>
        <div className="space-y-8 text-gray-600 leading-relaxed text-sm">
          <p>GlowUp Girls mendukung metode pembayaran manual melalui Transfer Bank dan E-Wallet berikut. Semua pembayaran dilakukan atas nama: <strong>AN NAJMI AS SYFA</strong>.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div className="border border-gray-100 rounded-2xl p-6 bg-pink-50/30">
              <h3 className="font-bold text-gray-900 text-lg mb-4 flex items-center gap-2">
                <span className="w-8 h-8 bg-pink-500 text-white rounded-lg flex items-center justify-center text-xs">BT</span> Transfer Bank
              </h3>
              <ul className="space-y-6">
                <li className="flex flex-col">
                  <span className="text-xs text-gray-400 font-bold uppercase mb-1">Mandiri</span>
                  <div className="flex items-center gap-3">
                    <span className="text-gray-900 font-mono font-bold text-lg tracking-wider">1730013032272</span>
                    <button 
                      onClick={() => handleCopy('1730013032272')}
                      className="p-1.5 hover:bg-white rounded-lg border border-gray-100 text-gray-400 hover:text-pink-500 transition-all shadow-sm"
                      title="Salin Nomor"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                    </button>
                  </div>
                </li>
                <li className="flex flex-col border-t border-pink-100 pt-4">
                  <span className="text-xs text-gray-400 font-bold uppercase mb-1">SeaBank</span>
                  <div className="flex items-center gap-3">
                    <span className="text-gray-900 font-mono font-bold text-lg tracking-wider">901836025765</span>
                    <button 
                      onClick={() => handleCopy('901836025765')}
                      className="p-1.5 hover:bg-white rounded-lg border border-gray-100 text-gray-400 hover:text-pink-500 transition-all shadow-sm"
                      title="Salin Nomor"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                    </button>
                  </div>
                </li>
              </ul>
            </div>
            
            <div className="border border-gray-100 rounded-2xl p-6 bg-green-50/30">
              <h3 className="font-bold text-gray-900 text-lg mb-4 flex items-center gap-2">
                <span className="w-8 h-8 bg-green-500 text-white rounded-lg flex items-center justify-center text-xs">EW</span> E-Wallet
              </h3>
              <ul className="space-y-6">
                <li className="flex flex-col">
                  <span className="text-xs text-gray-400 font-bold uppercase mb-1">Dana / GoPay / ShopeePay</span>
                  <div className="flex items-center gap-3">
                    <span className="text-gray-900 font-mono font-bold text-lg tracking-wider">0821 1073 7267</span>
                    <button 
                      onClick={() => handleCopy('082110737267')}
                      className="p-1.5 hover:bg-white rounded-lg border border-gray-100 text-gray-400 hover:text-pink-500 transition-all shadow-sm"
                      title="Salin Nomor"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                    </button>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          <div className="bg-orange-50 p-6 rounded-2xl border border-orange-100 mt-8">
            <h4 className="font-bold text-orange-800 mb-2">Penting:</h4>
            <ul className="list-disc pl-5 space-y-2 text-orange-700 text-xs font-medium">
              <li>Silakan transfer sesuai total belanja Anda.</li>
              <li>Konfirmasi pembayaran dilakukan secara manual melalui WhatsApp setelah transfer berhasil.</li>
              <li>Sertakan nomor pesanan (order ID) saat melakukan konfirmasi.</li>
              <li>Pesanan akan diproses maksimal 1x24 jam setelah bukti transfer divalidasi.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Contact() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl p-8 md:p-12 border border-gray-100 shadow-sm">
        <h1 className="text-3xl font-serif font-bold text-gray-900 mb-8 border-b border-gray-100 pb-4">Hubungi Kami</h1>
        
        <div className="flex flex-col md:flex-row gap-12">
          <div className="w-full md:w-1/2 space-y-6">
            <div>
              <h3 className="font-bold text-gray-900 text-lg mb-2">Alamat GlowUp Girls Studio</h3>
              <p className="text-sm text-gray-600">GlowUp Girls Studio Lt. 15<br/>Jl. Sudirman Kav 52-53<br/>Jakarta Selatan 12190, Indonesia</p>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-lg mb-2">Layanan Pelanggan</h3>
              <p className="text-sm text-gray-600">Email: hello@glowupgirls.id</p>
              <p className="text-sm text-gray-600">Telepon: (021) 500-GLOW</p>
              <p className="text-sm text-gray-600">WhatsApp: +62 821 1073 7267</p>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-lg mb-2">Jam Operasional</h3>
              <p className="text-sm text-gray-600">Senin - Jumat: 09.00 - 18.00 WIB</p>
              <p className="text-sm text-gray-600">Sabtu - Minggu: Tutup</p>
            </div>
          </div>
          
          <div className="w-full md:w-1/2">
            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); alert('Pesan Anda terkirim!'); }}>
              <div>
                <label className="text-sm font-bold text-gray-700 block mb-1">Nama Lengkap</label>
                <input required type="text" className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white outline-none focus:ring-2 focus:ring-pink-200 text-sm" />
              </div>
              <div>
                <label className="text-sm font-bold text-gray-700 block mb-1">Email</label>
                <input required type="email" className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white outline-none focus:ring-2 focus:ring-pink-200 text-sm" />
              </div>
              <div>
                <label className="text-sm font-bold text-gray-700 block mb-1">Pesan</label>
                <textarea required rows="4" className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white outline-none focus:ring-2 focus:ring-pink-200 text-sm"></textarea>
              </div>
              <button type="submit" className="w-full bg-gray-900 text-white font-bold py-3 rounded-xl hover:bg-pink-600 transition-all text-sm">
                Kirim Pesan
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
