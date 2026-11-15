const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3001').replace(/\/$/, '');

async function request(path, options = {}) {
  let response;
  try {
    const timeout = AbortSignal.timeout(10000);
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      signal: options.signal ? AbortSignal.any([options.signal, timeout]) : timeout,
      headers: {
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
        ...options.headers,
      },
    });
  } catch (error) {
    if (options.signal?.aborted) throw error;
    throw new Error('Tidak dapat menghubungi backend. Pastikan NestJS berjalan di port 3001 dan koneksi tersedia.', { cause: error });
  }

  if (response.status === 204) return;
  const data = await response.json();
  if (!response.ok) {
    const message = Array.isArray(data.message) ? data.message.join(' ') : data.message;
    throw new Error(message || `Permintaan gagal (HTTP ${response.status}).`);
  }
  return data;
}

export const tradesApi = {
  findAll: (signal) => request('/trades', { signal }),
  findOne: (id) => request(`/trades/${encodeURIComponent(id)}`),
  create: (trade) => request('/trades', { method: 'POST', body: JSON.stringify(trade) }),
  update: (id, trade) => request(`/trades/${encodeURIComponent(id)}`, {
    method: 'PATCH', body: JSON.stringify(trade),
  }),
  remove: (id) => request(`/trades/${encodeURIComponent(id)}`, { method: 'DELETE' }),
};
