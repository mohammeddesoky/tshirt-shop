import { Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { CartProvider } from '@/context/CartContext';
import { AuthProvider } from '@/context/AuthContext';
import { ToastProvider } from '@/context/ToastContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

import Home from '@/pages/Home';
import Shop from '@/pages/Shop';
import ProductDetail from '@/pages/ProductDetail';
import Cart from '@/pages/Cart';
import Checkout from '@/pages/Checkout';
import OrderConfirmation from '@/pages/OrderConfirmation';
import TrackOrder from '@/pages/TrackOrder';
import About from '@/pages/About';
import Contact from '@/pages/Contact';
import FAQ from '@/pages/FAQ';
import ReturnsPolicy from '@/pages/ReturnsPolicy';
import PrivacyPolicy from '@/pages/PrivacyPolicy';
import Terms from '@/pages/Terms';
import NotFound from '@/pages/NotFound';

import AdminLogin from '@/pages/admin/AdminLogin';
import AdminLayout from '@/pages/admin/AdminLayout';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import AdminProducts from '@/pages/admin/AdminProducts';
import AdminOrders from '@/pages/admin/AdminOrders';
import AdminCustomers from '@/pages/admin/AdminCustomers';
import AdminMessages from '@/pages/admin/AdminMessages';

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function StorefrontLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <ToastProvider>
          <ScrollToTop />
          <Routes>
            {/* Admin routes (no storefront navbar/footer) */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="products" element={<AdminProducts />} />
              <Route path="orders" element={<AdminOrders />} />
              <Route path="customers" element={<AdminCustomers />} />
              <Route path="messages" element={<AdminMessages />} />
            </Route>

            {/* Storefront routes */}
            <Route path="/" element={<StorefrontLayout><Home /></StorefrontLayout>} />
            <Route path="/shop" element={<StorefrontLayout><Shop /></StorefrontLayout>} />
            <Route path="/product/:slug" element={<StorefrontLayout><ProductDetail /></StorefrontLayout>} />
            <Route path="/cart" element={<StorefrontLayout><Cart /></StorefrontLayout>} />
            <Route path="/checkout" element={<StorefrontLayout><Checkout /></StorefrontLayout>} />
            <Route path="/order-confirmation" element={<StorefrontLayout><OrderConfirmation /></StorefrontLayout>} />
            <Route path="/track-order" element={<StorefrontLayout><TrackOrder /></StorefrontLayout>} />
            <Route path="/about" element={<StorefrontLayout><About /></StorefrontLayout>} />
            <Route path="/contact" element={<StorefrontLayout><Contact /></StorefrontLayout>} />
            <Route path="/faq" element={<StorefrontLayout><FAQ /></StorefrontLayout>} />
            <Route path="/returns-policy" element={<StorefrontLayout><ReturnsPolicy /></StorefrontLayout>} />
            <Route path="/privacy-policy" element={<StorefrontLayout><PrivacyPolicy /></StorefrontLayout>} />
            <Route path="/terms" element={<StorefrontLayout><Terms /></StorefrontLayout>} />
            <Route path="*" element={<StorefrontLayout><NotFound /></StorefrontLayout>} />
          </Routes>
        </ToastProvider>
      </CartProvider>
    </AuthProvider>
  );
}
