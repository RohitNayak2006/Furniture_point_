import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import MobileBottomNav from './components/layout/MobileBottomNav';
import CartDrawer from './components/drawer/CartDrawer';
import WishlistDrawer from './components/drawer/WishlistDrawer';
import ToastContainer from './components/ui/ToastContainer';
import HomePage from './pages/HomePage';
import CategoryPage from './pages/CategoryPage';
import ProductPage from './pages/ProductPage';
import SearchPage from './pages/SearchPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import LoginPage from './pages/LoginPage';
import AccountPage, { ProfileTab, OrdersTab, WishlistTab, SettingsTab } from './pages/AccountPage';
import WishlistPage from './pages/WishlistPage';
import AdminPage, { AdminOverview, AdminInventory, AdminOrders } from './pages/admin/AdminPage';
import ScrollToTop from './components/ui/ScrollToTop';

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <div className="min-h-screen bg-background text-on-surface">
        <Navbar />
        <main className="pb-16 lg:pb-0">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/category/:slug" element={<CategoryPage />} />
            <Route path="/product/:slug" element={<ProductPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/wishlist" element={<WishlistPage />} />
            <Route path="/account" element={<AccountPage />}>
              <Route index element={<ProfileTab />} />
              <Route path="orders" element={<OrdersTab />} />
              <Route path="wishlist" element={<WishlistTab />} />
              <Route path="settings" element={<SettingsTab />} />
            </Route>
            <Route path="/admin" element={<AdminPage />}>
              <Route index element={<AdminOverview />} />
              <Route path="inventory" element={<AdminInventory />} />
              <Route path="orders" element={<AdminOrders />} />
            </Route>
          </Routes>
        </main>
        <Footer />
        <MobileBottomNav />
        <CartDrawer />
        <WishlistDrawer />
        <ToastContainer />
      </div>
    </BrowserRouter>
  );
}

export default App;
