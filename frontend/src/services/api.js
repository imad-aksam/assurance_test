const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api';

async function request(endpoint, options = {}) {
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
    const error = new Error(data.error ?? 'Une erreur est survenue.');
    error.details = data.details;
    error.status = response.status;
    throw error;
  }

  return data;
}

export const quoteApi = {
  create: (payload) =>
    request('/quotes', { method: 'POST', body: JSON.stringify(payload) }),

  get: (id) =>
    request(`/quotes/${id}`),

  update: (id, payload) =>
    request(`/quotes/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),

  list: (page = 1, limit = 20) =>
    request(`/quotes?page=${page}&limit=${limit}`),

  delete: (id) =>
    request(`/quotes/${id}`, { method: 'DELETE' }),
};

export const referentialApi = {
  getCities: (search = '') =>
    request(`/cities${search ? `?q=${encodeURIComponent(search)}` : ''}`),

  getBrands: (type = '') =>
    request(`/brands${type ? `?type=${type}` : ''}`),
};


const api = { ...quoteApi, ...referentialApi };
export default api;