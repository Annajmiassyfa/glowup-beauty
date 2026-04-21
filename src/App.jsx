import React from 'react';
import { ArrowLeft } from 'lucide-react';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Toast from './components/ui/Toast';
import { useAppContext } from './context/AppContext';

// Pages
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Profile from './pages/Profile';
import Admin from './pages/Admin';
import Auth from './pages/Auth';
import { Policy, PaymentInfo, Contact } from './pages/StaticPages';

function AppContent() {
  const { view, viewHistory, goBack } = useAppContext();

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900">
      <Navbar />
      
      <main>
        {viewHistory.length > 1 && view !== 'home' && (
          <div className="max-w-7xl mx-auto px-4 pt-6 pb-2">
            <button 
              onClick={goBack} 
              className="flex items-center gap-2 text-gray-500 hover:text-pink-600 transition-colors font-medium text-sm w-fit"
            >
              <ArrowLeft size={18} /> Kembali
            </button>
          </div>
        )}
        {view === 'home' && <Home />}
        {view === 'shop' && <Shop />}
        {view === 'detail' && <ProductDetail />}
        {view === 'cart' && <Cart />}
        {view === 'checkout' && <Checkout />}
        {view === 'profile' && <Profile />}
        {view === 'admin' && <Admin />}
        {view === 'login' && <Auth />}
        {view === 'policy' && <Policy />}
        {view === 'payment' && <PaymentInfo />}
        {view === 'contact' && <Contact />}
      </main>

      <Footer />
      <Toast />
    </div>
  );
}

export default AppContent;
