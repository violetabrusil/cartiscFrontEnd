import axios from "axios";

const apiAdmin = axios.create({
    
    baseURL: 'http://192.168.0.124:1313/cartics/admin',
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



export default apiAdmin;
