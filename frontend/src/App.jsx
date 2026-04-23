import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import QuoteFormPage   from './pages/QuoteFormPage';
import AdminDashboard  from './pages/AdminDashboard';
import AdminLogin, { isAuthenticated, logout } from './pages/AdminLogin';
import EstimationPage  from './pages/EstimationPage';
import './styles/global.css';
import './styles/login.css';

// ─── Admin route with auth guard ────────────────────────────────────────────
const AdminRoute = () => {
  const [authed, setAuthed] = useState(isAuthenticated);
  const navigate = useNavigate();

  if (!authed) {
    return <AdminLogin onSuccess={() => setAuthed(true)} />;
  }

  return (
    <AdminDashboard
      onLogout={() => {
        logout();
        setAuthed(false);
        navigate('/');
      }}
    />
  );
};

// ─── App ────────────────────────────────────────────────────────────────────
const App = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/"           element={<QuoteFormPage />} />
      <Route path="/admin"      element={<AdminRoute />} />
      <Route path="/estimation" element={<EstimationPage />} />
    </Routes>
  </BrowserRouter>
);

export default App;