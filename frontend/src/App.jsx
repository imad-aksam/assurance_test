import React from 'react';
import QuoteFormPage from './pages/QuoteFormPage';
import AdminDashboard from './pages/AdminDashboard';
import './styles/global.css';

/**
 * Routage simple basé sur le hash :
 *   /           → Formulaire de devis client
 *   /#/admin    → Interface d'administration
 */
const App = () => {
  const [hash, setHash] = React.useState(window.location.hash);

  React.useEffect(() => {
    const onHash = () => setHash(window.location.hash);
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  if (hash === '#/admin') {
    return <AdminDashboard />;
  }

  return <QuoteFormPage />;
};

export default App;
