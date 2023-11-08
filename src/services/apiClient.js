import axios from "axios";

const apiClient = axios.create({

    baseURL: 'http://172.20.10.2:1313/cartics',
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



export default apiClient;
