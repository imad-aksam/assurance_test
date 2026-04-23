import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';

import HomePage from './pages/HomePage';
import QuoteFormPage from './pages/QuoteFormPage';
import EstimationPage from './pages/EstimationPage';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';

export default function App() {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(
    () => localStorage.getItem('adminAuth') === 'true'
  );

  const handleLogin = () => {
    localStorage.setItem('adminAuth', 'true');
    setIsAdminAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('adminAuth');
    setIsAdminAuthenticated(false);
  };

  return (
    <BrowserRouter>
      <Routes>
        {/* Homepage */}
        <Route path="/" element={<HomePage />} />

        {/* Devis flow */}
        <Route path="/devis" element={<QuoteFormPage />} />
        <Route path="/estimation" element={<EstimationPage />} />

        {/* Admin */}
        <Route
          path="/admin"
          element={
            isAdminAuthenticated ? (
              <AdminDashboard onLogout={handleLogout} />
            ) : (
              <AdminLogin onLogin={handleLogin} />
            )
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}