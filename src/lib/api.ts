const BASE_URL = '/api';

function getHeaders(customHeaders?: HeadersInit): HeadersInit {
  const tzOffset = typeof window !== 'undefined' ? new Date().getTimezoneOffset().toString() : '0';
  return {
    'Content-Type': 'application/json',
    'x-timezone-offset': tzOffset,
    ...(customHeaders || {})
  };
}

export const api = {
  get: async <T>(endpoint: string): Promise<T> => {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      headers: getHeaders()
    });
    if (!res.ok) {
      throw new Error(`API Error: ${res.statusText}`);
    }
    return res.json();
  },
  post: async <T>(endpoint: string, body?: any): Promise<T> => {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: getHeaders(),
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) {
      throw new Error(`API Error: ${res.statusText}`);
    }
    return res.json();
  },
  put: async <T>(endpoint: string, body?: any): Promise<T> => {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) throw new Error(`API Error: ${res.statusText}`);
    return res.json();
  },
  delete: async <T>(endpoint: string): Promise<T> => {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    if (!res.ok) throw new Error(`API Error: ${res.statusText}`);
    return res.json();
  }
};
