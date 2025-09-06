import axios from 'axios';

const axiosClient = axios.create({
    baseURL: 'http://localhost:3333',
    withCredentials: true,
});

export default axiosClient;