
const BASE_URL = '/api';

export async function apiClient(endpoint, { body, ...customConfig } = {}) {
  
  const token = sessionStorage.getItem('token');

  const headers = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let metodoHttp = 'GET';
  if (body) {
    metodoHttp = 'POST';
  }

  const config = {
    method: metodoHttp,
    ...customConfig,
    headers: {
      ...headers,
      ...customConfig.headers,
    },
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, config);

    let data = null;
    try {
      data = await response.json();
    } catch {
      data = null;
    }

    if (!response.ok) {
      
      if (response.status === 401 && !endpoint.includes('/auth/login')) {
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('usuario');
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
        window.location.reload();
      }

      let mensajeError = 'No se pudo conectar con el servidor';
      if (data && data.error) {
        mensajeError = data.error;
      }
      throw new Error(mensajeError);
    }

    return data;
  } catch (error) {
    console.error(`[ERROR API] ${endpoint}:`, error.message);
    throw error;
  }
}
