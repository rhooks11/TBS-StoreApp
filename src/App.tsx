import { Navigate, Route, Routes } from 'react-router-dom';
import StoreLayout from '@/components/StoreLayout';
import HomePage from '@/pages/HomePage';
import ProductDetailPage from '@/pages/ProductDetailPage';
import TrainerStorePage from '@/pages/TrainerStorePage';
import CartPage from '@/pages/CartPage';
import OrdersPage from '@/pages/OrdersPage';
import AuthPage from '@/pages/AuthPage';

export default function App() {
  return (
    <Routes>
      <Route element={<StoreLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/products/:id" element={<ProductDetailPage />} />
        <Route path="/store/:trainerUserId" element={<TrainerStorePage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/login" element={<AuthPage mode="login" />} />
        <Route path="/register" element={<AuthPage mode="register" />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
