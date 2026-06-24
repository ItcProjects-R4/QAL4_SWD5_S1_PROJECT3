
import api from './axios';

// ── تحويل المفاتيح من PascalCase لـ camelCase (recursive) ──────────────────
function toCamel(key) {
  return key
    .replace(/[_-](\w)/g, (_, c) => c.toUpperCase())
    .replace(/^./, (c) => c.toLowerCase());
}

function normalizeKeys(obj) {
  if (Array.isArray(obj)) {
    return obj.map(normalizeKeys);
  }
  if (obj !== null && typeof obj === 'object' && !(obj instanceof Date)) {
    return Object.fromEntries(
      Object.entries(obj).map(([key, value]) => [toCamel(key), normalizeKeys(value)])
    );
  }
  return obj;
}

export const superadmin = {
  // params: { startDate?: 'YYYY-MM-DD', endDate?: 'YYYY-MM-DD' }
  getDashboard: (params = {}) =>
    api.get('/api/SuperAdmin/dashboard', { params }).then(r => normalizeKeys(r.data.data ?? r.data)),
  getTenants: () => api.get('/api/SuperAdmin/tenants').then(r => normalizeKeys(r.data.data ?? r.data)),
  getTenant: (id) => api.get(`/api/SuperAdmin/tenants/${id}`).then(r => normalizeKeys(r.data.data ?? r.data)),
  toggleTenant: (id) => api.put(`/api/SuperAdmin/tenants/${id}/toggle`).then(r => normalizeKeys(r.data.data ?? r.data)),
  deleteTenant: (id) => api.delete(`/api/SuperAdmin/tenants/${id}`).then(r => r.data),
  getReports: () => api.get('/api/SuperAdmin/reports').then(r => normalizeKeys(r.data.data ?? r.data)),
  getProfile: () => api.get('/api/SuperAdmin/settings/profile').then(r => normalizeKeys(r.data)),
  changePassword: (oldPassword, newPassword) => 
  api.put('/api/SuperAdmin/settings/changepassword', { oldPassword, newPassword }).then(r => r.data),
};