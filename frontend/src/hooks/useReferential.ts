import { useEffect, useState } from 'react';
import { referentialApi } from '../services/api';
import type { City, VehicleBrand } from '../types/quote';

// ─── Hook pour les villes ─────────────────────────────────────────────────────

export function useCities() {
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

// ─── Hook pour les marques de véhicules ──────────────────────────────────────

export function useVehicleBrands(type: 'auto' | 'moto' | '') {
  const [brands, setBrands] = useState<VehicleBrand[]>([]);
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
