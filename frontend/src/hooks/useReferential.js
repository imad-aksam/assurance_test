import { useEffect, useState } from 'react';
import { referentialApi } from '../services/api';

export function useCities() {
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    referentialApi
      .getCities()
      .then((data) => { if (!cancelled) setCities(data); })
      .catch(() => { if (!cancelled) setError('Impossible de charger les villes.'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  return { cities, loading, error };
}

export function useVehicleBrands(type) {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!type) { setBrands([]); return; }
    let cancelled = false;
    setLoading(true);
    referentialApi
      .getBrands(type)
      .then((data) => { if (!cancelled) setBrands(data); })
      .catch(() => { if (!cancelled) setBrands([]); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [type]);

  return { brands, loading };
}
