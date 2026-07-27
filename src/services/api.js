import axios from "axios";

const apiLogin = axios.create({
    baseURL: process.env.REACT_APP_API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': '*/*',
    },
    timeout: 300000 // 5 minutos
});

apiLogin.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');

    if (token) {
        config.headers.Authorization = token;
    }

    return config;
}, (error) => {
    return Promise.reject(error);
});

export default apiLogin;