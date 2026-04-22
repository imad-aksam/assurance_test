import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import QuoteFormPage from './pages/QuoteFormPage';
import AdminDashboard from './pages/AdminDashboard';
import EstimationPage from './pages/EstimationPage';
import './styles/global.css';

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"           element={<QuoteFormPage />} />
        <Route path="/admin"      element={<AdminDashboard />} />
        <Route path="/estimation" element={<EstimationPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;