const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
const SOCKET_SERVER_URL =
  import.meta.env.VITE_SOCKET_SERVER_URL ||
  (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173');

export default {
  API_BASE_URL,
  SOCKET_SERVER_URL,
  API_TIMEOUT: 10000,
  PAGINATION_LIMIT: 10,
};
