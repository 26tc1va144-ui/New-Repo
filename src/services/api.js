/**
 * ResQFood Centralized API Client
 * Connects frontend to the Express dynamic backend & persistent database.
 */

const BASE_URL = '/api';

async function request(endpoint, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };

  const token = localStorage.getItem('resq_auth_token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || `HTTP error ${response.status}`);
  }

  return data;
}

export const authApi = {
  register: (userData) => request('/auth/register', { method: 'POST', body: JSON.stringify(userData) }),
  login: (credentials) => request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  logout: () => request('/auth/logout', { method: 'POST' }),
  getCurrentUser: () => request('/auth/me')
};

export const listingsApi = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/listings${query ? `?${query}` : ''}`);
  },
  getById: (id) => request(`/listings/${id}`),
  getBySeller: (sellerId) => request(`/listings/seller/${sellerId}`),
  create: (listingData) => request('/listings', { method: 'POST', body: JSON.stringify(listingData) }),
  update: (id, updates) => request(`/listings/${id}`, { method: 'PUT', body: JSON.stringify(updates) }),
  delete: (id) => request(`/listings/${id}`, { method: 'DELETE' })
};

export const ordersApi = {
  create: (orderData) => request('/orders', { method: 'POST', body: JSON.stringify(orderData) }),
  createRazorpayOrder: (data) => request('/orders/razorpay/create-order', { method: 'POST', body: JSON.stringify(data) }),
  verifyRazorpayPayment: (data) => request('/orders/razorpay/verify-payment', { method: 'POST', body: JSON.stringify(data) }),
  getById: (id) => request(`/orders/${id}`),
  getByBuyer: (buyerId) => request(`/orders/buyer/${buyerId}`),
  getBySeller: (sellerId) => request(`/orders/seller/${sellerId}`),
  verifyOtp: (otp, sellerId) => request('/orders/verify-otp', { method: 'POST', body: JSON.stringify({ otp, sellerId }) })
};

export const donationsApi = {
  getAvailable: () => request('/donations/available'),
  claim: (claimData) => request('/donations/claim', { method: 'POST', body: JSON.stringify(claimData) }),
  getByNgo: (ngoId) => request(`/donations/claims/${ngoId}`)
};

export const notificationsApi = {
  getAll: (userId) => request(`/notifications/${userId}`),
  markRead: (id) => request(`/notifications/${id}/read`, { method: 'PUT' }),
  markAllRead: (userId) => request(`/notifications/read-all/${userId}`, { method: 'PUT' }),
  create: (notifData) => request('/notifications', { method: 'POST', body: JSON.stringify(notifData) })
};

export const analyticsApi = {
  getSeller: (sellerId) => request(`/analytics/seller/${sellerId}`),
  getImpact: () => request('/analytics/impact'),
  getAdmin: () => request('/analytics/admin'),
  resetDb: () => request('/analytics/reset', { method: 'POST' })
};
