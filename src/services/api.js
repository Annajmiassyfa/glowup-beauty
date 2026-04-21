export const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const getToken = () => localStorage.getItem('glowup_token') || sessionStorage.getItem('glowup_token');

const authHeaders = () => ({
  'Authorization': `Bearer ${getToken()}`
});

/**
 * Fetches the currently authenticated user's profile from the backend.
 */
export const fetchMyProfile = async () => {
  const res = await fetch(`${BASE_URL}/api/auth/me`, {
    headers: authHeaders()
  });
  if (!res.ok) throw new Error('Gagal mengambil profil');
  const data = await res.json();
  return data.user;
};

/**
 * Updates the user's name and phone.
 * @param {{ name: string, phone: string }} profileData
 */
export const updateMyProfile = async (profileData) => {
  const res = await fetch(`${BASE_URL}/api/users/me`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders()
    },
    body: JSON.stringify(profileData)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Gagal memperbarui profil');
  return data.user;
};

/**
 * Uploads an avatar file. Returns the updated user object with the new avatar URL.
 * @param {File} file - The image file to upload
 */
export const uploadMyAvatar = async (file) => {
  const formData = new FormData();
  formData.append('avatar', file);

  const res = await fetch(`${BASE_URL}/api/users/me/avatar`, {
    method: 'PUT',
    headers: authHeaders(), // Do NOT set Content-Type here; browser will set it with boundary
    body: formData
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Gagal mengunggah foto profil');
  return data.user;
};

/**
 * Activate membership for the logged-in user.
 * Returns the updated user object with isMember=true, memberTier, memberSince, rewardPoints.
 */
export const activateMembership = async () => {
  const res = await fetch(`${BASE_URL}/api/users/me/membership`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders()
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Gagal mengaktifkan membership');
  return data.user;
};

/**
 * Helper: builds the full URL for a server-hosted asset.
 * If the path already looks like a full URL (http/blob), return as-is.
 * @param {string} path
 */
export const assetUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http') || path.startsWith('blob:')) return path;
  return `${BASE_URL}${path}`;
};

// ─────────────────────────────────────────────
// Product API
// ─────────────────────────────────────────────

/** Fetch all active products from the backend. */
export const fetchProducts = async () => {
  const res = await fetch(`${BASE_URL}/api/products`);
  if (!res.ok) throw new Error('Gagal mengambil data produk');
  return res.json(); // returns array of products
};

/**
 * Create a new product. Sends multipart/form-data.
 * @param {object} fields - { name, price, stock, description, ingredients, usage }
 * @param {File|null} imageFile - optional image file
 */
export const createProduct = async (fields, imageFile) => {
  const formData = new FormData();
  Object.entries(fields).forEach(([key, val]) => {
    if (val !== null && val !== undefined && val !== '') formData.append(key, val);
  });
  if (imageFile) formData.append('image', imageFile);

  const res = await fetch(`${BASE_URL}/api/products`, {
    method: 'POST',
    headers: authHeaders(),
    body: formData,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Gagal menambahkan produk');
  return data.product;
};

/**
 * Update an existing product. Sends multipart/form-data.
 * @param {number|string} id
 * @param {object} fields
 * @param {File|null} imageFile
 */
export const updateProduct = async (id, fields, imageFile) => {
  const formData = new FormData();
  Object.entries(fields).forEach(([key, val]) => {
    if (val !== null && val !== undefined && val !== '') formData.append(key, val);
  });
  if (imageFile) formData.append('image', imageFile);

  const res = await fetch(`${BASE_URL}/api/products/${id}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: formData,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Gagal memperbarui produk');
  return data.product;
};

/**
 * Delete a product by ID.
 * @param {number|string} id
 */
export const deleteProduct = async (id) => {
  const res = await fetch(`${BASE_URL}/api/products/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Gagal menghapus produk');
  return data;
};

// ─────────────────────────────────────────────
// Address API
// ─────────────────────────────────────────────

/** Fetch all addresses for the logged-in user. */
export const fetchAddresses = async () => {
  const res = await fetch(`${BASE_URL}/api/addresses`, { headers: authHeaders() });
  if (!res.ok) throw new Error('Gagal mengambil data alamat');
  return res.json();
};

/**
 * Create a new address.
 * @param {object} data
 */
export const createAddress = async (data) => {
  const res = await fetch(`${BASE_URL}/api/addresses`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Gagal menambahkan alamat');
  return json.address;
};

/**
 * Update an existing address.
 * @param {number} id
 * @param {object} data
 */
export const updateAddress = async (id, data) => {
  const res = await fetch(`${BASE_URL}/api/addresses/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Gagal memperbarui alamat');
  return json.address;
};

/**
 * Delete an address by ID.
 * @param {number} id
 */
export const deleteAddress = async (id) => {
  const res = await fetch(`${BASE_URL}/api/addresses/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Gagal menghapus alamat');
  return json;
};

/**
 * Set an address as primary. Returns the full updated list.
 * @param {number} id
 */
export const setPrimaryAddress = async (id) => {
  const res = await fetch(`${BASE_URL}/api/addresses/${id}/primary`, {
    method: 'PUT',
    headers: authHeaders(),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Gagal mengubah alamat utama');
  return json.addresses; // full updated list returned by backend
};

// ─────────────────────────────────────────────
// Order API
// ─────────────────────────────────────────────

/** Fetch all orders for logged-in user */
export const fetchOrders = async () => {
  const res = await fetch(`${BASE_URL}/api/orders`, { headers: authHeaders() });
  if (!res.ok) throw new Error('Gagal mengambil riwayat pesanan');
  return res.json();
};

/** Fetch a single order by ID */
export const fetchOrderById = async (id) => {
  const res = await fetch(`${BASE_URL}/api/orders/${id}`, { headers: authHeaders() });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Gagal mengambil detail pesanan');
  return json;
};

/**
 * Create a new order.
 * @param {object} payload - { items, subtotal, shippingCost, grandTotal, paymentMethod, shippingSnapshot }
 */
export const createOrder = async (payload) => {
  const res = await fetch(`${BASE_URL}/api/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(payload),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Gagal membuat pesanan');
  return json.order;
};

/**
 * Mark an order as completed (Pesanan Diterima).
 * @param {number} id
 */
export const completeOrder = async (id) => {
  const res = await fetch(`${BASE_URL}/api/orders/${id}/complete`, {
    method: 'PATCH',
    headers: authHeaders(),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Gagal menyelesaikan pesanan');
  // Returns { order, user, pointsEarned, message }
  return json;
};

// ─────────────────────────────────────────────
// Return Request API
// ─────────────────────────────────────────────

/**
 * Submit a new return request for a completed order.
 * @param {{ orderId, orderItemId?, productName, reason, detail }} payload
 */
export const submitReturn = async (payload) => {
  const res = await fetch(`${BASE_URL}/api/returns`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(payload),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Gagal mengirim pengajuan retur');
  return json.returnRequest;
};

/** Fetch all return requests for the logged-in user */
export const fetchMyReturns = async () => {
  const res = await fetch(`${BASE_URL}/api/returns`, { headers: authHeaders() });
  if (!res.ok) throw new Error('Gagal mengambil daftar retur');
  return res.json();
};

/**
 * Fetch return requests for a specific order.
 * @param {number} orderId
 */
export const fetchReturnsByOrder = async (orderId) => {
  const res = await fetch(`${BASE_URL}/api/returns/order/${orderId}`, { headers: authHeaders() });
  if (!res.ok) throw new Error('Gagal mengambil retur pesanan');
  return res.json();
};

// ─────────────────────────────────────────────
// Admin Return API
// ─────────────────────────────────────────────

/** Admin: fetch all return requests. Optional: pass status filter string. */
export const adminFetchAllReturns = async (statusFilter = '') => {
  const qs = statusFilter ? `?status=${statusFilter}` : '';
  const res = await fetch(`${BASE_URL}/api/returns/admin/all${qs}`, { headers: authHeaders() });
  if (!res.ok) throw new Error('Gagal mengambil daftar retur');
  return res.json();
};

/**
 * Admin: update status of a return request.
 * @param {number} id
 * @param {string} status - 'Approved' | 'Rejected' | 'Completed'
 */
export const adminUpdateReturnStatus = async (id, status) => {
  const res = await fetch(`${BASE_URL}/api/returns/admin/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ status }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Gagal mengubah status retur');
  return json.returnRequest;
};

// ─────────────────────────────────────────────
// Admin Operations API
// ─────────────────────────────────────────────

/** Admin: fetch dashboard stats */
export const adminFetchStats = async () => {
  const res = await fetch(`${BASE_URL}/api/admin/stats`, { headers: authHeaders() });
  if (!res.ok) throw new Error('Gagal mengambil statistik admin');
  return res.json();
};

/** Admin: fetch all orders */
export const adminFetchOrders = async () => {
  const res = await fetch(`${BASE_URL}/api/admin/orders`, { headers: authHeaders() });
  if (!res.ok) throw new Error('Gagal mengambil daftar pesanan');
  return res.json();
};

/**
 * Admin: update order status/tracking.
 * @param {number} id
 * @param {object} payload - { orderStatus, paymentStatus, trackingNumber }
 */
export const adminUpdateOrder = async (id, payload) => {
  const res = await fetch(`${BASE_URL}/api/admin/orders/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(payload),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Gagal memperbarui pesanan');
  return json.order;
};

// ── Review API ──
export const submitReview = async (payload) => {
  const res = await fetch(`${BASE_URL}/api/reviews`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(payload),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Gagal mengirim ulasan');
  return json.review;
};
export const fetchProductReviews = async (productId) => {
  const res = await fetch(`${BASE_URL}/api/reviews/product/${productId}`);
  if (!res.ok) throw new Error('Gagal mengambil ulasan produk');
  return res.json();
};
export const fetchHomeReviews = async () => {
  const res = await fetch(`${BASE_URL}/api/reviews/home`);
  if (!res.ok) throw new Error('Gagal mengambil ulasan terbaru');
  return res.json();
};
