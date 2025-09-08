import axios from 'axios';

const axiosClient = axios.create({
    baseURL: 'http://localhost:3333',
    withCredentials: true,
});

// Interceptor para incluir el token en cada petición
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("auth_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});


export default axiosClient;