import axios from 'axios';

const axiosClient = axios.create({
    baseURL: 'https://apiadonis.privados.space',
    withCredentials: true
});

export const mapPk = 'pk.eyJ1Ijoiam9zZTQ2NTQiLCJhIjoiY2xzZ3lxMW91MHl5cDJqcHFnajh1bHhoMSJ9.abmU4aR4ERLQHoGaP23KOw';

// Interceptor para incluir el token en cada petición
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("auth_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axiosClient.interceptors.response.use(
  (r) => r,
  (error) => {
    if (error.response?.status === 401) {
      console.warn('No autorizado (401).')
      // opcional: redirigir a login
    }
    return Promise.reject(error)
  }
)


export default axiosClient;