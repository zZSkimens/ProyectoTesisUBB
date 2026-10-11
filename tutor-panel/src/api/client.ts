const BASE_URL = '/api';

export interface RequestConfig extends RequestInit {
  body?: any;
}

export async function apiClient<T = any>(endpoint: string, { body, ...customConfig }: RequestConfig = {}): Promise<T> {
  const token = sessionStorage.getItem('token');

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let metodoHttp = 'GET';
  if (body) {
    metodoHttp = 'POST';
  }

  const config: RequestInit = {
    method: metodoHttp,
    ...customConfig,
    headers: {
      ...headers,
      ...(customConfig.headers as Record<string, string>),
    },
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, config);

    let data: any = null;
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

    return data as T;
  } catch (error: any) {
    console.error(`[ERROR API] ${endpoint}:`, error.message);
    throw error;
  }
}
