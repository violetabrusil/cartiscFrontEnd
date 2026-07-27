import axios from "axios";

const apiClient = axios.create({

    baseURL: process.env.REACT_APP_API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': '*/*',
        //'Authorization': `Bearer ${token}`
    },
    timeout: 300000 // 5 minutos
});

apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');

    if (token) {
        config.headers.Authorization = token;
    }

    return config;
}, (error) => {
    return Promise.reject(error);
});

apiClient.interceptors.response.use((response) => response, (error) => {
    if (error.response && error.response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.hash = '/login';
        window.location.reload();
    }

    return Promise.reject(error);
});

export default apiClient;
