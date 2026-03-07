import { Shop, Product, Order, User, PaginatedResponse, AuthTokens } from '@/types';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://shops-platform.uz/api/v1';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('access_token');
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  if (res.status === 401) {
    const refresh = localStorage.getItem('refresh_token');
    if (refresh) {
      const r = await fetch(`${BASE_URL}/auth/token/refresh/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh }),
      });
      if (r.ok) {
        const data = await r.json();
        localStorage.setItem('access_token', data.access);
        headers['Authorization'] = `Bearer ${data.access}`;
        const retry = await fetch(`${BASE_URL}${path}`, { ...options, headers });
        if (!retry.ok) throw new Error((await retry.json()).detail || 'Xato');
        return retry.json();
      }
    }
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    if (typeof window !== 'undefined') window.location.href = '/login';
    throw new Error('Sessiya tugadi');
  }

  if (!res.ok) {
    let msg = 'Xato yuz berdi';
    try {
      const err = await res.json();
      msg = Object.values(err).flat().join(', ') || err.detail || msg;
    } catch {}
    throw new Error(msg);
  }

  if (res.status === 204) return {} as T;
  return res.json();
}

export const auth = {
  login: (username: string, password: string) =>
    request<AuthTokens>('/auth/token/', { method: 'POST', body: JSON.stringify({ username, password }) }),
  register: (data: { username: string; email?: string; password: string }) =>
    request<User>('/auth/users/', { method: 'POST', body: JSON.stringify(data) }),
};

export const profile = {
  get: () => request<User>('/auth/users/me/'),
  update: (data: Partial<User>) =>
    request<User>('/auth/users/me/', { method: 'PATCH', body: JSON.stringify(data) }),
  changePassword: (data: { current_password: string; new_password: string }) =>
    request('/auth/users/set_password/', { method: 'POST', body: JSON.stringify(data) }),
  changeUsername: (data: { current_password: string; new_username: string }) =>
    request('/auth/users/set_username/', { method: 'POST', body: JSON.stringify(data) }),
  deleteAccount: () => request('/auth/users/me/', { method: 'DELETE' }),
};

export const shops = {
  list: (params?: Record<string, string>) => {
    const q = params ? '?' + new URLSearchParams(params).toString() : '';
    return request<PaginatedResponse<Shop>>(`/shops/${q}`);
  },
  get: (id: number) => request<Shop>(`/shops/${id}/`),
  getBySlug: async (slug: string) => {
    const all = await request<PaginatedResponse<Shop>>(`/shops/`);
    return all.results.find(s => {
      const owner = (s as any).owner_username || '';
      const expectedSlug = `${owner}-${s.name}`.toLowerCase().replace(/\s+/g, '-');
      const byName = s.name.toLowerCase().replace(/\s+/g, '-');
      return expectedSlug === slug || byName === slug || slug.endsWith('-' + byName);
    }) || null;
  },
  create: (data: Partial<Shop>) =>
    request<Shop>('/shops/', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: Partial<Shop>) =>
    request<Shop>(`/shops/${id}/`, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (id: number) => request(`/shops/${id}/`, { method: 'DELETE' }),
};

export const products = {
  list: (params?: Record<string, string>) => {
    const q = params ? '?' + new URLSearchParams(params).toString() : '';
    return request<PaginatedResponse<Product>>(`/products/${q}`);
  },
  get: (id: number) => request<Product>(`/products/${id}/`),
  create: async (data: Partial<Product>) => {
    // Agar rasm fayl bo'lsa (base64) - multipart yuboramiz
    if (data.image && data.image.startsWith('data:')) {
      return uploadWithImage('/products/', 'POST', data);
    }
    return request<Product>('/products/', { method: 'POST', body: JSON.stringify(data) });
  },
  update: async (id: number, data: Partial<Product>) => {
    if (data.image && data.image.startsWith('data:')) {
      return uploadWithImage(`/products/${id}/`, 'PATCH', data);
    }
    return request<Product>(`/products/${id}/`, { method: 'PATCH', body: JSON.stringify(data) });
  },
  delete: (id: number) => request(`/products/${id}/`, { method: 'DELETE' }),
};

// Base64 rasimni FormData orqali yuborish
async function uploadWithImage<T>(path: string, method: string, data: any): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const fd = new FormData();
  
  // Base64 -> Blob -> File
  if (data.image && data.image.startsWith('data:')) {
    const arr = data.image.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) u8arr[n] = bstr.charCodeAt(n);
    const blob = new Blob([u8arr], { type: mime });
    fd.append('image', blob, 'image.' + mime.split('/')[1]);
  }

  // Qolgan maydonlarni qo'shish
  Object.entries(data).forEach(([k, v]) => {
    if (k !== 'image' && v !== undefined && v !== null) {
      fd.append(k, String(v));
    }
  });

  const res = await fetch(`${BASE_URL}${path}`, { method, headers, body: fd });
  if (!res.ok) {
    let msg = 'Xato';
    try { const e = await res.json(); msg = Object.values(e).flat().join(', ') || e.detail || msg; } catch {}
    throw new Error(msg);
  }
  return res.json();
}

export const orders = {
  list: (params?: Record<string, string>) => {
    const q = params ? '?' + new URLSearchParams(params).toString() : '';
    return request<PaginatedResponse<Order>>(`/orders/${q}`);
  },
  get: (id: number) => request<Order>(`/orders/${id}/`),
  create: (data: Partial<Order>) =>
    request<Order>('/orders/', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: number, data: Partial<Order>) =>
    request<Order>(`/orders/${id}/`, { method: 'PATCH', body: JSON.stringify(data) }),
  updateStatus: (id: number, status: string) =>
    request<Order>(`/orders/${id}/`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  delete: (id: number) => request(`/orders/${id}/`, { method: 'DELETE' }),
};
