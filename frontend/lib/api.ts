const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export interface ApiRequestOptions extends RequestInit {
  token?: string;
}

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export const api = {
  getHeaders(options?: ApiRequestOptions): HeadersInit {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    // Client-side execution check
    if (typeof window !== 'undefined') {
      const token = options?.token || localStorage.getItem('access_token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }
    
    return headers;
  },

  async request<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
    const url = `${API_URL}${path}`;
    const headers: Record<string, string> = {
      ...(this.getHeaders(options) as Record<string, string>),
      ...(options.headers as Record<string, string>),
    };

    const res = await fetch(url, {
      ...options,
      headers,
    });

    if (res.status === 401 && path !== '/auth/login' && typeof window !== 'undefined') {
      // Try refresh token
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        try {
          const refreshRes = await fetch(`${API_URL}/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refresh_token: refreshToken }),
          });
          if (refreshRes.ok) {
            const data = await refreshRes.json();
            localStorage.setItem('access_token', data.access_token);
            localStorage.setItem('refresh_token', data.refresh_token);
            
            // Retry request with new token
            headers['Authorization'] = `Bearer ${data.access_token}`;
            const retryRes = await fetch(url, { ...options, headers });
            if (retryRes.ok) return await retryRes.json() as T;
          }
        } catch (e) {
          console.error("Token refresh failed", e);
        }
      }
      
      // Clear storage and redirect if token is expired/invalid
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      throw new ApiError(401, 'Sessão expirada. Faça login novamente.');
    }

    if (!res.ok) {
      let message = 'Ocorreu um erro no servidor';
      try {
        const errorData = await res.json();
        message = errorData.detail || message;
      } catch (err) {}
      throw new ApiError(res.status, message);
    }

    if (res.status === 204) {
      return {} as T;
    }

    return await res.json() as T;
  },

  async get<T>(path: string, options?: ApiRequestOptions): Promise<T> {
    return this.request<T>(path, { ...options, method: 'GET' });
  },

  async post<T>(path: string, body: any, options?: ApiRequestOptions): Promise<T> {
    return this.request<T>(path, {
      ...options,
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  async put<T>(path: string, body: any, options?: ApiRequestOptions): Promise<T> {
    return this.request<T>(path, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(body),
    });
  },

  async delete<T>(path: string, options?: ApiRequestOptions): Promise<T> {
    return this.request<T>(path, { ...options, method: 'DELETE' });
  }
};
