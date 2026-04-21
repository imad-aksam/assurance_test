import type { City, QuotePayload, QuoteResponse, VehicleBrand } from '../types/quote';

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api';

// ─── Utilitaire de requête ────────────────────────────────────────────────────

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...options.headers,
    },
    ...options,
  });

  const data = await response.json();

  if (!response.ok) {
    // Lève une erreur structurée avec les détails de validation si disponibles
    const error = new Error(data.error ?? 'Une erreur est survenue.') as Error & {
      details?: Record<string, string>;
      status: number;
    };
    error.details = data.details;
    error.status = response.status;
    throw error;
  }

  return data as T;
}

// ─── Devis ────────────────────────────────────────────────────────────────────

export const quoteApi = {
  /** Crée un nouveau devis */
  create: (payload: QuotePayload) =>
    request<{ message: string; data: QuoteResponse }>('/quotes', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  /** Récupère un devis par son ID */
  get: (id: number) =>
    request<{ data: QuoteResponse }>(`/quotes/${id}`),

  /** Met à jour un devis existant */
  update: (id: number, payload: Partial<QuotePayload>) =>
    request<{ message: string; data: QuoteResponse }>(`/quotes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),

  /** Liste paginée des devis */
  list: (page = 1, limit = 20) =>
    request<{
      data: QuoteResponse[];
      total: number;
      page: number;
      pages: number;
    }>(`/quotes?page=${page}&limit=${limit}`),

  /** Supprime un devis */
  delete: (id: number) =>
    request<{ message: string }>(`/quotes/${id}`, { method: 'DELETE' }),
};

// ─── Référentiels ─────────────────────────────────────────────────────────────

export const referentialApi = {
  /** Liste des villes (avec recherche optionnelle) */
  getCities: (search = '') =>
    request<City[]>(`/cities${search ? `?q=${encodeURIComponent(search)}` : ''}`),

  /** Liste des marques par type de véhicule */
  getBrands: (type: 'auto' | 'moto' | '' = '') =>
    request<VehicleBrand[]>(`/brands${type ? `?type=${type}` : ''}`),
};
