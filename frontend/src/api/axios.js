import axios from 'axios';

// withCredentials is what makes the browser send/receive the httpOnly
// "token" cookie set by the backend. Every request through this instance
// automatically carries the cookie, so components never touch tokens directly.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true,
});

export default api;
