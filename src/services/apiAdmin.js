import axios from "axios";

const apiAdmin = axios.create({

    baseURL: process.env.REACT_APP_API_ADMIN_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': '*/*',
        //'Authorization': `Bearer ${token}`
    },
    timeout: 300000 // 5 minutos

});

apiAdmin.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = token; // Sin el prefijo Bearer
    }

    return config;
}, (error) => {
    return Promise.reject(error);
});

apiAdmin.interceptors.response.use((response) => response, (error) => {
    if (error.response && error.response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.hash = '/login';
        window.location.reload();
    }

    return Promise.reject(error);
});

export default apiAdmin;
