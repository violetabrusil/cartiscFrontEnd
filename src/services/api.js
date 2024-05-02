import axios from "axios";

const apiLogin = axios.create({
    //baseURL: 'http://192.168.100.164:1313/cartics',
    //baseURL: 'http://192.168.100.147:1313/cartics',
    headers: {
        'Content-Type': 'application/json',
        'Accept': '*/*',
    },
    timeout: 300000 // 5 minutos
});

apiLogin.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');

    if (token) {
        config.headers.Authorization = token; // Sin el prefijo Bearer
    }

    return config;
}, (error) => {
    return Promise.reject(error);
});


export default apiLogin;
